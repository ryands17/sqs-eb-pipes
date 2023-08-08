import fetch from 'node-fetch';
import { userSchema, userEventSchema } from '@sqs-eb-pipes/core/schemas';
import { createLogger } from '@sqs-eb-pipes/core/logger';
import { Config } from 'sst/node/config';

const logger = createLogger(Config.STAGE);

export const handler = async (_event: unknown) => {
  const event = userEventSchema.parse(_event);

  const raw = await fetch(
    `https://jsonplaceholder.typicode.com/users/${event[0].body.userId}`,
  );

  const user = userSchema.parse(await raw.json());
  logger.info({ message: 'user', data: user });

  return { id: user.id, name: user.name, messageId: event[0].messageId };
};
