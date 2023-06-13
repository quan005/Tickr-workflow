import { OrderDetails } from "./orders";
import { PositionSetup } from "./positionSetup";

export interface OpenPositionSignal {
  position: OrderDetails | null,
  demandOrSupply: string,
  positionSetup: PositionSetup | null
}

export interface CutPositionSignal {
  position: OrderDetails | null,
  positionSetup: PositionSetup | null,
  quantity: number,
  isCut: boolean
}