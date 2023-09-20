import * as https from "https";
import { getLoginCredentials } from "./getLoginCreds";
import { OrdersConfig, PlaceOrdersResponse } from "@src/interfaces/orders";

export async function placeOrder(account_id: string, order_data: OrdersConfig): Promise<PlaceOrdersResponse> {
    let token: string;

    try {
        token = await getLoginCredentials();
    } catch (error) {
        throw new Error(error.message)
    }

    const encodedtoken = encodeURIComponent(token);
    let data = "";
    return await new Promise((resolve) => {
      const postData = {
        token: encodedtoken,
        accountId: account_id,
        orderData: order_data,
      };
      const postDataAsString = JSON.stringify(postData);
      const authOptions = {
        host: `${process.env.API_HOSTNAME}`,
        path: "/api/td-place-order",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postDataAsString),
        },
        rejectUnauthorized: false,
        timeout: 10000,
      };
      const response = https.request(authOptions, (resp) => {
        resp.on("data", (chunk) => {
          data += chunk;
          console.log("place order data", data);
        });
        resp.on("close", () => {
          const parseJson = JSON.parse(data);
          if (parseJson.error) {
            throw new Error("Place order error: order did not fill");
          }
          const dataObject = { orderSymbol: order_data.order.orderLegCollection[0].instrument.symbol };
          return resolve(dataObject);
        });
      }).on("error", (e) => {
        throw new Error(`Place order error: ${e.message}`);
      });
      response.on("timeout", () => {
        throw new Error("Connection timed out");
      });
      response.write(postDataAsString);
      response.end();
    });
  }