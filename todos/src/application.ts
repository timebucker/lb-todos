import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin, SchemaMigrationOptions} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {AuthenticationComponent} from '@loopback/authentication';
import {
  SECURITY_SCHEME_SPEC,
} from '@loopback/authentication-jwt';
import {DbDataSource} from './datasources';
import {CronComponent} from '@loopback/cron';
import { MyJWTAuthenticationComponent } from './components/jwt-authentication';
import { MyAuthorizationComponent } from './components/authorization/authorization-component';
import { ProjectRepository, RoleRepository, TodolistRepository, TodoRepository, UserRepository } from './repositories';

export {ApplicationConfig};

export class TodosApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.addSecuritySpec();

    // Mount authentication system
    this.component(AuthenticationComponent);
    this.component(MyJWTAuthenticationComponent);
    this.component(MyAuthorizationComponent);
    this.component(CronComponent);

    // Bind datasource
    // this.dataSource(DbDataSource, UserServiceBindings.DATASOURCE_NAME);
  }

  addSecuritySpec(): void {
    this.api({
      openapi: '3.0.0',
      info: {
        title: 'test application',
        version: '1.0.0',
      },
      paths: {},
      components: {securitySchemes: SECURITY_SCHEME_SPEC},
      security: [
        {
          // secure all endpoints with 'jwt'
          jwt: [],
        },
      ],
      servers: [{url: '/'}],
    });
  }

  // async migrateSchema(options?: SchemaMigrationOptions) {
  //   await super.migrateSchema(options);

  //   const projectRepo = await this.getRepository(ProjectRepository);
  //   projectRepo.create({name: "hcmus"})
  //   projectRepo.create({name: "hcmute"})

  //   const roleRepo = await this.getRepository(RoleRepository);
  //   roleRepo.create({name:"user"})
  //   roleRepo.create({name:"admin"})

  //   const userRepo = await this.getRepository(UserRepository);
  //   userRepo.create({username:"admin1",password:"$2a$10$Sk.Yn7mMyI9hYsbM88PYXecDwDXeKSD27bRDw8zcGzUOV2ZslHqf2",roleId:1,projectId:0})
  //   userRepo.create({username:"user1",password:"$2a$10$Sk.Yn7mMyI9hYsbM88PYXecDwDXeKSD27bRDw8zcGzUOV2ZslHqf2",roleId:0,projectId:0})
  //   userRepo.create({username:"admin2",password:"$2a$10$Sk.Yn7mMyI9hYsbM88PYXecDwDXeKSD27bRDw8zcGzUOV2ZslHqf2",roleId:1,projectId:1})
  //   userRepo.create({username:"user2",password:"$2a$10$Sk.Yn7mMyI9hYsbM88PYXecDwDXeKSD27bRDw8zcGzUOV2ZslHqf2",roleId:0,projectId:1})
    
  //   const todolistRepo = await this.getRepository(TodolistRepository);
  //   todolistRepo.create({title:"admin1-tdl",userId:0})

  //   const todoRepo = await this.getRepository(TodoRepository);
  // }
}
