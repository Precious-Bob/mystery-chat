export interface ITemplateRepository {
  findById(id: string): Promise<unknown>;
}

//should resolved to prommise<emailTemplate>  but entity not created yet
