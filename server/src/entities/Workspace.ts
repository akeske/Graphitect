/** @format */

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import Api from './Api';

@Entity()
export default class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => Api, (api) => api.workspace, { cascade: true })
  apis?: Api[];
}
