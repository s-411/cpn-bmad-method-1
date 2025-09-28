-- Database Test Script
-- Run these queries to verify your database is working correctly

-- 1. Check all tables exist
SELECT 'Tables created:' as test_section;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Check all functions exist
SELECT 'Functions created:' as test_section;
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 3. Test calculate_girl_metrics function (with no data)
SELECT 'Testing calculate_girl_metrics function:' as test_section;
SELECT * FROM calculate_girl_metrics('00000000-0000-0000-0000-000000000000'::uuid);

-- 4. Test onboarding session creation
SELECT 'Testing onboarding session:' as test_section;
INSERT INTO onboarding_sessions (session_token, girl_data)
VALUES ('test-token-123', '{"name": "Test Girl", "age": 25, "rating": 8.5}'::jsonb)
RETURNING id, session_token, created_at;

-- 5. Check RLS policies are enabled
SELECT 'Checking RLS policies:' as test_section;
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 6. Clean up test data
DELETE FROM onboarding_sessions WHERE session_token = 'test-token-123';

SELECT 'Database schema verification complete! ✅' as result;