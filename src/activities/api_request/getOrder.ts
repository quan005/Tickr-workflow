import * as https from "https";
import { getLoginCredentials } from "./getLoginCreds";
import { GetOrderResponse } from "@src/interfaces/orders";

export async function getOrder( 
    account_id: string, 
    order_symbol: string
  ): Promise<GetOrderResponse> {
    let token: string;

    try {
        token = await getLoginCredentials();
    } catch (error) {
        throw new Error(error.message)
    }

    const encodedtoken = encodeURIComponent(token);
    let data = '';
  
    return await new Promise((resolve) => {
      const postData = {
        token: encodedtoken,
        accountId: account_id,
        orderSymbol: order_symbol,
      };
      const postDataAsString = JSON.stringify(postData);
      const authOptions = {
        host: `${process.env.API_HOSTNAME}`,
        path: '/api/td-get-order',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postDataAsString),
        },
        rejectUnauthorized: false,
        timeout: 10000,
      };
      const response = https.request(authOptions, (resp) => {
        resp.on('data', (chunk) => {
          data += chunk;
        });
  
        resp.on('end', () => {
          const parseJson = JSON.parse(data);
          if (parseJson.error) {
            throw new Error(`Get order error: ${parseJson.error}`);
          }
          return resolve(parseJson);
        });
      }).on('error', (e) => {
        throw new Error(`Get order error: ${e.message}`);
      });
  
      response.on('timeout', () => {
        throw new Error('Connection timed out');
      });
  
      response.write(postDataAsString);
      response.end();
    });
  }