import axios from "axios";

const CREDENTIALS_URL = `https://${process.env.API_HOSTNAME}/api/auth`;

export async function getLoginCredentials(): Promise<string> {
  try {
    const response = await axios.get(CREDENTIALS_URL);

    if (response.status !== 200) {
      throw new Error(`Received a non-OK status code: ${response.status}`);
    }

    return response.data;
  } catch(e) {
    console.log(e);
    throw new Error(e);
  }
}