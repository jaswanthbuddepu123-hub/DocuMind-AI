const { createClient } = require('@supabase/supabase-js');
const env = require('../../config/env');

// Use the service role key to bypass RLS and have full access from the backend
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = supabase;
