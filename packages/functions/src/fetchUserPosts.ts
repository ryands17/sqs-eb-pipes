import fetch from 'node-fetch';
import { UserType, postsSchema } from '@sqs-eb-pipes/core/schemas';

type Message = UserType & {
  messageId: string;
};

export const handler = async (event: Message) => {
  const raw = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${event.id}`,
  );

  const posts = postsSchema.parse(await raw.json());
  return { ...posts.slice(0, 5), messageId: event.messageId };
};
