import { Worker, NativeConnection } from '@temporalio/worker';
// import { MsgpackPayloadCodec } from './conversion/payloadCodec';
import * as activities from "./activities/priceActionPosition";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "node:path";

dotenv.config();

const workflowOption = () =>
  process.env.NODE_ENV === 'production' ? {
    workflowBundle: {
      codePath: require.resolve('../workflow-bundle.js'),
    },
  } : {
    workflowsPath: require.resolve('./workflows')
  };

async function run() {
  const connection = await NativeConnection.connect({
    address: `${process.env.TEMPORAL_GRPC_ENDPOINT}`,
    // tls: {
    //   clientCertPair: {
    //     crt: fs.readFileSync(path.resolve(__dirname, './certs/cert.pem')),
    //     key: fs.readFileSync(path.resolve(__dirname, './certs/privkey.pem')),
    //   }
    // }
  });

  // const payloadCodec = new MsgpackPayloadCodec();

  const worker = await Worker.create({
    connection,
    ...workflowOption(),
    activities,
    taskQueue: 'price-action-positions',
    // dataConverter: {
    //   payloadConverterPath: require.resolve('./conversion/payloadConverter'),
    //   payloadCodecs: [payloadCodec]
    // }
  });

  await worker.run();
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
});
