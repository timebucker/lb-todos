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
import {
  User,
  Todolist,
} from '../models';
import { UserRepository} from '../repositories';
import { MyUserProfile } from '../types';
import {SecurityBindings} from '@loopback/security';
import { DefinePermission, DefineRole } from '../services/authorize-service';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';

@authenticate('jwt')
export class UserTodolistController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
    
    @inject(SecurityBindings.USER) public currentUser: MyUserProfile
  ) { }

  @get('/users/{id}/todolists', {
    responses: {
      '200': {
        description: 'Array of User has many Todolist',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todolist)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Todolist>,
  ): Promise<Todolist[]> {
    let queryProjectId = (await this.userRepository.findById(id)).projectId

    let adminIds = (
      await this.userRepository.find({where: {roleId: DefineRole.Admin}})
    ).map((admin) => { return Number(admin.id) })

    if (this.currentUser.projectId != queryProjectId) {
      // user can not view from others project
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }

    // process for admin query
    if (adminIds.includes(id)) {
      if (this.currentUser.permissions.includes(DefinePermission.ReadAll)) {
        return this.userRepository.todolists(id).find(filter)
      } else {
        throw new HttpErrors.Forbidden('INVALID ACCESS');
      }
    }

    return this.userRepository.todolists(id).find(filter);
  }

  // @post('/users/{id}/todolists', {
  //   responses: {
  //     '200': {
  //       description: 'User model instance',
  //       content: {'application/json': {schema: getModelSchemaRef(Todolist)}},
  //     },
  //   },
  // })
  // async create(
  //   @param.path.number('id') id: typeof User.prototype.id,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Todolist, {
  //           title: 'NewTodolistInUser',
  //           exclude: ['id'],
  //           optional: ['userId']
  //         }),
  //       },
  //     },
  //   }) todolist: Omit<Todolist, 'id'>,
  // ): Promise<Todolist> {
  //   return this.userRepository.todolists(id).create(todolist);
  // }

  // @patch('/users/{id}/todolists', {
  //   responses: {
  //     '200': {
  //       description: 'User.Todolist PATCH success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async patch(
  //   @param.path.number('id') id: number,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Todolist, {partial: true}),
  //       },
  //     },
  //   })
  //   todolist: Partial<Todolist>,
  //   @param.query.object('where', getWhereSchemaFor(Todolist)) where?: Where<Todolist>,
  // ): Promise<Count> {
  //   return this.userRepository.todolists(id).patch(todolist, where);
  // }

  // @del('/users/{id}/todolists', {
  //   responses: {
  //     '200': {
  //       description: 'User.Todolist DELETE success count',
  //       content: {'application/json': {schema: CountSchema}},
  //     },
  //   },
  // })
  // async delete(
  //   @param.path.number('id') id: number,
  //   @param.query.object('where', getWhereSchemaFor(Todolist)) where?: Where<Todolist>,
  // ): Promise<Count> {
  //   return this.userRepository.todolists(id).delete(where);
  // }
}
