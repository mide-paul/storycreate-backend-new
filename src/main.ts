import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
// import { LoggingMiddleware } from "./common/middleware/logging.middleware";

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    // Set a base URL prefix for all routes
    app.setGlobalPrefix('api/v1');

    // Increase the payload size limit for webhooks
    app.use(json({ limit: "50mb" }));
    app.use(urlencoded({ limit: "50mb", extended: true }));

    // Allow requests from both FRONTEND_URL and FRONTEND_LOCAL
    const allowedOrigins = [
      process.env.FRONTEND_LOCAL || 'http://localhost:3000',
      process.env.FRONTEND_URL || 'https://storycreate.app',
      process.env.WEBAPP_URL || 'https://storycreate.app',
    ].filter(Boolean);

    app.enableCors({
      origin: allowedOrigins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle("StoryCreate API")
      .setDescription("StoryCreate API documentation")
      .setVersion("1.0")
      .addTag("StoryCreate")
      .setBasePath("api/v1")
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/v:version/docs", app, document);

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

    app.useGlobalFilters(new AllExceptionsFilter());

    // app.use(new LoggingMiddleware().use);

    const port = process.env.PORT || 8080;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    console.error('Error during application startup:', error);
    process.exit(1);
  }
}

bootstrap();
