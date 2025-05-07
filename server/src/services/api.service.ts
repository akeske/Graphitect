/** @format */

import { AppDataSource } from '../data-source';
import Api from '../entities/Api';

export class ApiService {
  static async createApi(data: Partial<Api>): Promise<Api> {
    const repo = AppDataSource.getRepository(Api);
    const api = repo.create(data);
    return await repo.save(api);
  }

  static async getApis(): Promise<Api[]> {
    const noteRepo = AppDataSource.getRepository(Api);
    return await noteRepo.find();
  }

  static async deleteApi(id: number): Promise<Api | null> {
    const repo = AppDataSource.getRepository(Api);
    const apiToDelete = await repo.findOne({ where: { id } });
    if (apiToDelete) {
      await repo.remove(apiToDelete);
    }
    return apiToDelete;
  }

  static async updateApi(id: number, data: Partial<Api>) {
    const repo = AppDataSource.getRepository(Api);
    const apiToUpdate = await repo.findOne({
      where: { id },
    });
    if (apiToUpdate) {
      Object.assign(apiToUpdate, data);
      await repo.save(apiToUpdate);
    }
    return await repo.findOne({ where: { id } });
  }

  static async getApiById(id: number) {
    const repo = AppDataSource.getRepository(Api);
    return await repo.findOne({ where: { id } });
  }

  static async getApisByWorkspaceId(workspaceId: number) {
    const repo = AppDataSource.getRepository(Api);
    let query = repo.createQueryBuilder('api');

    if (workspaceId) {
      query = query.where('api.workspaceId = :workspaceId', { workspaceId });
    }
    const apis = await query.getMany();
    return apis;
  }
}
