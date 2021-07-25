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
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Role,
  Permission,
} from '../models';
import {RoleRepository} from '../repositories';

export class RolePermissionController {
  constructor(
    @repository(RoleRepository) protected roleRepository: RoleRepository,
  ) { }

  @get('/roles/{id}/permissions', {
    responses: {
      '200': {
        description: 'Array of Role has many Permission',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Permission)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Permission>,
  ): Promise<Permission[]> {
    return this.roleRepository.permissions(id).find(filter);
  }

  @post('/roles/{id}/permissions', {
    responses: {
      '200': {
        description: 'Role model instance',
        content: {'application/json': {schema: getModelSchemaRef(Permission)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Role.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, {
            title: 'NewPermissionInRole',
            exclude: ['id'],
            optional: ['roleId']
          }),
        },
      },
    }) permission: Omit<Permission, 'id'>,
  ): Promise<Permission> {
    return this.roleRepository.permissions(id).create(permission);
  }

  @patch('/roles/{id}/permissions', {
    responses: {
      '200': {
        description: 'Role.Permission PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Permission, {partial: true}),
        },
      },
    })
    permission: Partial<Permission>,
    @param.query.object('where', getWhereSchemaFor(Permission)) where?: Where<Permission>,
  ): Promise<Count> {
    return this.roleRepository.permissions(id).patch(permission, where);
  }

  @del('/roles/{id}/permissions', {
    responses: {
      '200': {
        description: 'Role.Permission DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Permission)) where?: Where<Permission>,
  ): Promise<Count> {
    return this.roleRepository.permissions(id).delete(where);
  }
}
