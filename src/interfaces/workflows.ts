import { Workflow } from '@temporalio/workflow'

export interface FindPosition extends Workflow {
  findPosition(premarketData: object): Promise<string>
}