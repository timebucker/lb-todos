import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {Project} from './project.model';
import {Todolist} from './todolist.model';
import {Role} from './role.model';

@model()
export class User extends Entity {
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
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @belongsTo(() => Project)
  projectId: number;

  @hasMany(() => Todolist)
  todolists: Todolist[];

  @hasMany(() => Role)
  roles: Role[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
