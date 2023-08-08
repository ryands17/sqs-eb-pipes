import { SQSEvent } from 'aws-lambda';
import { createLogger } from '@sqs-eb-pipes/core/logger';
import { Config } from 'sst/node/config';

const logger = createLogger(Config.STAGE);

export const handler = async (event: SQSEvent['Records']) => {
  return event.map((record) => {
    logger.info({ message: 'record to enrich', data: record });

    return { messageId: record.messageId, body: JSON.parse(record.body) };
  });
};
