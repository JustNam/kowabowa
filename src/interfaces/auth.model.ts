import type { User } from '@supabase/supabase-js'

export type IUserModel = User

export interface IAuthState {
  user: IUserModel | null
  loading: boolean
  error: string | null
}

export interface IAuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
