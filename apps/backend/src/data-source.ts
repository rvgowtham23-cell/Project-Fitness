import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';

dotenv.config();

// Standalone DataSource for the TypeORM CLI (migration:generate/run/revert — see package.json).
// Kept separate from app.module.ts's TypeOrmModule.forRootAsync because the CLI can't resolve
// Nest's DI container.
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true',
  namingStrategy: new SnakeNamingStrategy(),
  entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
