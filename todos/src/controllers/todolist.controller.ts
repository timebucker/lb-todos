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
import {Todolist} from '../models';
import {TodolistRepository} from '../repositories';
import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import { inject } from '@loopback/core';
import { DefinePermission, DefineRole, MyUserProfile } from '../types';
import { UserRepository } from '@loopback/authentication-jwt';
import { Console } from 'console';
import {SecurityBindings} from '@loopback/security';

@authenticate('jwt')
export class TodolistController {
  constructor(
    @repository(TodolistRepository)
    public todolistRepository : TodolistRepository,

    @repository(UserRepository)
    public userRepository : UserRepository,

    @inject(SecurityBindings.USER)
    public currentUser: MyUserProfile
  ) {}

  @post('/todolists')
  @response(200, {
    description: 'Todolist model instance',
    content: {'application/json': {schema: getModelSchemaRef(Todolist)}},
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
    if (todolist.userId != this.currentUser.id) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }
    return this.todolistRepository.create(todolist);
  }

  // @get('/todolists/count')
  // @response(200, {
  //   description: 'Todolist model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(Todolist) where?: Where<Todolist>,
  // ): Promise<Count> {
  //   return this.todolistRepository.count(where);
  // }

  @get('/todolists')
  @response(200, {
    description: 'Array of Todolist model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Todolist, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Todolist) filter?: Filter<Todolist>
  ): Promise<Todolist[]> {
    if (this.currentUser.permissions.includes(DefinePermission.ReadAll)) {
      return this.todolistRepository.find(filter)  
    } else {
      let adminUsers = await this.userRepository.find({where: {roleId: DefineRole.Admin}})
      let adminIds = adminUsers.map((admin) => { return Number(admin.id) })
      return (await this.todolistRepository.find(filter)).filter((list) => {
        return !adminIds.includes(list.userId)
      })
    }
  }

  // @patch('/todolists')
  // @response(200, {
  //   description: 'Todolist PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Todolist, {partial: true}),
  //       },
  //     },
  //   })
  //   todolist: Todolist,
  //   @param.where(Todolist) where?: Where<Todolist>,
  // ): Promise<Count> {
  //   return this.todolistRepository.updateAll(todolist, where);
  // }

  @get('/todolists/{id}')
  @response(200, {
    description: 'Todolist model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Todolist, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Todolist, {exclude: 'where'}) filter?: FilterExcludingWhere<Todolist>
  ): Promise<Todolist> {
    let adminUsers = await this.userRepository.find({where: {roleId: DefineRole.Admin}})
    let adminIds = adminUsers.map((admin) => { return Number(admin.id) })

    if (!this.currentUser.permissions.includes(DefinePermission.ReadAll) && adminIds.includes(id)) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }
    return this.todolistRepository.findById(id, filter);
  }

  // @patch('/todolists/{id}')
  // @response(204, {
  //   description: 'Todolist PATCH success',
  // })
  // async updateById(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Todolist, {partial: true}),
  //       },
  //     },
  //   })
  //   todolist: Todolist,
  // ): Promise<void> {
  //   await this.todolistRepository.updateById(id, todolist);
  // }

  // @put('/todolists/{id}')
  // @response(204, {
  //   description: 'Todolist PUT success',
  // })
  // async replaceById(
  //   @param.path.number('id') id: number,
  //   @requestBody() todolist: Todolist,
  // ): Promise<void> {
  //   await this.todolistRepository.replaceById(id, todolist);
  // }

  @del('/todolists/{id}')
  @response(204, {
    description: 'Todolist DELETE success',
  })
  async deleteById(
    @param.path.number('id') id: number
    ): Promise<void> {
      if (id != this.currentUser.id) {
        throw new HttpErrors.Forbidden('INVALID ACCESS');
      }
    await this.todolistRepository.deleteById(id);
  }
}
