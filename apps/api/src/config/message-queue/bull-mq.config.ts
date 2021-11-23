import * as Bull from 'bull';

export function getBullMqConnectionOptions() {
  const options = {
    redis: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
  } as Bull.QueueOptions;

  return options;
}
