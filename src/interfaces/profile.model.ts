/**
 * Companion row to auth.users, created automatically by the
 * `on_auth_user_created` trigger (kowabowa-backend/supabase/migrations/
 * 20260100000000_create_profiles_table.sql) — never written to directly
 * from application code on signup. No API route/page reads or writes
 * this yet; it exists so profile data has somewhere to live that isn't
 * `auth.users`, which Supabase Auth owns.
 */
export interface IProfileDatabaseModel {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface IProfileModel {
  id: string
  fullName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}
