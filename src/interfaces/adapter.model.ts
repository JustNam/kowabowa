export interface IDataAdapter<TDatabase, TFrontend> {
  toFrontend(dbData: TDatabase): TFrontend
  toDatabase(frontendData: TFrontend): TDatabase
}

export interface IListAdapter<TDatabase, TFrontend> {
  listToFrontend(dbList: TDatabase[]): TFrontend[]
  listToDatabase(frontendList: TFrontend[]): TDatabase[]
}

export interface IAdapterWithList<TDatabase, TFrontend>
  extends IDataAdapter<TDatabase, TFrontend>,
    IListAdapter<TDatabase, TFrontend> {}
