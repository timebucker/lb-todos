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
import { TodolistRepository, UserRepository } from '../repositories';
import { AuthorizeService, DefineAuthorizeAction, DefinePermission } from '../services';
import { MyUserProfile } from '../types';

@authenticate('jwt')
export class TodolistTodoController {
  // userRepository: any;
  constructor(
    @repository(TodolistRepository) protected todolistRepository: TodolistRepository,

    @repository(UserRepository) protected userRepository: UserRepository,

    @inject(AuthorizeServiceBindings.AUTRHORIZE_SERVICE) public authorizeService: AuthorizeService,

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
    this.authorizeRequest(id, DefineAuthorizeAction.Read)
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
    @param.path.number('id') id: typeof Todolist.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodoInTodolist',
            exclude: ['id', 'todolistId'],
            optional: ['linkProjectId']
          }),
        },
      },
    }) todo: Omit<Todo, 'id' | 'todolistId'>,
  ): Promise<Todo> {
    this.authorizeRequest(Number(id), DefineAuthorizeAction.Write)
    return this.todolistRepository.todos(id).create(todo);
  }

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
    this.authorizeRequest(id, DefineAuthorizeAction.Write)
    return this.todolistRepository.todos(id).delete(where);
  }

  async authorizeRequest(todoListId: number, action: DefineAuthorizeAction) {
    let todolist = await this.todolistRepository.findById(todoListId)
    let owner = await this.userRepository.findById(todolist.userId)
    let isAllow = await this.authorizeService.shouldAllow(this.currentUser, owner, action)
    if (!isAllow) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }
  }
}
