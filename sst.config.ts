import { SSTConfig } from 'sst';
import { SQSEBPipes } from './stacks/SQSEBPipes';

export default {
  config(_input) {
    return {
      name: 'sqs-eb-pipes',
      region: 'eu-west-1',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs16.x',
      architecture: 'arm_64',
    });

    app.stack(SQSEBPipes);
  },
} satisfies SSTConfig;
