import fetch from 'node-fetch';

type Message = {
  messageId: string;
  body: { userId: number; text: string };
};
export const handler = async (event: Message[]) => {
  const raw = await fetch(
    `https://jsonplaceholder.typicode.com/users/${event[0].body.userId}`,
  );

  // TODO: change to validation with Zod
  const user: any = await raw.json();
  return { id: user.id, name: user.name, messageId: event[0].messageId };
};
