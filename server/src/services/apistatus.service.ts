/** @format */

import { AppDataSource } from '../data-source';
import ApiStatus from '../entities/ApiStatus';

export class ApiStatusService {
  static async getStatusesByApiId(apiId: number) {
    return await AppDataSource.getRepository(ApiStatus)
      .createQueryBuilder('status')
      .leftJoin('status.api', 'api')
      .where('api.id = :apiId', { apiId })
      .orderBy('status.lastChecked', 'ASC') // Optional: sort by most recent
      .getMany();
  }

  static async saveApiStatus(data: Partial<ApiStatus>): Promise<ApiStatus> {
    const repo = AppDataSource.getRepository(ApiStatus);
    const apiStatus = repo.create(data);
    return await repo.save(apiStatus);
  }
}
