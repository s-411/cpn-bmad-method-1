-- CPN App Initial Database Schema
-- This migration creates the complete database structure for the CPN app
-- Database-first approach to prevent migration disasters

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (integrates with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  subscription_tier TEXT DEFAULT 'boyfriend'
    CHECK (subscription_tier IN ('boyfriend', 'player', 'lifetime')),
  subscription_status TEXT DEFAULT 'active'
    CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Girls table (dating profiles)
CREATE TABLE girls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  rating DECIMAL(3,1) NOT NULL DEFAULT 6.0
    CHECK (rating >= 5.0 AND rating <= 10.0 AND (rating * 10)::INTEGER % 5 = 0),
  ethnicity TEXT,
  hair_color TEXT,
  location_city TEXT,
  location_country TEXT,
  nationality TEXT, -- Backward compatibility with existing data
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data entries table (expense/outcome tracking)
CREATE TABLE data_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  girl_id UUID REFERENCES girls(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_spent DECIMAL(10,2) NOT NULL CHECK (amount_spent >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
  number_of_nuts INTEGER NOT NULL CHECK (number_of_nuts >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding sessions (anonymous data persistence)
CREATE TABLE onboarding_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  girl_data JSONB,
  data_entries JSONB DEFAULT '[]'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_girls_user_id ON girls(user_id);
CREATE INDEX idx_girls_user_active ON girls(user_id, is_active);
CREATE INDEX idx_data_entries_user_id ON data_entries(user_id);
CREATE INDEX idx_data_entries_girl_id ON data_entries(girl_id);
CREATE INDEX idx_data_entries_date ON data_entries(date);
CREATE INDEX idx_data_entries_user_girl ON data_entries(user_id, girl_id);
CREATE INDEX idx_onboarding_token ON onboarding_sessions(session_token);
CREATE INDEX idx_onboarding_expires ON onboarding_sessions(expires_at);

-- Row Level Security policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE girls ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own profile" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own girls" ON girls
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data entries" ON data_entries
  FOR ALL USING (auth.uid() = user_id);

-- Onboarding sessions accessible by session token
-- Note: Access control will be handled at application level using session_token parameter
CREATE POLICY "Session token access" ON onboarding_sessions
  FOR ALL USING (true);

-- Automatic updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_girls_updated_at BEFORE UPDATE ON girls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_entries_updated_at BEFORE UPDATE ON data_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Real-time metrics calculation function
CREATE OR REPLACE FUNCTION calculate_girl_metrics(girl_uuid UUID)
RETURNS TABLE (
  total_spent DECIMAL(10,2),
  total_nuts INTEGER,
  total_minutes INTEGER,
  cost_per_nut DECIMAL(10,2),
  time_per_nut DECIMAL(10,2),
  entry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(amount_spent), 0) as total_spent,
    COALESCE(SUM(number_of_nuts), 0) as total_nuts,
    COALESCE(SUM(duration_minutes), 0) as total_minutes,
    CASE
      WHEN SUM(number_of_nuts) > 0 THEN ROUND(SUM(amount_spent) / SUM(number_of_nuts), 2)
      ELSE 0
    END as cost_per_nut,
    CASE
      WHEN SUM(number_of_nuts) > 0 THEN ROUND(SUM(duration_minutes)::DECIMAL / SUM(number_of_nuts), 2)
      ELSE 0
    END as time_per_nut,
    COUNT(*)::INTEGER as entry_count
  FROM data_entries
  WHERE girl_id = girl_uuid AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get girls with metrics (for API endpoints)
CREATE OR REPLACE FUNCTION get_girls_with_metrics(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  age INTEGER,
  rating DECIMAL(3,1),
  ethnicity TEXT,
  hair_color TEXT,
  location_city TEXT,
  location_country TEXT,
  nationality TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_spent DECIMAL(10,2),
  total_nuts INTEGER,
  total_minutes INTEGER,
  cost_per_nut DECIMAL(10,2),
  time_per_nut DECIMAL(10,2),
  entry_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.user_id,
    g.name,
    g.age,
    g.rating,
    g.ethnicity,
    g.hair_color,
    g.location_city,
    g.location_country,
    g.nationality,
    g.is_active,
    g.created_at,
    g.updated_at,
    COALESCE(m.total_spent, 0) as total_spent,
    COALESCE(m.total_nuts, 0) as total_nuts,
    COALESCE(m.total_minutes, 0) as total_minutes,
    COALESCE(m.cost_per_nut, 0) as cost_per_nut,
    COALESCE(m.time_per_nut, 0) as time_per_nut,
    COALESCE(m.entry_count, 0) as entry_count
  FROM girls g
  LEFT JOIN LATERAL calculate_girl_metrics(g.id) m ON true
  WHERE g.user_id = user_uuid AND g.user_id = auth.uid()
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup expired onboarding sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM onboarding_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to migrate onboarding session data to permanent user account
CREATE OR REPLACE FUNCTION migrate_onboarding_session(session_token TEXT, target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  session_record RECORD;
  new_girl_id UUID;
  entry_data JSONB;
BEGIN
  -- Get session data
  SELECT * INTO session_record
  FROM onboarding_sessions
  WHERE onboarding_sessions.session_token = migrate_onboarding_session.session_token
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Create girl profile if exists
  IF session_record.girl_data IS NOT NULL THEN
    INSERT INTO girls (
      user_id,
      name,
      age,
      rating,
      ethnicity,
      hair_color,
      location_city,
      location_country,
      nationality
    )
    VALUES (
      target_user_id,
      (session_record.girl_data->>'name')::TEXT,
      (session_record.girl_data->>'age')::INTEGER,
      COALESCE((session_record.girl_data->>'rating')::DECIMAL(3,1), 6.0),
      (session_record.girl_data->>'ethnicity')::TEXT,
      (session_record.girl_data->>'hairColor')::TEXT,
      (session_record.girl_data->>'locationCity')::TEXT,
      (session_record.girl_data->>'locationCountry')::TEXT,
      (session_record.girl_data->>'nationality')::TEXT
    )
    RETURNING id INTO new_girl_id;

    -- Create data entries if they exist
    IF session_record.data_entries IS NOT NULL AND jsonb_array_length(session_record.data_entries) > 0 THEN
      FOR entry_data IN SELECT * FROM jsonb_array_elements(session_record.data_entries)
      LOOP
        INSERT INTO data_entries (
          user_id,
          girl_id,
          date,
          amount_spent,
          duration_minutes,
          number_of_nuts
        )
        VALUES (
          target_user_id,
          new_girl_id,
          (entry_data->>'date')::DATE,
          (entry_data->>'amountSpent')::DECIMAL(10,2),
          (entry_data->>'durationMinutes')::INTEGER,
          (entry_data->>'numberOfNuts')::INTEGER
        );
      END LOOP;
    END IF;
  END IF;

  -- Clean up session
  DELETE FROM onboarding_sessions WHERE onboarding_sessions.session_token = migrate_onboarding_session.session_token;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE girls;
ALTER PUBLICATION supabase_realtime ADD TABLE data_entries;

-- Comments for documentation
COMMENT ON TABLE users IS 'User accounts with subscription information';
COMMENT ON TABLE girls IS 'Dating profiles for tracking expenses and outcomes';
COMMENT ON TABLE data_entries IS 'Individual dating interaction records with expenses, time, and outcomes';
COMMENT ON TABLE onboarding_sessions IS 'Temporary storage for anonymous user data during onboarding';
COMMENT ON FUNCTION calculate_girl_metrics(UUID) IS 'Calculates aggregated metrics for a specific girl profile';
COMMENT ON FUNCTION get_girls_with_metrics(UUID) IS 'Returns all girls for a user with calculated metrics';
COMMENT ON FUNCTION migrate_onboarding_session(TEXT, UUID) IS 'Migrates anonymous session data to permanent user account';
COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Removes expired onboarding sessions';