import {
    OrdersConfig,
    AssetType,
    ComplexOrderStrategyType,
    DurationType,
    InstructionType,
    OrderLegType,
    OrderStrategyType,
    OrderType,
    SessionType,
} from "@src/interfaces/orders";

export function createOrderRequest(
    symbol: string, 
    quantity: number, 
    account_id: string, 
    instruction: InstructionType
): OrdersConfig {
    return {
      accountId: account_id,
      order: {
        orderType: OrderType.MARKET,
        session: SessionType.NORMAL,
        duration: DurationType.DAY,
        orderStrategyType: OrderStrategyType.SINGLE,
        orderLegCollection: [{
          orderLegType: OrderLegType.OPTION,
          instruction,
          quantity,
          instrument: {
            assetType: AssetType.OPTION,
            symbol,
          },
        }],
        complexOrderStrategyType: ComplexOrderStrategyType.NONE,
      },
    };
}