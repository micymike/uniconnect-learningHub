import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  //app.enableCors({ origin: 'http://localhost:3000' });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Uni-connect API')
    .setDescription('API documentation for Uni-connect ')
    .setVersion('1.0')
    .addBearerAuth() 
    .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
