import axios from "axios";
import * as dotenv from 'dotenv';
import { Account } from "@src/interfaces/account";

dotenv.config();

const ACCOUNT_URL = `https://${process.env.API_HOSTNAME}/api/td-account`;

export async function getAccount(account_id: string): Promise<Account> {
  try {
    const postData = {
      accountId: account_id
    };

    const response = await axios.post(ACCOUNT_URL, postData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status !== 200) {
      throw new Error(`Received a non-OK status code: ${response.status}`);
    };

    return response.data;
  } catch (e) {
    console.log(e);
    throw new Error(e);
  }
}