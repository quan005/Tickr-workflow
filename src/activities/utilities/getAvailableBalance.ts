import { getAccount } from "@src/activities/api_request";
import { Account } from "@src/interfaces/account";

export async function getAvailableBalance( account_id: string): Promise<number> {
    const getAccountResponse: Account = await getAccount(account_id);
  
    const availableBalance = getAccountResponse.securitiesAccount.projectedBalances.cashAvailableForTrading;
    return availableBalance;
}