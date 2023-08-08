import { Logger } from '@aws-lambda-powertools/logger';
import { AppStage } from './schemas';

export const createLogger = (stage: AppStage) => {
  return new Logger({ serviceName: `${stage}-eb-pipes` });
};
