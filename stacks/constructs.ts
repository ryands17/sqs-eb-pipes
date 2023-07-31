import * as sst from 'sst/constructs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Writable, AppStage } from './utils';

export function setLogRetention(stage: AppStage) {
  return stage === 'prod' ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK;
}

export class LambdaBuilder {
  props: Writable<sst.FunctionProps> = {};

  constructor(
    private scope: sst.Stack,
    private name: string,
  ) {}

  setMemory(memory: sst.Size) {
    this.props.memorySize = memory;
    return this;
  }

  setExecutionTime(time: sst.Duration) {
    this.props.timeout = time;
    return this;
  }

  build() {
    const fn = new sst.Function(this.scope, this.name, {
      handler: `packages/functions/src/${this.name}.handler`,
      ...this.props,
    });

    new LogGroup(this.scope, `${this.name}Logs`, {
      logGroupName: `/aws/lambda/${fn.functionName}`,
      retention: setLogRetention(this.scope.stage),
    });

    return fn;
  }
}
