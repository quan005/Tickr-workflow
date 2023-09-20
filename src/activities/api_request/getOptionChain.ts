import * as https from "https";
import { getLoginCredentials } from "./getLoginCreds";
import { OptionChainConfig, OptionChainResponse } from "@src/interfaces/optionChain";

export async function getOptionChain(option_chain_config: OptionChainConfig): Promise<OptionChainResponse> {
    let token: string;

    try {
        token = await getLoginCredentials();
    } catch (error) {
        throw new Error(error.message)
    }

    const encodedtoken = encodeURIComponent(token);
    let data = '';
  
    return await new Promise((resolve) => {
      const postData = { token: encodedtoken, optionChainConfig: option_chain_config };
      const postDataAsString = JSON.stringify(postData);
  
      const authOptions = {
        host: `${process.env.API_HOSTNAME}`,
        path: '/api/td-option-chain',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postDataAsString)
        },
        rejectUnauthorized: false,
        timeout: 10000
      };
  
      const response = https.request(authOptions, (resp) => {
        resp.on('data', (chunk) => {
          data += chunk;
          console.log('option data', data);
        });
  
        resp.on('end', () => {
          const parseJson = JSON.parse(data);
          const dataObject = JSON.parse(parseJson);
          console.log('option dataObject', dataObject);
          return resolve(dataObject);
        });
      }).on('error', (e) => {
        throw new Error(e.message);
      });
  
      response.on('timeout', () => {
        throw new Error('Connection timed out');
      });
  
      response.write(postDataAsString);
      response.end();
    });
  }