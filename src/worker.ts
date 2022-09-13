import { Worker, NativeConnection } from '@temporalio/worker'
import * as activities from "./activities/priceActionPosition"

// const workflowOption = () =>
//   process.env.NODE_ENV === 'production'
//     ? { 
//         workflowBundle: { 
//           codePath: require.resolve('../workflow-bundle.js') 
//         },
//       }
//     : {workflowsPath: require.resolve('./workflows')  };
  
async function run() {
  const connection = await NativeConnection.connect({
    address: `${process.env.TEMPORAL_CLUSTER_ADDRESS}`
  }) 

  const worker = await Worker.create({
    connection,
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'price-action-positions'
  })

  await worker.run()
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
})