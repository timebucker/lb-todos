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
} from '@loopback/rest';
import {Todolist} from '../models';
import {TodolistRepository} from '../repositories';

export class TodolistController {
  constructor(
    @repository(TodolistRepository)
    public todolistRepository : TodolistRepository,
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
    return this.todolistRepository.create(todolist);
  }

  @get('/todolists/count')
  @response(200, {
    description: 'Todolist model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Todolist) where?: Where<Todolist>,
  ): Promise<Count> {
    return this.todolistRepository.count(where);
  }

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
    @param.filter(Todolist) filter?: Filter<Todolist>,
  ): Promise<Todolist[]> {
    return this.todolistRepository.find(filter);
  }

  @patch('/todolists')
  @response(200, {
    description: 'Todolist PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todolist, {partial: true}),
        },
      },
    })
    todolist: Todolist,
    @param.where(Todolist) where?: Where<Todolist>,
  ): Promise<Count> {
    return this.todolistRepository.updateAll(todolist, where);
  }

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
    return this.todolistRepository.findById(id, filter);
  }

  @patch('/todolists/{id}')
  @response(204, {
    description: 'Todolist PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Todolist, {partial: true}),
        },
      },
    })
    todolist: Todolist,
  ): Promise<void> {
    await this.todolistRepository.updateById(id, todolist);
  }

  @put('/todolists/{id}')
  @response(204, {
    description: 'Todolist PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() todolist: Todolist,
  ): Promise<void> {
    await this.todolistRepository.replaceById(id, todolist);
  }

  @del('/todolists/{id}')
  @response(204, {
    description: 'Todolist DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.todolistRepository.deleteById(id);
  }
}
