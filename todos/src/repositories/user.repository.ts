import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {User, UserRelations, Project, Todolist, Role} from '../models';
import {ProjectRepository} from './project.repository';
import {TodolistRepository} from './todolist.repository';
import {RoleRepository} from './role.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly project: BelongsToAccessor<Project, typeof User.prototype.id>;

  public readonly todolists: HasManyRepositoryFactory<Todolist, typeof User.prototype.id>;

  public readonly roles: HasManyRepositoryFactory<Role, typeof User.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('ProjectRepository') protected projectRepositoryGetter: Getter<ProjectRepository>, @repository.getter('TodolistRepository') protected todolistRepositoryGetter: Getter<TodolistRepository>, @repository.getter('RoleRepository') protected roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(User, dataSource);
    this.roles = this.createHasManyRepositoryFactoryFor('roles', roleRepositoryGetter,);
    this.registerInclusionResolver('roles', this.roles.inclusionResolver);
    this.todolists = this.createHasManyRepositoryFactoryFor('todolists', todolistRepositoryGetter,);
    this.registerInclusionResolver('todolists', this.todolists.inclusionResolver);
    this.project = this.createBelongsToAccessorFor('project', projectRepositoryGetter,);
    this.registerInclusionResolver('project', this.project.inclusionResolver);
  }
}
