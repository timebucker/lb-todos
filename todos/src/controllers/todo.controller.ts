import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/context';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { AuthorizeServiceBindings } from '../components/authorization';
import { Todo } from '../models';
import { TodolistRepository, TodoRepository, UserRepository } from '../repositories';
import { AuthorizeService, DefineAuthorizeAction, DefinePermission } from '../components/authorization';
import { MyUserProfile } from '../types';

@authenticate('jwt')
export class TodoController {
  constructor(
    @repository(TodoRepository) public todoRepository: TodoRepository,

    @repository(TodolistRepository) protected todolistRepository: TodolistRepository,

    @repository(UserRepository) protected userRepository: UserRepository,

    @inject(AuthorizeServiceBindings.AUTRHORIZE_SERVICE) public authorizeService: AuthorizeService,

    @inject(AuthenticationBindings.CURRENT_USER) public currentUser: MyUserProfile
  ) { }

  @post('/todos/set-complete')
  @response(204, {
      description: 'Todo set complete success',
    })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {type: 'number'}
            },
          },
        },
      },
    })
    reqObj: any,
  ): Promise<void> {
    let todoId: number = reqObj.id
    let todo = await this.todoRepository.findById(todoId)
    let todolist = await this.todolistRepository.findById(todo.todolistId)
    let owner = await this.userRepository.findById(todolist.userId)
    let isAllow = this.authorizeService.shouldAllow(this.currentUser, owner, DefineAuthorizeAction.Write)
    if (!isAllow) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }
    todo.isCompleted = true
    return await this.todoRepository.updateById(todoId, todo)
  }
}
