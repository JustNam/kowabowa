import type { IAdapterWithList } from '@/interfaces/adapter.model'
import type { ICompetencyDatabaseModel, ICompetencyModel } from '@/interfaces/competency.model'

export class CompetencyAdapter
  implements IAdapterWithList<ICompetencyDatabaseModel, ICompetencyModel>
{
  toFrontend(dbData: ICompetencyDatabaseModel): ICompetencyModel {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      title: dbData.title,
      createdAt: dbData.created_at,
      isSystem: dbData.is_system // bổ sung thêm vì chưa thấy
    }
  }

  toDatabase(frontendData: ICompetencyModel): ICompetencyDatabaseModel {
    return {
      id: frontendData.id,
      user_id: frontendData.userId,
      title: frontendData.title,
      created_at: frontendData.createdAt,
      is_system: frontendData.isSystem // bổ sung thêm vì chưa thấy
    }
  }

  listToFrontend(dbList: ICompetencyDatabaseModel[]): ICompetencyModel[] {
    return dbList.map((item) => this.toFrontend(item))
  }

  listToDatabase(frontendList: ICompetencyModel[]): ICompetencyDatabaseModel[] {
    return frontendList.map((item) => this.toDatabase(item))
  }
}

export const competencyAdapter = new CompetencyAdapter()
