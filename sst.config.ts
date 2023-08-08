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
    app.setDefaultRemovalPolicy(app.stage === 'prod' ? 'retain' : 'destroy');

    app.setDefaultFunctionProps({
      runtime: 'nodejs16.x',
      timeout: '1 minute',
      memorySize: '512 MB',
      architecture: 'arm_64',
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        POWERTOOLS_DEV: ['dev', 'test'].includes(app.stage) ? 'true' : 'false',
      },
      nodejs: { esbuild: { sourcemap: true } },
    });

    app.stack(SQSEBPipes);
  },
} satisfies SSTConfig;
