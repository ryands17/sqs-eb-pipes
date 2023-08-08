import * as sst from 'sst/constructs';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as sfnTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';
import { Duration } from 'aws-cdk-lib';
import { LambdaBuilder } from './constructs';

export function SQSEBPipes({ stack }: sst.StackContext) {
  const getHandler = new LambdaBuilder(stack, 'sendSQSMessages').build();

  const api = new sst.Api(stack, 'api', {
    routes: {
      'GET /': { function: getHandler },
    },
  });

  const dlq = new sst.Queue(stack, 'dlq', {
    cdk: {
      queue: {
        visibilityTimeout: Duration.seconds(120),
      },
    },
  });

  const mainQueue = new sst.Queue(stack, 'mainQueue', {
    cdk: {
      queue: {
        visibilityTimeout: Duration.seconds(120),
        deadLetterQueue: {
          queue: dlq.cdk.queue,
          maxReceiveCount: 3,
        },
      },
    },
  });

  getHandler.bind([mainQueue]);

  const fetchUser = new sfnTasks.LambdaInvoke(stack, 'fetchUserTask', {
    lambdaFunction: new LambdaBuilder(stack, 'fetchUser').build(),
    payloadResponseOnly: true,
  });

  const fetchUserPosts = new sfnTasks.LambdaInvoke(stack, 'fetchPostsTask', {
    lambdaFunction: new LambdaBuilder(stack, 'fetchUserPosts').build(),
    payloadResponseOnly: true,
  });

  const stateMachineDefinition = fetchUser.next(fetchUserPosts);

  const usersAndPostsStateMachine = new sfn.StateMachine(stack, 'fetchUsers', {
    definition: stateMachineDefinition,
  });

  const enrichmentLambda = new LambdaBuilder(stack, 'enrichmentLambda')
    .setMemory('1024 MB')
    .setExecutionTime('20 seconds')
    .build();

  const sourcePolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: [
      'sqs:ReceiveMessage',
      'sqs:DeleteMessage',
      'sqs:GetQueueAttributes',
    ],
    resources: [mainQueue.queueArn],
  });

  const enrichmentLambdaPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['lambda:InvokeFunction'],
    resources: [enrichmentLambda.functionArn],
  });

  const targetPolicy = new iam.PolicyStatement({
    effect: iam.Effect.ALLOW,
    actions: ['states:StartExecution'],
    resources: [usersAndPostsStateMachine.stateMachineArn],
  });

  const pipeRole = new iam.Role(stack, 'pipeRole', {
    assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com'),
  });

  pipeRole.addToPolicy(sourcePolicy);
  pipeRole.addToPolicy(enrichmentLambdaPolicy);
  pipeRole.addToPolicy(targetPolicy);

  new CfnPipe(stack, 'usersPipe', {
    roleArn: pipeRole.roleArn,
    source: mainQueue.queueArn,
    sourceParameters: {
      sqsQueueParameters: { batchSize: 1 },
    },
    enrichment: enrichmentLambda.functionArn,
    target: usersAndPostsStateMachine.stateMachineArn,
    targetParameters: {
      stepFunctionStateMachineParameters: { invocationType: 'FIRE_AND_FORGET' },
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
