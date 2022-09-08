import { Worker } from '@temporalio/worker'
import * as activities from "./activities/priceActionPosition"

const workflowOption = () =>
  process.env.NODE_ENV === 'production'
    ? { workflowBundle: { path: require.resolve('../workflow-bundle.js') } }
    : { workflowsPath: require.resolve('./workflows') };
  
async function run() {
  const worker = await Worker.create({
    ...workflowOption(),
    activities,
    taskQueue: 'price-action-positions'
  })

  await worker.run()
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
})