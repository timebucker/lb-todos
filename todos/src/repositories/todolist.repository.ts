import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Todolist, TodolistRelations} from '../models';

export class TodolistRepository extends DefaultCrudRepository<
  Todolist,
  typeof Todolist.prototype.id,
  TodolistRelations
> {
  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Todolist, dataSource);
  }
}
