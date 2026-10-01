import { api } from '@/lib/axios'
import type { IUserModel } from '@/interfaces/auth.model'

export class AuthApi {
  static async signIn(email: string, password: string): Promise<{ data: { user: IUserModel } }> {
    const response = await api.post('/api/auth/signin', { email, password })
    return { data: response.data }
  }

  static async signUp(
    email: string,
    password: string
  ): Promise<{ data: { user: IUserModel | null } }> {
    const response = await api.post('/api/auth/signup', { email, password })
    return { data: response.data }
  }

  static async signOut(): Promise<void> {
    await api.post('/api/auth/signout')
  }
}
