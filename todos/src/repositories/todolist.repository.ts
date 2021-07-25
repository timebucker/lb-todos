import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Todolist, TodolistRelations, Todo, User} from '../models';
import {TodoRepository} from './todo.repository';
import {UserRepository} from './user.repository';

export class TodolistRepository extends DefaultCrudRepository<
  Todolist,
  typeof Todolist.prototype.id,
  TodolistRelations
> {

  public readonly todos: HasManyRepositoryFactory<Todo, typeof Todolist.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof Todolist.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('TodoRepository') protected todoRepositoryGetter: Getter<TodoRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Todolist, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
    this.todos = this.createHasManyRepositoryFactoryFor('todos', todoRepositoryGetter,);
    this.registerInclusionResolver('todos', this.todos.inclusionResolver);
  }
}
