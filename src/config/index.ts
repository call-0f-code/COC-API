export default {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL!,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY!,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*'
}
