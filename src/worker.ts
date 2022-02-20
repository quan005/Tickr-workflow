import { Worker } from '@temporalio/worker'

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    taskQueue: 'priceActionPositions'
  })

  await worker.run()
}

run().catch((err) => {
  console.log(err);
  process.exit(1);
})