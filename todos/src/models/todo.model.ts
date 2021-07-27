import {Entity, model, property, belongsTo, hasOne} from '@loopback/repository';
import {Todolist} from './todolist.model';
import {Project} from './project.model';

@model()
export class Todo extends Entity {
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

  @property({
    type: 'boolean',
    required: true,
  })
  isCompleted: boolean;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
  })
  linkProjectId?: number;

  @belongsTo(() => Todolist)
  todolistId: number;

  constructor(data?: Partial<Todo>) {
    super(data);
  }
}

export interface TodoRelations {
  // describe navigational properties here
}

export type TodoWithRelations = Todo & TodoRelations;
