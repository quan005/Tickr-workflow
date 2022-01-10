import { Worker } from '@temporalio/worker'
import * as activities from './activities'

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflow'),
    activities,
    taskQueue: 'findPosition'
  })

  await worker.run()
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
})