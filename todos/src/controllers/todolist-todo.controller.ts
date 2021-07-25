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
  Todolist,
  Todo,
} from '../models';
import {TodolistRepository} from '../repositories';

export class TodolistTodoController {
  constructor(
    @repository(TodolistRepository) protected todolistRepository: TodolistRepository,
  ) { }

  @get('/todolists/{id}/todos', {
    responses: {
      '200': {
        description: 'Array of Todolist has many Todo',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Todo)},
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.object('filter') filter?: Filter<Todo>,
  ): Promise<Todo[]> {
    return this.todolistRepository.todos(id).find(filter);
  }

  @post('/todolists/{id}/todos', {
    responses: {
      '200': {
        description: 'Todolist model instance',
        content: {'application/json': {schema: getModelSchemaRef(Todo)}},
      },
    },
  })
  async create(
    @param.path.number('id') id: typeof Todolist.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {
            title: 'NewTodoInTodolist',
            exclude: ['id'],
            optional: ['todolistId']
          }),
        },
      },
    }) todo: Omit<Todo, 'id'>,
  ): Promise<Todo> {
    return this.todolistRepository.todos(id).create(todo);
  }

  @patch('/todolists/{id}/todos', {
    responses: {
      '200': {
        description: 'Todolist.Todo PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todo, {partial: true}),
        },
      },
    })
    todo: Partial<Todo>,
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todolistRepository.todos(id).patch(todo, where);
  }

  @del('/todolists/{id}/todos', {
    responses: {
      '200': {
        description: 'Todolist.Todo DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.number('id') id: number,
    @param.query.object('where', getWhereSchemaFor(Todo)) where?: Where<Todo>,
  ): Promise<Count> {
    return this.todolistRepository.todos(id).delete(where);
  }
}
