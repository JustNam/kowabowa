import { backendApi } from '@/lib/backendApi'
import { profileAdapter } from '@/adapters'
import type { IProfileDatabaseModel, IProfileModel } from '@/interfaces/profile.model'

export class ProfilesApi {
  // No id in the URL — the Edge Function resolves the user from the Bearer token.
  static async me(): Promise<{ data: IProfileModel }> {
    const response = await backendApi.get<{ data: IProfileDatabaseModel }>('/profiles')
    return { data: profileAdapter.toFrontend(response.data.data) }
  }

  // Đánh dấu completed onboarding
  static async completeOnboarding(): Promise<{data: IProfileModel}> {
    const response = await backendApi.patch<{ data: IProfileDatabaseModel}>('/profiles')
    return {data: profileAdapter.toFrontend(response.data.data)}
  }

  // Sửa họ tên, ngày sinh. dateOfBirth dạng YYYY-MM-DD
  static async updateProfile(values: {
    firstName: string
    lastName: string
    dateOfBirth: string
  }): Promise<{data: IProfileModel}> {
    const response = await backendApi.put<{data: IProfileDatabaseModel}>('/profiles', {
      first_name: values.firstName,
      last_name: values.lastName,
      date_of_birth: values.dateOfBirth,
    })
    return {data: profileAdapter.toFrontend(response.data.data)}
  }
}
