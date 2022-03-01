import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.disable('x-powered-by');
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('teus-lab-api')
    .setDescription('The teuslab api')
    .setVersion('1.0')
    .addSecurity('Authorization', {
      type: 'apiKey',
      name: 'Authorization',
      description: 'enter with the authorization token',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
