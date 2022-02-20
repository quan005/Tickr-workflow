import { PlaceOrdersResponse } from "../tda/models/order"

export interface OpenPositionSignal {
  position: PlaceOrdersResponse | null,
  noGoodBuys: boolean,
  demandOrSupply: string
}