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
  getJsonSchemaRef
} from '@loopback/rest';
import { User } from '../models';
import { UserRepository, Credentials, RoleRepository } from '../repositories';
import { MyUserService } from '../components/jwt-authentication';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../components/jwt-authentication/keys';
import { AuthorizeServiceBindings } from '../components/authorization';
import { inject } from '@loopback/core';
import { BcryptHasher } from '../components/jwt-authentication/services/hash-password';
import { JWTService } from '../components/jwt-authentication';
import { validateCredentials } from '../services/validator'
import * as _ from 'lodash';
import { AuthorizeService, DefineRole } from '../components/authorization/authorize-service';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @repository(RoleRepository)
    public roleRepository: RoleRepository,

    @inject(AuthorizeServiceBindings.AUTRHORIZE_SERVICE)
    public authorizeService: AuthorizeService,

    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public hasher: BcryptHasher,

    // @inject('service.user.service')
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,

    // @inject('service.jwt.service')
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
  ) { }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(User) filter?: Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @post('/users/signup', {
    responses: {
      '200': {
        description: 'User',
        content: {
          'application/json': {
            schema: getModelSchemaRef(User, {
              title: 'NewUser',
              exclude: ['password']
            }),
          }
        },
      },
    },
  })
  async signup(@requestBody({
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {
          exclude: ['id']
        })
      }
    }
  }) userData: Omit<User, 'id'>) {
    validateCredentials(_.pick(userData, ['username', 'password']));

    let usr = await this.userRepository.findOne({ where: { username: userData.username } })
    if (usr) {
      throw new HttpErrors.UnprocessableEntity('username existed');
    }

    userData.roleId = userData.roleId ?? DefineRole.User
    userData.password = await this.hasher.hashPassword(userData.password);
    const savedUser = await this.userRepository.create(userData);
    return savedUser;
  }

  @post('/users/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: {
                  type: 'number',
                },
                token: {
                  type: 'string',
                }
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewTodo',
            exclude: ['id', 'projectId', 'roleId'],
          }),
        },
      },
    }) credentials: Credentials,
  ): Promise<{ token: string }> {
    const user = await this.userService.verifyCredentials(credentials);
    const userProfile = await this.userService.convertToUserProfile(user);
    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({ userId: userProfile.id, token: token });
  }
}
