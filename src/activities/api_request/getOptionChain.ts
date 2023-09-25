import axios from "axios";
import * as dotenv from 'dotenv';
import { OptionChainConfig, OptionChainResponse } from "@src/interfaces/optionChain";

dotenv.config();

const OPTION_CHAIN_URL = `https://${process.env.API_HOSTNAME}/api/td-option-chain`;

export async function getOptionChain(option_chain_config: OptionChainConfig): Promise<OptionChainResponse> {
    try {
      const postData = { optionChainConfig: option_chain_config };
      const response = await axios.post(OPTION_CHAIN_URL, postData, {
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