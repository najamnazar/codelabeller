import { config } from 'dotenv';
config({ path: ".env.frontendserver" });

import { createProxyMiddleware } from 'http-proxy-middleware';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import * as requestId from 'express-request-id';
import * as helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app/app.module';

async function bootstrap() {
  let app: NestExpressApplication;
  let isHttps = false;

  // Attempt to read SSL certificate and key to initialise HTTPS server
  // https://community.letsencrypt.org/t/node-js-configuration/5175
  try {
    const httpsOptions = {
      cert: readFileSync(process.env.SSL_CERT_ABSOLUTE_PATH), // fullchain.pem
      key: readFileSync(process.env.SSL_PRIVATE_KEY_ABSOLUTE_PATH), // privkey.pem
      ca: process.env.DEPLOY_MODE === "PROD" ? readFileSync(process.env.SSL_CA_ABSOLUTE_PATH) : null // chain.pem
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

  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(helmet.hidePoweredBy());
  app.use(requestId());
  app.use(compression());
  // app.enableCors();

  app.use(`${process.env.API_GLOBAL_PREFIX}`, createProxyMiddleware({ target: `https://${process.env.DOMAIN_NAME}:${process.env.API_PORT}`, changeOrigin: true }));

  await app.listen(process.env.PORT, () => {
    console.log(`Server is in ${process.env.DEPLOY_MODE} MODE`);
    console.log(`${isHttps ? "HTTPS" : "HTTP"}`);
    console.log(`Listening at: ${isHttps ? "https" : "http"}://${process.env.DOMAIN_NAME}:${process.env.PORT}`);
  });
}
bootstrap();
