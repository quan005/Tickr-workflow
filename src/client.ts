import { Kafka } from 'kafkajs'
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry'
import { Connection, WorkflowClient } from '@temporalio/client'
import { PriceAction } from './interfaces/workflows'
import { priceAction } from './workflows/priceAction'
import { PremarketData } from './interfaces/premarketData'

// need to connect to kafka topic and cosume the message
const broker = <string> process.env.BROKER
const schemaRegistryUrl = <string> process.env.SCHEMA_REGISTRY_URL

const kafka = new Kafka({
  clientId: 'find-position-client',
  brokers: [broker]
})

const schemaRegistry = new SchemaRegistry({
  host: schemaRegistryUrl
})

const consumer = kafka.consumer({
  groupId: 'find-position-group',
  sessionTimeout: 28800000
})

const run = async () => {
  await consumer.connect()
  await consumer.subscribe({
    topic: 'find-position'
  })

  await consumer.run({
    eachMessage: async ({topic, partition, message}) => {
      new Promise( async (resolve, reject) => {
        // decode the kafka message using schema registry
        const decodedMessage: PremarketData = await schemaRegistry.decode(<Buffer> message.value)
        
        // connect to the Temporal Server and start workflow
        const temporalConnection = new Connection({
          address: '10.244.0.27:7233'
        })
        const temporalClient = new WorkflowClient(temporalConnection.service, {
          namespace: 'default'
        })
        const priceActionResult = await temporalClient.execute(priceAction, {
          args: [decodedMessage],
          workflowId: 'priceAction-' + Math.floor(Math.random() * 1000),
          taskQueue: 'price-action-positions'
        })
        
        return resolve(priceActionResult)
      })
    }
  })
}


run().catch(err => {
  console.error(err);
  process.exit(1);
})