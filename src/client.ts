import { Kafka } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Connection, WorkflowClient } from '@temporalio/client';
import { priceAction } from './workflows';
import { PremarketMessage, PremarketData } from './interfaces/premarketData';
import { CreateCaCertificate, CreateSignedCertificate } from './cert';
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "node:path";

dotenv.config();

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
        const premarketMessage: PremarketData = await schemaRegistry.decode(<Buffer>message.value);

        // const ca = CreateCaCertificate();

        // CreateSignedCertificate(ca);

        // connect to the Temporal Server and start workflow
        const connection = await Connection.connect({
          address: `${process.env.TEMPORAL_GRPC_ENDPOINT}`,
          // tls: {
          //   clientCertPair: {
          //     crt: fs.readFileSync(path.resolve(__dirname, './certs/cert.pem')),
          //     key: fs.readFileSync(path.resolve(__dirname, './certs/privkey.pem')),
          //   }
          // }
        });

        const temporalClient = new WorkflowClient({
          connection,
          namespace: 'default',
        });

        const priceActionResult = await temporalClient.start(priceAction, {
          args: [premarketMessage],
          workflowId: 'priceAction-' + Math.floor(Math.random() * 1000),
          taskQueue: 'price-action-positions',
          workflowTaskTimeout: 480000
        });

        console.log('priceAction result', priceActionResult.result());

        return resolve(priceActionResult);
      });
    }
  });
}


run().catch(err => {
  console.error(err);
  process.exit(1);
});
