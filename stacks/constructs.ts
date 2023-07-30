import * as sst from 'sst/constructs';
import { RemovalPolicy } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

type AppStage = 'dev' | 'test' | 'prod' | (string & {});

export function setLogRetention(stage: AppStage) {
  return stage === 'prod' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK;
}

export function setRemovalPolicy(stage: AppStage) {
  return stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
}

export class LambdaBuilder {
  constructor(
    private scope: sst.Stack,
    private name: string,
  ) {}

  build() {
    const fn = new sst.Function(this.scope, this.name, {
      handler: `packages/functions/src/${this.name}.handler`,
    });

    new LogGroup(this.scope, `${this.name}Logs`, {
      logGroupName: `/aws/lambda/${fn.functionName}`,
      retention: setLogRetention(this.scope.stage),
      removalPolicy: setRemovalPolicy(this.scope.stage),
    });

    return fn;
  }
}
