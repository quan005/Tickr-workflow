import { PlaceOrdersResponse } from "../interfaces/orders";

export interface OpenPositionSignal {
  position: PlaceOrdersResponse | null,
  noGoodBuys: boolean,
  demandOrSupply: string,
}