import { PlaceOrdersResponse } from "@src/interfaces/orders";

export async function getOptionSymbol(order: string): Promise<string> {
    const parsedOrder = JSON.parse(order);
    let orderSymbol: PlaceOrdersResponse;
  
    if (parsedOrder.position) {
      orderSymbol = parsedOrder.position.orderResponse;
    } else {
      orderSymbol = parsedOrder.orderResponse;
    }
  
    if (orderSymbol.orderSymbol) {
      return orderSymbol.orderSymbol;
    } else {
      throw new Error('There is not an order to get!' );
    }
  }