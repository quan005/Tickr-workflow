import axios from "axios";
import * as dotenv from 'dotenv';
import { OrdersConfig, PlaceOrdersResponse } from "@src/interfaces/orders";

dotenv.config();

const ORDER_URL = `https://${process.env.API_HOSTNAME}/api/td-place-order`;

export async function placeOrder(account_id: string, order_data: OrdersConfig): Promise<PlaceOrdersResponse> {
  try {
    const postData = {
      accountId: account_id,
      orderData: order_data,
    };

    const response = await axios.post(ORDER_URL, postData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status !== 200) {
      throw new Error(`Received a non-OK status code: ${response.status}`);
    }

    const dataObject = { orderSymbol: order_data.order.orderLegCollection[0].instrument.symbol };

    return dataObject;
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}