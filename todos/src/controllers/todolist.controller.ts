import {
  Count,
  CountSchema,
  Filter,
  FilterBuilder,
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
import { Todolist } from '../models';
import { TodolistRepository, UserRepository } from '../repositories';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { MyUserProfile } from '../types';
import { AuthorizeService, DefineAuthorizeAction, DefinePermission, DefineRole } from '../components/authorization/authorize-service';
import { AuthorizeServiceBindings } from '../components/authorization';

@authenticate('jwt')
export class TodolistController {
  constructor(
    @repository(TodolistRepository)
    public todolistRepository: TodolistRepository,

    @repository(UserRepository)
    public userRepository: UserRepository,

    @inject(AuthorizeServiceBindings.AUTRHORIZE_SERVICE)
    public authorizeService: AuthorizeService,

    @inject(AuthenticationBindings.CURRENT_USER)
    public currentUser: MyUserProfile
  ) { }

  @post('/todolists')
  @response(200, {
    description: 'Todolist model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Todolist) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todolist, {
            title: 'NewTodolist',
            exclude: ['id'],
          }),
        },
      },
    })
    todolist: Omit<Todolist, 'id'>,
  ): Promise<Todolist> {
    if (!todolist.userId) {
      todolist.userId = this.currentUser.id
    }
    let owner = await this.userRepository.findById(todolist.userId)
    let isAllow = await this.authorizeService.shouldAllow(this.currentUser, owner, DefineAuthorizeAction.Write)
    if (!isAllow) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }
    return this.todolistRepository.create(todolist);
  }

  @get('/todolists')
  @response(200, {
    description: 'Array of Todolist model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todolist, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Todolist) filter?: Filter<Todolist>
  ): Promise<Todolist[]> {
    let projectUserIds = (
      await this.userRepository.find({ where: { projectId: this.currentUser.projectId } })
    ).map((u) => { return Number(u.id) })

    filter = { ...filter, where: { ...filter?.where, userId: { inq: projectUserIds } } }

    if (this.currentUser.permissions.includes(DefinePermission.ReadAll)) {
      return this.todolistRepository.find(filter)
    } else {
      let adminUsers = await this.userRepository.find({ where: { roleId: DefineRole.Admin } })
      let adminIds = adminUsers.map((admin) => { return Number(admin.id) })

      filter.where = { and: [{ ...filter?.where }, { userId: { nin: adminIds } }] }
      return (await this.todolistRepository.find(filter))
    }
  }

  @get('/todolists/{id}')
  @response(200, {
    description: 'Todolist model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todolist, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Todolist, { exclude: 'where' }) filter?: FilterExcludingWhere<Todolist>
  ): Promise<Todolist> {
    this.authorizeRequest(id, DefineAuthorizeAction.Read)
    return this.todolistRepository.findById(id, filter);
  }

  @del('/todolists/{id}')
  @response(204, {
    description: 'Todolist DELETE success',
  })
  async deleteById(
    @param.path.number('id') id: number
  ): Promise<void> {
    this.authorizeRequest(id, DefineAuthorizeAction.Write)
    await this.todolistRepository.deleteById(id);
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
