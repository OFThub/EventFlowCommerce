import * as cdk from 'aws-cdk-lib';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as events from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';

export interface StepFunctionsStackProps extends cdk.StackProps {
  eventBus: events.EventBus;
}

export class StepFunctionsStack extends cdk.Stack {
  public readonly stateMachine: sfn.StateMachine;

  constructor(scope: Construct, id: string, props: StepFunctionsStackProps) {
    super(scope, id, props);

    const reserveInventory = new tasks.EventBridgePutEvents(this, 'ReserveInventory', {
      entries: [
        {
          detail: sfn.TaskInput.fromObject({
            'eventId.$': 'States.UUID()',
            type: 'ReserveInventory',
            'occurredAt.$': '$$.State.EnteredTime',
            'aggregateId.$': '$.orderId',
            version: 1,
            'correlationId.$': '$.correlationId',
            payload: {
              'orderId.$': '$.orderId',
              'items.$': '$.items',
            },
          }),
          detailType: 'ReserveInventory',
          eventBus: props.eventBus,
          source: 'eventflow.saga',
        },
      ],
    });

    const authorizePayment = new tasks.EventBridgePutEvents(this, 'AuthorizePayment', {
      entries: [
        {
          detail: sfn.TaskInput.fromObject({
            'eventId.$': 'States.UUID()',
            type: 'AuthorizePayment',
            'occurredAt.$': '$$.State.EnteredTime',
            'aggregateId.$': '$.orderId',
            version: 1,
            'correlationId.$': '$.correlationId',
            payload: {
              'orderId.$': '$.orderId',
              'amount.$': '$.totalAmount',
            },
          }),
          detailType: 'AuthorizePayment',
          eventBus: props.eventBus,
          source: 'eventflow.saga',
        },
      ],
    });

    const createShipment = new tasks.EventBridgePutEvents(this, 'CreateShipment', {
      entries: [
        {
          detail: sfn.TaskInput.fromObject({
            'eventId.$': 'States.UUID()',
            type: 'CreateShipment',
            'occurredAt.$': '$$.State.EnteredTime',
            'aggregateId.$': '$.orderId',
            version: 1,
            'correlationId.$': '$.correlationId',
            payload: {
              'orderId.$': '$.orderId',
              'address.$': '$.shippingAddress',
            },
          }),
          detailType: 'CreateShipment',
          eventBus: props.eventBus,
          source: 'eventflow.saga',
        },
      ],
    });

    const completeOrder = new tasks.EventBridgePutEvents(this, 'CompleteOrder', {
      entries: [
        {
          detail: sfn.TaskInput.fromObject({
            'eventId.$': 'States.UUID()',
            type: 'CompleteOrder',
            'occurredAt.$': '$$.State.EnteredTime',
            'aggregateId.$': '$.orderId',
            version: 1,
            'correlationId.$': '$.correlationId',
            payload: {
              'orderId.$': '$.orderId',
            },
          }),
          detailType: 'CompleteOrder',
          eventBus: props.eventBus,
          source: 'eventflow.saga',
        },
      ],
    });

    const cancelOrder = new tasks.EventBridgePutEvents(this, 'CancelOrder', {
      entries: [
        {
          detail: sfn.TaskInput.fromObject({
            'eventId.$': 'States.UUID()',
            type: 'CancelOrder',
            'occurredAt.$': '$$.State.EnteredTime',
            'aggregateId.$': '$.orderId',
            version: 1,
            'correlationId.$': '$.correlationId',
            payload: {
              'orderId.$': '$.orderId',
              reason: 'Saga compensation',
            },
          }),
          detailType: 'CancelOrder',
          eventBus: props.eventBus,
          source: 'eventflow.saga',
        },
      ],
    });

    const definition = reserveInventory
      .next(authorizePayment)
      .next(createShipment)
      .next(completeOrder)
      .addCatch(cancelOrder, {
        resultPath: '$.error',
      });

    this.stateMachine = new sfn.StateMachine(this, 'PlaceOrderSagaStateMachine', {
      stateMachineName: 'PlaceOrderSaga',
      definition,
      timeout: cdk.Duration.minutes(5),
    });

    new cdk.CfnOutput(this, 'StateMachineArn', {
      value: this.stateMachine.stateMachineArn,
      description: 'Place Order Saga State Machine ARN',
    });
  }
}