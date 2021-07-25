import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Todo} from './todo.model';
import {User} from './user.model';

@model()
export class Todolist extends Entity {
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
  title: string;

  @hasMany(() => Todo)
  todos: Todo[];

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<Todolist>) {
    super(data);
  }
}

export interface TodolistRelations {
  // describe navigational properties here
}

export type TodolistWithRelations = Todolist & TodolistRelations;
