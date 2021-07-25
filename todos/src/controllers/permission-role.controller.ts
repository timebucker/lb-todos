import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Permission,
  Role,
} from '../models';
import {PermissionRepository} from '../repositories';

export class PermissionRoleController {
  constructor(
    @repository(PermissionRepository)
    public permissionRepository: PermissionRepository,
  ) { }

  @get('/permissions/{id}/role', {
    responses: {
      '200': {
        description: 'Role belonging to Permission',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Role)},
          },
        },
      },
    },
  })
  async getRole(
    @param.path.number('id') id: typeof Permission.prototype.id,
  ): Promise<Role> {
    return this.permissionRepository.role(id);
  }
}
