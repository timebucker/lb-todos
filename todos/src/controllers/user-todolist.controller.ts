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
import { AuthorizeService, DefineAuthorizeAction, DefinePermission, DefineRole } from '../components/authorization/authorize-service';
import { authenticate, AuthenticationBindings } from '@loopback/authentication';
import { AuthorizeServiceBindings } from '../components/authorization';

@authenticate('jwt')
export class UserTodolistController {
  constructor(
    @repository(UserRepository) 
    protected userRepository: UserRepository,

    @inject(AuthorizeServiceBindings.AUTRHORIZE_SERVICE) 
    public authorizeService: AuthorizeService,
    
    @inject(SecurityBindings.USER) 
    public currentUser: MyUserProfile
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
    let owner = await this.userRepository.findById(id)
    let isAllow = await this.authorizeService.shouldAllow(this.currentUser, owner, DefineAuthorizeAction.Read)
    if (!isAllow) {
      throw new HttpErrors.Forbidden('INVALID ACCESS');
    }
    return this.userRepository.todolists(id).find(filter)
  }
}
