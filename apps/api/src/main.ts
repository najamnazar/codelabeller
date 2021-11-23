import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app/app.module';

async function bootstrap() {
  let app: NestExpressApplication;
  let isHttps = false;

  // Attempt to read SSL certificate and key to initialise HTTPS server
  try {
    const httpsOptions = {
      cert: readFileSync(process.env.SSL_CERT_ABSOLUTE_PATH), // fullchain.pem
      key: readFileSync(process.env.SSL_PRIVATE_KEY_ABSOLUTE_PATH), // privkey.pem
      ca: process.env.API_DEPLOY_MODE === "PROD" ? readFileSync(process.env.SSL_CA_ABSOLUTE_PATH) : null // chain.pem
    };

    app = await NestFactory.create<NestExpressApplication>(
      AppModule,
      { httpsOptions }
    );

    isHttps = true;

  } catch (error) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log(`\nUnable to initialise HTTPS.\n${error}\n`);
  }

  app.setGlobalPrefix(process.env.API_GLOBAL_PREFIX);

  app.use(helmet.hidePoweredBy());
  app.use(compression());

  await app.listen(process.env.API_PORT, () => {
    console.log(`Server is in ${process.env.API_DEPLOY_MODE} mode`);
    console.log(`${isHttps ? "HTTPS" : "HTTP"}`);
    console.log(`Listening at: ${isHttps ? "https" : "http"}://${process.env.API_DOMAIN_NAME}:${process.env.API_PORT}${process.env.API_GLOBAL_PREFIX}`);
  });
}

bootstrap();
