import { ApiHandler } from 'sst/node/api';
import { Queue } from 'sst/node/queue';
import { v4 as uuidv4 } from 'uuid';
import {
  SQSClient,
  SendMessageBatchCommand,
  SendMessageBatchCommandInput,
} from '@aws-sdk/client-sqs';

const client = new SQSClient({});

export const handler = ApiHandler(async (_evt) => {
  const entries: SendMessageBatchCommandInput['Entries'] = [];

  for (let i = 0; i < 10; i++) {
    entries.push({
      Id: uuidv4(),
      MessageBody: JSON.stringify({
        userId: i + 1,
        text: `This is message ${i + 1}`,
      }),
    });
  }

  await client.send(
    new SendMessageBatchCommand({
      QueueUrl: Queue.mainQueue.queueUrl,
      Entries: entries,
    }),
  );

  return {
    statusCode: 200,
    body: `Sent 10 messages to the queue`,
  };
});
