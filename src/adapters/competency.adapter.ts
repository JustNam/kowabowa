import type { IAdapterWithList } from '@/interfaces/adapter.model'
import type { ICompetencyDatabaseModel, ICompetencyModel } from '@/interfaces/competency.model'

export class CompetencyAdapter
  implements IAdapterWithList<ICompetencyDatabaseModel, ICompetencyModel>
{
  toFrontend(dbData: ICompetencyDatabaseModel): ICompetencyModel {
    return {
      id: dbData.id,
      userId: dbData.user_id,
      name: dbData.name,
      createdAt: dbData.created_at,
    }
  }

  toDatabase(frontendData: ICompetencyModel): ICompetencyDatabaseModel {
    return {
      id: frontendData.id,
      user_id: frontendData.userId,
      name: frontendData.name,
      created_at: frontendData.createdAt,
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
