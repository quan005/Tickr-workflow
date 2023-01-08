import { Worker, NativeConnection } from '@temporalio/worker';
import * as activities from "./activities/priceActionPosition";
import * as dotenv from "dotenv";

dotenv.config();

const cert = Buffer.from(process.env.TLS_CERT, "utf-8");
const key = Buffer.from(process.env.TLS_KEY, "utf-8");

async function run() {
  const connection = await NativeConnection.connect({
    address: `${process.env.TEMPORAL_GRPC_ENDPOINT}`,
    tls: {
      clientCertPair: {
        crt: cert,
        key: key,
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
