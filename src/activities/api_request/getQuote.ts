import * as https from "https";
import { getLoginCredentials } from "./getLoginCreds";
import { QuoteOptionMap } from "@src/interfaces/optionChain";

export async function getQuote(quote_symbol: string): Promise<QuoteOptionMap> {
    let token: string;

    try {
        token = await getLoginCredentials();
    } catch (error) {
        throw new Error(error.message)
    }

    const encodedtoken = encodeURIComponent(token);
    let data = "";
    return await new Promise((resolve) => {
      const postData = { token: encodedtoken, quoteSymbol: quote_symbol };
      const postDataAsString = JSON.stringify(postData);
      const authOptions = {
        host: `${process.env.API_HOSTNAME}`,
        path: "/api/td-quotes",
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
        });
        resp.on("close", () => {
          console.log(data);
          const parseJson = JSON.parse(data);
          if (parseJson.error) {
            throw new Error(`Get order error: ${parseJson.error}`);
          }
          return resolve(parseJson);
        });
      }).on("error", (e) => {
        throw new Error(`Get quote error: ${e.message}`);
      });
      response.on("timeout", () => {
        throw new Error("Connection timed out");
      });
      response.write(postDataAsString);
      response.end();
    });
  }