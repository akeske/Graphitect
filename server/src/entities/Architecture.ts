/** @format */

import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export default class Architecture extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column('text', { nullable: true })
  schema?: string;

  @Column('text', { nullable: true })
  graph?: string;
}
