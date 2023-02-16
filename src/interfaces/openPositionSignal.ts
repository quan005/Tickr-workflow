import { OrderDetails } from "../interfaces/orders";

export interface OpenPositionSignal {
  position: OrderDetails | null,
  demandOrSupply: string,
}