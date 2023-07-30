import fetch from 'node-fetch';

type Message = {
  messageId: string;
  id: string;
  name: string;
};
export const handler = async (event: Message) => {
  const raw = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${event.id}`,
  );

  // TODO: change to validation with Zod
  const posts: any = await raw.json();
  return { ...posts.slice(0, 5), messageId: event.messageId };
};
