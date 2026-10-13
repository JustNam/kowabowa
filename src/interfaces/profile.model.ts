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
  created_at: string
  display_name: string | null
  email: string
  username: string | null
  obd_completed: boolean | null
  first_name: string | null
  last_name: string | null
  date_of_birth: string | null
}

export interface IProfileModel {
  id: string
  createdAt: string
  displayName: string | null
  email: string
  username: string | null
  obdCompleted: boolean
  firstName: string | null
  lastName: string | null
  dateOfBirth: string | null
}
