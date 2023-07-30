import { SQSEvent } from 'aws-lambda';

export const handler = async (event: SQSEvent['Records']) => {
  console.log(JSON.stringify(event, null, 2));
  return event.map((record) => ({
    messageId: record.messageId,
    body: JSON.parse(record.body),
  }));
};
