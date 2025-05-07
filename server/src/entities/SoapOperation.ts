/** @format */

import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class SoapOperation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  wsdlUrl!: string;

  @Column()
  service!: string;

  @Column()
  port!: string;

  @Column()
  operation!: string;

  @Column('text')
  soapAction!: string;

  @Column('simple-json', { nullable: true })
  input!: Record<string, any>;

  @Column('simple-json', { nullable: true })
  output!: Record<string, any>;
}
