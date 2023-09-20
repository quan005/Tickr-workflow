import { placeOrder } from "@src/activities/api_request";
import { createOrderRequest } from "@src/activities/utilities";
import { InstructionType } from "@src/interfaces/orders";

export async function closePosition(
    symbol: string, 
    quantity: number, 
    account_id: string
): Promise<string> {
    console.log(`close quantity = ${quantity}`);
    const closePositionResponse = await placeOrder(account_id, createOrderRequest(symbol, quantity, account_id, InstructionType.SELL_TO_CLOSE));
    return JSON.stringify({
      orderResponse: closePositionResponse
    });
}