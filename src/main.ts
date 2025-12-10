import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("LQ OS-Services Management API")
    .setDescription(
      "This is the API documentation for the LQ OS-Services Management API.",
    )
    .setVersion("1.0")
    // .addApiKey(
    //   {
    //     type: "apiKey",
    //     name: "organization-id",
    //     in: "header",
    //   },
    //   "organization-id",
    // )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap().then(() => {
  console.log(`Server started at http://localhost:${process.env.PORT || 3000}`);
});
