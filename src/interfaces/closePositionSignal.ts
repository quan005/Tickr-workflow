import { PlaceOrdersResponse } from "../tda/models/order"

export interface ClosePositionSignal {
  position: PlaceOrdersResponse | null,
  noGoodBuys: Boolean
}