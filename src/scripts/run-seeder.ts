import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RoleSeeder } from './seed-roles';
import { StorySeeder } from './seed-stories';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const roleSeeder = app.get(RoleSeeder);
  const storySeeder = app.get(StorySeeder);
  
  try {
    await roleSeeder.seed();
    console.log('Roles seeded successfully');

    await storySeeder.seed();
    console.log('Stories seeded successfully');
  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
