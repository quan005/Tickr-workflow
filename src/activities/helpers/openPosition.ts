import { getAvailableBalance } from "@src/activities/utilities";
import { getQuote, placeOrder } from "@src/activities/api_request";
import { OptionsSelection } from "@src/interfaces/optionsSelection";
import {
    AssetType,
    ComplexOrderStrategyType,
    DurationType,
    InstructionType,
    OrderLegType,
    OrderStrategyType,
    OrderType,
    PutCall,
    SessionType,
  } from "@src/interfaces/orders";

export async function openPosition(
    options: OptionsSelection,
    optionType: string,
    budget: number,
    account_id: string
  ): Promise<string> {
    let price = 0;
    let optionPrice = 0;
    let quantity = 0;
    let symbol = '';
    let strikePrice = 0;
    
    console.log('optionType', optionType);
    console.log('call', options.CALL);
    console.log('put', options.PUT);
  
    if (optionType === 'CALL' && options.CALL !== null) {
      const { symbol: callSymbol, strikePrice: callStrikePrice } = options.CALL;
      symbol = callSymbol;
      strikePrice = callStrikePrice;
    } else if (optionType === 'PUT' && options.PUT !== null) {
      const { symbol: putSymbol, strikePrice: putStrikePrice } = options.PUT;
      symbol = putSymbol;
      strikePrice = putStrikePrice;
    } else {
      return 'There are no call or put options selected for purchase!';
    }
  
    const accountBalance = await getAvailableBalance(account_id);
    const quoteOptionMap = await getQuote(symbol);
    console.log('Opening Option Details', quoteOptionMap);
    const optionDetails = quoteOptionMap[symbol];
    optionPrice = optionDetails.askPrice;
  
    quantity = Math.floor(budget / (optionPrice * 100));
    price = Math.floor(optionPrice * 100 * quantity);
  
    if (accountBalance < price) {
      return 'Account balance is too low!';
    }
  
    const openPositionResponse = await placeOrder(account_id, {
      accountId: account_id,
      order: {
        orderType: OrderType.LIMIT,
        price: optionPrice,
        session: SessionType.NORMAL,
        duration: DurationType.FILL_OR_KILL,
        orderStrategyType: OrderStrategyType.SINGLE,
        orderLegCollection: [
          {
            orderLegType: OrderLegType.OPTION,
            instruction: InstructionType.BUY_TO_OPEN,
            quantity,
            instrument: {
              assetType: AssetType.OPTION,
              symbol,
              putCall: optionType === 'CALL' ? PutCall.CALL : PutCall.PUT,
            },
          },
        ],
        complexOrderStrategyType: ComplexOrderStrategyType.NONE,
      },
    });
  
    if (openPositionResponse.error) {
      throw new Error(`Open position error: ${openPositionResponse.error}`);
    }
  
    return JSON.stringify({
      orderResponse: openPositionResponse,
      price: optionPrice,
      strikePrice,
      quantity,
      optionSymbol: symbol,
    });
  }