import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from "./activities/priceActionPosition";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "node:path";

dotenv.config();

async function run() {
  const connection = await NativeConnection.connect({
    address: `${process.env.TEMPORAL_GRPC_ENDPOINT}`,
    tls: {
      clientCertPair: {
        crt: fs.readFileSync(process.env.TLS_CERT),
        key: fs.readFileSync(process.env.TLS_KEY),
      }
    }
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
