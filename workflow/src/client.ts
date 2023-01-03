import { Kafka } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Connection, WorkflowClient } from '@temporalio/client';
import { priceAction } from './workflows';
import { PremarketMessage, PremarketData } from './interfaces/premarketData';
import * as dotenv from "dotenv";

dotenv.config();

const cert = Buffer.from(process.env.TLS_CERT, "utf-8");
const key = Buffer.from(process.env.TLS_KEY, "utf-8");

// need to connect to kafka topic and consume the message
const broker: string = process.env.KAFKA_BROKER;
const schemaRegistryUrl: string = process.env.SCHEMA_REGISTRY_URL;

const kafka = new Kafka({
  clientId: 'find-position-client',
  brokers: [`${broker}:9092`],
});

const schemaRegistry = new SchemaRegistry({
  host: schemaRegistryUrl,
});

const consumer = kafka.consumer({
  groupId: 'find-position-group'
});

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({
    topic: 'find-position'
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      new Promise(async (resolve) => {
        // decode the kafka message using schema registry
        const decodedMessage: PremarketMessage = await schemaRegistry.decode(<Buffer>message.value);

        const premarketMessage: PremarketData = decodedMessage.Premarket

        // connect to the Temporal Server and start workflow
        const connection = await Connection.connect({
          address: `${process.env.TEMPORAL_GRPC_ENDPOINT}:7233`,
          tls: {
            clientCertPair: {
              crt: cert,
              key: key,
            }
          }
        });

        const temporalClient = new WorkflowClient({
          connection,
          namespace: 'default',
        });

        const priceActionResult = await temporalClient.start(priceAction, {
          args: [premarketMessage],
          workflowId: 'priceAction-' + Math.floor(Math.random() * 1000),
          taskQueue: 'price-action-positions',
        });

        return resolve(priceActionResult);
      });
    }
  });
}


run().catch(err => {
  console.error(err);
  process.exit(1);
});
