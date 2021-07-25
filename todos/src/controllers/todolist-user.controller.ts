import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Todolist,
  User,
} from '../models';
import {TodolistRepository} from '../repositories';

export class TodolistUserController {
  constructor(
    @repository(TodolistRepository)
    public todolistRepository: TodolistRepository,
  ) { }

  @get('/todolists/{id}/user', {
    responses: {
      '200': {
        description: 'User belonging to Todolist',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(User)},
          },
        },
      },
    },
  })
  async getUser(
    @param.path.number('id') id: typeof Todolist.prototype.id,
  ): Promise<User> {
    return this.todolistRepository.user(id);
  }
}
