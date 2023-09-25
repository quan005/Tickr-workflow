import axios from "axios";
import * as dotenv from 'dotenv';
import { GetOrderResponse } from "@src/interfaces/orders";

dotenv.config();

const ORDER_URL = `https://${process.env.API_HOSTNAME}/api/td-get-order`;

export async function getOrder(account_id: string, order_symbol: string): Promise<GetOrderResponse> {
  try {
    const postData = {
      accountId: account_id,
      orderSymbol: order_symbol,
    };

    const response = await axios.post(ORDER_URL, postData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status !== 200) {
      throw new Error(`Received a non-OK status code: ${response.status}`);
    }

    return response.data;
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}