export default {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  SUPABASE_URL: process.env.SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*'
}
