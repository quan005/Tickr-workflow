import axios from "axios";
import * as dotenv from 'dotenv';
import { QuoteOptionMap } from "@src/interfaces/optionChain";

dotenv.config();

const QUOTE_URL = `https://${process.env.API_HOSTNAME}/api/td-quotes`;

export async function getQuote(quote_symbol: string): Promise<QuoteOptionMap> {
  try {
    const postData = { quoteSymbol: quote_symbol };
    const response = await axios.post(QUOTE_URL, postData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status !== 200) {
      throw new Error(`Received a non-OK status code: ${response.status}`);
    }

    return response.data;
  } catch(e) {
    console.log(e);
    throw new Error(e);
  }
}