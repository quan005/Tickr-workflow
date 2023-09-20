import { getOrder } from "@src/activities/api_request";

export async function isPositionFilled(
    optionSymbol: string,
    account_id: string,
  ): Promise<number> {
    const position = await getOrder(account_id, optionSymbol);
    if (position.status === "FILLED" && position.filledQuantity) {
      return position.filledQuantity;
    } else {
      return 0;
    }
}