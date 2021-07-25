import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Todo,
  Todolist,
} from '../models';
import {TodoRepository} from '../repositories';

export class TodoTodolistController {
  constructor(
    @repository(TodoRepository)
    public todoRepository: TodoRepository,
  ) { }

  @get('/todos/{id}/todolist', {
    responses: {
      '200': {
        description: 'Todolist belonging to Todo',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todolist)},
          },
        },
      },
    },
  })
  async getTodolist(
    @param.path.number('id') id: typeof Todo.prototype.id,
  ): Promise<Todolist> {
    return this.todoRepository.todolist(id);
  }
}
