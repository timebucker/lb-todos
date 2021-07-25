import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory, HasOneRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserRelations, Project, Todolist, Role} from '../models';
import {ProjectRepository} from './project.repository';
import {TodolistRepository} from './todolist.repository';
import {RoleRepository} from './role.repository';

export type Credentials = {
  username: string;
  password: string;
};

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly project: BelongsToAccessor<Project, typeof User.prototype.id>;

  public readonly todolists: HasManyRepositoryFactory<Todolist, typeof User.prototype.id>;

  public readonly role: HasOneRepositoryFactory<Role, typeof User.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ProjectRepository') protected projectRepositoryGetter: Getter<ProjectRepository>, @repository.getter('TodolistRepository') protected todolistRepositoryGetter: Getter<TodolistRepository>, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(User, dataSource);
    this.role = this.createHasOneRepositoryFactoryFor('role', roleRepositoryGetter);
    this.registerInclusionResolver('role', this.role.inclusionResolver);
    this.todolists = this.createHasManyRepositoryFactoryFor('todolists', todolistRepositoryGetter,);
    this.registerInclusionResolver('todolists', this.todolists.inclusionResolver);
    this.project = this.createBelongsToAccessorFor('project', projectRepositoryGetter,);
    this.registerInclusionResolver('project', this.project.inclusionResolver);
  }
}
