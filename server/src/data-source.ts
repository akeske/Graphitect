/** @format */

import { DataSource } from 'typeorm';
import Workspace from './entities/Workspace';
import ApiStatus from './entities/ApiStatus';
import Architecture from './entities/Architecture';
import Api from './entities/Api';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'db.sqlite',
  synchronize: true,
  logging: false,
  entities: [Api, Workspace, ApiStatus, Architecture],
  migrations: [],
  subscribers: [],
});
