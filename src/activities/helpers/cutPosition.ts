import { placeOrder } from "@src/activities/api_request";
import { createOrderRequest } from "@src/activities/utilities";
import { InstructionType } from "@src/interfaces/orders";

export async function cutPosition(
    symbol: string, 
    quantity: number, 
    account_id: string
  ): Promise<string> {
    const newQuantity = Math.floor(quantity / 2);
  
    console.log(`cut quantity = ${newQuantity}`);
    const cutPositionResponse = await placeOrder(account_id, createOrderRequest(symbol, newQuantity, account_id, InstructionType.SELL_TO_CLOSE));
  
    return JSON.stringify({
      orderResponse: cutPositionResponse
    });
  }