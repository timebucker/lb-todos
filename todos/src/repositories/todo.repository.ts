import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Todo, TodoRelations, Todolist} from '../models';
import {TodolistRepository} from './todolist.repository';

export class TodoRepository extends DefaultCrudRepository<
  Todo,
  typeof Todo.prototype.id,
  TodoRelations
> {

  public readonly todolist: BelongsToAccessor<Todolist, typeof Todo.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('TodolistRepository') protected todolistRepositoryGetter: Getter<TodolistRepository>,
  ) {
    super(Todo, dataSource);
    this.todolist = this.createBelongsToAccessorFor('todolist', todolistRepositoryGetter,);
    this.registerInclusionResolver('todolist', this.todolist.inclusionResolver);
  }
}
