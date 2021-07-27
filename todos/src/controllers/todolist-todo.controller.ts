import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  HttpErrors,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import { AuthorizeServiceBindings } from '../keys';
import {
  Todolist,
  Todo,
} from '../models';
import { TodolistRepository } from '../repositories';
import { AuthorizeService, DefinePermission } from '../services';
import { MyUserProfile } from '../types';

@authenticate('jwt')
export class TodolistTodoController {
  userRepository: any;
  constructor(
    @repository(TodolistRepository) protected todolistRepository: TodolistRepository,

    @inject(AuthenticationBindings.CURRENT_USER) public currentUser: MyUserProfile
  ) { }

  @get('/todolists/{id}/todos', {
    responses: {
      '200': {
        description: 'Array of Todolist has many Todo',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Todo) },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    let todolist = await this.todolistRepository.findById(id)
    let owner = await this.userRepository.findById(String(todolist.userId))
    if (this.currentUser.projectId != owner.projectId
      || !this.currentUser.permissions.includes(DefinePermission.WriteAll)
    ) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }

    if (todolist.userId != this.currentUser.id) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }

    return this.todolistRepository.todos(id).find(filter);
  }

  @post('/todolists/{id}/todos', {
    responses: {
      '200': {
        description: 'Todolist model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Todo) } },
      },
    },
  })
  async create(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: MyUserProfile,
    @param.path.number('id') id: typeof Todolist.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodoInTodolist',
            exclude: ['id', 'todolistId']
            // optional: ['todolistId']
          }),
        },
      },
    }) todo: Omit<Todo, 'id' | 'todolistId'>,
  ): Promise<Todo> {
    let todolist = await this.todolistRepository.findById(id)
    let owner = await this.userRepository.findById(String(todolist.userId))
    if (this.currentUser.projectId != owner.projectId
      || !this.currentUser.permissions.includes(DefinePermission.WriteAll)
    ) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }

    if (todolist.userId != this.currentUser.id) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }
    return this.todolistRepository.todos(id).create(todo);
  }

  // @patch('/todolists/{id}/todos', {
  //   responses: {
  //     '200': {
  //       description: 'Todolist.Todo PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async patch(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Todo, {partial: true}),
  //       },
  //     },
  //   })
  //   todo: Partial<Todo>,
  //   @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  // ): Promise<Count> {
  //   return this.todolistRepository.todos(id).patch(todo, where);
  // }

  @del('/todolists/{id}/todos', {
    responses: {
      '200': {
        description: 'Todolist.Todo DELETE success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async delete(
    @inject(AuthenticationBindings.CURRENT_USER) currentUser: MyUserProfile,
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    let todolist = await this.todolistRepository.findById(id)
    let owner = await this.userRepository.findById(String(todolist.userId))
    if (!this.currentUser.permissions.includes(DefinePermission.WriteAll)
      || !this.currentUser.projectId == owner.projectId) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }

    if (todolist.userId != this.currentUser.id) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }

    return this.todolistRepository.todos(id).delete(where);
  }
}
