import type { IDataAdapter } from "@/interfaces/adapter.model";
import type { IProfileDatabaseModel, IProfileModel } from "@/interfaces/profile.model";

export class ProfileAdapter
implements IDataAdapter<IProfileDatabaseModel, IProfileModel>
{
    toFrontend(dbData: IProfileDatabaseModel): IProfileModel {
        return {
            id: dbData.id,
            createdAt: dbData.created_at,
            displayName: dbData.display_name,
            email: dbData.email,
            username: dbData.username,
            obdCompleted: Boolean(dbData.obd_completed),
            firstName: dbData.first_name,
            lastName: dbData.last_name,
            dateOfBirth: dbData.date_of_birth,
    }}

    toDatabase(frontendData: IProfileModel): IProfileDatabaseModel {
        return {
            id: frontendData.id,
            created_at: frontendData.createdAt,
            display_name: frontendData.displayName,
            email: frontendData.email,
            username: frontendData.username,
            obd_completed: frontendData.obdCompleted,
            first_name: frontendData.firstName,
            last_name: frontendData.lastName,
            date_of_birth: frontendData.dateOfBirth,

        }
    }
}

export const profileAdapter = new ProfileAdapter()
