import { Workflow } from '@temporalio/workflow'
import { PremarketData } from './premarketData'

export interface PriceAction extends Workflow {
  priceAction(premarketData: PremarketData): Promise<string>
}

export interface SwingPosition extends Workflow {
  swingPosition(order_id: string, quantity: number, optionSymbol: string): Promise<string>
}

export interface MarketLow extends Workflow {
  marketLow(marketData: object): Promise<string>
}