/** @format */

import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, BaseEntity, ManyToOne } from 'typeorm';
import Api from './Api';

@Entity()
export default class ApiStatus extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  status?: 'up' | 'down' | 'error';

  @Column({ nullable: true })
  message?: string;

  @Column()
  lastChecked!: Date;

  @ManyToOne(() => Api, (api) => api.statuses, { onDelete: 'CASCADE' })
  api?: Api;
}
