import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RoleSeeder } from './seed-roles';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleSeeder = app.get(RoleSeeder);
  
  try {
    await roleSeeder.seed();
    console.log('Roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
  } finally {
    await app.close();
  }
}

bootstrap(); 