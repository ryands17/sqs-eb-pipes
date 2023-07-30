import fetch from 'node-fetch';
import { userSchema, userEventSchema } from '@sqs-eb-pipes/core/schemas';

export const handler = async (_event: unknown) => {
  const event = userEventSchema.parse(_event);

  const raw = await fetch(
    `https://jsonplaceholder.typicode.com/users/${event[0].body.userId}`,
  );

  const user = userSchema.parse(await raw.json());
  return { id: user.id, name: user.name, messageId: event[0].messageId };
};
