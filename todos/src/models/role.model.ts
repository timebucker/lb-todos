import { Entity, model, property, belongsTo, hasMany } from '@loopback/repository';
import { DefinePermission, DefineRole } from '../types';
import { User } from './user.model';

@model()
export class Role extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property.array(Number)
  permissions: number[];

  @property({
    type: 'number',
  })
  userId?: number;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;
