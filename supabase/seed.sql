-- Development seed data for CPN App
-- This file contains test data for local development

-- Insert test users (these will be created through Supabase Auth in real usage)
-- Note: In production, users are created via auth.users, this is just for testing database functions

-- Insert test onboarding session for testing migration flow
INSERT INTO onboarding_sessions (
  session_token,
  girl_data,
  data_entries,
  expires_at
) VALUES (
  'test-session-token-123',
  '{
    "name": "Test Sally",
    "age": 25,
    "rating": 8.5,
    "ethnicity": "Mixed",
    "hairColor": "Brown",
    "locationCity": "New York",
    "locationCountry": "USA"
  }',
  '[
    {
      "date": "2024-09-28",
      "amountSpent": 150.00,
      "durationMinutes": 210,
      "numberOfNuts": 2
    },
    {
      "date": "2024-09-25",
      "amountSpent": 80.00,
      "durationMinutes": 120,
      "numberOfNuts": 1
    }
  ]',
  NOW() + INTERVAL '24 hours'
);

-- Test onboarding session with minimal data
INSERT INTO onboarding_sessions (
  session_token,
  girl_data,
  expires_at
) VALUES (
  'test-session-minimal-456',
  '{
    "name": "Jane Doe",
    "age": 22,
    "rating": 7.0
  }',
  NOW() + INTERVAL '12 hours'
);

-- Expired session for cleanup testing
INSERT INTO onboarding_sessions (
  session_token,
  girl_data,
  expires_at
) VALUES (
  'expired-session-789',
  '{"name": "Expired Test", "age": 26}',
  NOW() - INTERVAL '1 hour'
);

-- The following would be created in real usage via Supabase Auth + API calls
-- but included here for testing database functions and RLS policies

/*
Example of what gets created through normal app flow:

1. User signs up via Supabase Auth -> creates auth.users record
2. Our trigger or API call creates corresponding users table record
3. User creates girls profiles via API
4. User adds data entries via API

For testing purposes, you can manually test the functions:
- SELECT calculate_girl_metrics('<girl_id>');
- SELECT get_girls_with_metrics('<user_id>');
- SELECT migrate_onboarding_session('test-session-token-123', '<user_id>');
- SELECT cleanup_expired_sessions();
*/

-- Comments
COMMENT ON TABLE onboarding_sessions IS 'Contains test data for onboarding flow - test-session-token-123 has complete data, test-session-minimal-456 has minimal data, expired-session-789 tests cleanup';