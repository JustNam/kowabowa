import { backendApi } from '@/lib/backendApi'
import { profileAdapter } from '@/adapters'
import type { IProfileDatabaseModel, IProfileModel } from '@/interfaces/profile.model'

export class ProfilesApi {
  // No id in the URL — the Edge Function resolves the user from the Bearer token.
  static async me(): Promise<{ data: IProfileModel }> {
    const response = await backendApi.get<{ data: IProfileDatabaseModel }>('/profiles')
    return { data: profileAdapter.toFrontend(response.data.data) }
  }
}
