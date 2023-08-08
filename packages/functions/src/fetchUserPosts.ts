import fetch from 'node-fetch';
import { UserType, postsSchema } from '@sqs-eb-pipes/core/schemas';
import { createLogger } from '@sqs-eb-pipes/core/logger';
import { Config } from 'sst/node/config';

type Message = UserType & {
  messageId: string;
};

const logger = createLogger(Config.STAGE);

export const handler = async (event: Message) => {
  const raw = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${event.id}`,
  );

  const posts = postsSchema.parse(await raw.json());
  logger.info({ message: 'user posts', data: posts });

  return { ...posts.slice(0, 5), messageId: event.messageId };
};
