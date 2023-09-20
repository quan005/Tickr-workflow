import * as https from "https";
import { getLoginCredentials } from "./getLoginCreds";
import { Account } from "@src/interfaces/account";

export async function getAccount(account_id: string): Promise<Account> {
    let token: string;

    try {
        token = await getLoginCredentials();
    } catch (error) {
        throw new Error(error.message)
    }

    const encodedtoken = encodeURIComponent(token);
  
    const postData = {
      token: encodedtoken,
      accountId: account_id
    };
  
    const postDataAsString = JSON.stringify(postData);
  
    const authOptions = {
      host: process.env.API_HOSTNAME,
      path: '/api/td-account',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postDataAsString)
      },
      rejectUnauthorized: false,
      timeout: 10000
    };
  
    let data = '';
  
    return new Promise((resolve, reject) => {
      const request = https.request(authOptions, (response) => {
        response.on('data', (chunk) => {
          data += chunk;
        });
  
        response.on('end', () => {
          try {
            const parseJson = JSON.parse(data);
            const dataObject = JSON.parse(parseJson);
            resolve(dataObject);
          } catch (error) {
            reject(new Error('Error parsing response data'));
          }
        });
      });
  
      request.on('error', (e) => {
        reject(new Error(e.message));
      });
  
      request.on('timeout', () => {
        reject(new Error('Connection timed out'));
      });
  
      request.write(postDataAsString);
      request.end();
    });
  }