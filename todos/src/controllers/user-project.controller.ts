import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  User,
  Project,
} from '../models';
import {UserRepository} from '../repositories';

export class UserProjectController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  @get('/users/{id}/project', {
    responses: {
      '200': {
        description: 'Project belonging to User',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Project)},
          },
        },
      },
    },
  })
  async getProject(
    @param.path.number('id') id: typeof User.prototype.id,
  ): Promise<Project> {
    return this.userRepository.project(id);
  }
}
