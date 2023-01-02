import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from "./activities/priceActionPosition";

async function run() {
  const connection = await NativeConnection.connect({
    address: `${process.env.TEMPORAL_GRPC_ENDPOINT}:7233`,
  });

  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'price-action-positions',
  });

  await worker.run();
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
});
