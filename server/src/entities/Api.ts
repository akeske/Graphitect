/** @format */

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, OneToMany } from 'typeorm';
import Workspace from './Workspace';
import ApiStatus from './ApiStatus';

@Entity()
export default class Api extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  url!: string;

  @Column({ default: 'GET' })
  method?: string;

  @Column('json', { nullable: true })
  headers?: { key: string; value: string; description: string }[];

  @Column('json', { nullable: true })
  params?: { key: string; value: string; description: string }[];

  @Column('text', { nullable: true })
  body?: string;

  @Column('simple-json', { nullable: true })
  info?: { [key: string]: string };

  @Column('simple-json', { nullable: true })
  auth?: {
    type: 'jwt' | 'apiKey' | 'oauth' | 'basic';
    value: string;
    header?: string;
  };

  @Column('text', { nullable: true })
  schema?: string;

  @Column({ nullable: true })
  intervalMinutes?: number;

  @ManyToOne(() => Workspace, (workspace) => workspace.apis, { onDelete: 'CASCADE' })
  workspace?: Workspace;

  @OneToMany(() => ApiStatus, (status) => status.api)
  statuses?: ApiStatus[];
}
