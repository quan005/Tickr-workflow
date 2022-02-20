export interface PlaceOrdersResponse {
  orderId: string;
}
export interface OrdersConfig {
  accountId: string;
  order: Order;
}
export interface CancelOrderConfig {
  accountId: string;
  orderId: string;
}
export interface CancelTime {
  date: string;
  shortFormat: boolean;
}

export interface GetOrderConfig {
  accountId:string,
  orderId: string;
}

export interface GetOrderResponse {
  session: SessionType;
  duration: DurationType;
  orderType: OrderType;
  cancelTime?: CancelTime;
  complexOrderStrategyType: ComplexOrderStrategyType;
  quantity?: number;
  filledQuantity?: number;
  remainingQuantity?: number;
  requestedDestination?: RequestedDestination;
  destinationLinkName?: string;
  releaseTime?: string;
  stopPrice?: number;
  stopPriceLinkBasis?: StopPriceLinkBasis;
  stopPriceLinkType?: StopPriceLinkType;
  stopPriceOffset?: number;
  stopType?: StopType;
  priceLinkBasis?: PriceLinkBasis;
  priceLinkType?: PriceLinkType;
  price?: number;
  taxLotMethod?: TaxLotMethod;
  orderLegCollection?: OrderLeg;
  activationPrice?: number,
  specialInstruction?: SpecialInstruction,
  orderStrategyType?: OrderStrategyType,
  orderId?: number,
  cancelable?: boolean,
  editable?: boolean,
  status?: Status,
  enteredTime?: string,
  closeTime?: string,
  tag?: string,
  accountId?: number,
  orderActivityCollection?: OrderActivity,
  replacingOrderCollection?: any,
  childOrderStrategies?: any,
  statusDescription?: string
}

export declare enum RequestedDestination {
  INET = "INET",
  ECN_ARCA = "ECN_ARCA",
  CBOE = "CBOE",
  AMEX = "AMEX",
  PHLX = "PHLX",
  ISE = "ISE",
  BOX = "BOX",
  NYSE = "NYSE",
  NASDAQ = "NASDAQ",
  BATS = "BATS",
  C2 = "C2",
  AUTO = "AUTO"
}
export declare enum StopPriceLinkBasis {
  MANUAL = "MANUAL",
  BASE = "BASE",
  TRIGGER = "TRIGGER",
  LAST = "LAST",
  BID = "BID",
  ASK = "ASK",
  ASK_BID = "ASK_BID",
  MARK = "MARK",
  AVERAGE = "AVERAGE"
}
export declare enum StopPriceLinkType {
  VALUE = "VALUE",
  PERCENT = "PERCENT",
  TICK = "TICK"
}
export declare enum StopType {
  STANDARD = "STANDARD",
  BID = "BID",
  ASK = "ASK",
  LAST = "LAST",
  MARK = "MARK"
}
export declare enum PriceLinkBasis {
  MANUAL = "MANUAL",
  BASE = "BASE",
  TRIGGER = "TRIGGER",
  LAST = "LAST",
  BID = "BID",
  ASK = "ASK",
  ASK_BID = "ASK_BID",
  MARK = "MARK",
  AVERAGE = "AVERAGE"
}
export interface Order {
  orderType: OrderType;
  price?: number;
  session: SessionType;
  duration: DurationType;
  orderStrategyType: OrderStrategyType;
  orderLegCollection: OrderLeg;
  cancelTime?: CancelTime;
  complexOrderStrategyType: ComplexOrderStrategyType;
  quantity?: number;
  filledQuantity?: number;
  remainingQuantity?: number;
  requestedDestination?: RequestedDestination;
  destinationLinkName?: string;
  releaseTime?: string;
  stopPrice?: number;
  stopPriceLinkBasis?: StopPriceLinkBasis;
  stopPriceLinkType?: StopPriceLinkType;
  stopPriceOffset?: number;
  stopType?: StopType;
  priceLinkBasis?: PriceLinkBasis;
  priceLinkType?: PriceLinkType;
  taxLotMethod?: TaxLotMethod;
}
export declare enum TaxLotMethod {
  FIFO = "",
  LIFO = "",
  HIGH_COST = "",
  LOW_COST = "",
  AVERAGE_COST = "",
  SPECIFIC_LOT = ""
}
export declare enum PriceLinkType {
  VALUE = "VALUE",
  PERCENT = "PERCENT",
  TICK = "TICK"
}
export declare enum OrderType {
  MARKET = "MARKET",
  LIMIT = "LIMIT",
  STOP = "STOP",
  STOP_LIMIT = "STOP_LIMIT",
  TRAILING_STOP = "TRAILING_STOP",
  MARKET_ON_CLOSE = "MARKET_ON_CLOSE",
  EXERCISE = "EXERCISE",
  TRAILING_STOP_LIMIT = "TRAILING_STOP_LIMIT",
  NET_DEBIT = "NET_DEBIT",
  NET_CREDIT = "NET_CREDIT",
  NET_ZERO = "NET_ZERO"
}
export declare enum SessionType {
  NORMAL = "NORMAL",
  AM = "AM",
  PM = "PM",
  SEAMLESS = "SEAMLESS"
}
export declare enum DurationType {
  DAY = "DAY",
  GOOD_TILL_CANCEL = "GOOD_TILL_CANCEL",
  FILL_OR_KILL = "FILL_OR_KILL"
}
export declare enum OrderStrategyType {
  SINGLE = "SINGLE",
  OCO = "OCO",
  TRIGGER = "TRIGGER"
}
export declare enum OrderLegType {
  EQUITY = "EQUITY",
  OPTION = "OPTION",
  INDEX = "INDEX",
  MUTUAL_FUND = "MUTUAL_FUND",
  CASH_EQUIVALENT = "CASH_EQUIVALENT",
  FIXED_INCOME = "FIXED_INCOME",
  CURRENCY = "CURRENCY"
}
export interface OrderLeg {
  orderLegType: OrderLegType;
  legId?: number;
  instruction: InstructionType;
  quantity: number;
  positionEffect: PositionEffect;
  quantityType?: QuantityType;
  instrument: Instrument | OptionInstrument;
}
export declare enum AssetType {
  EQUITY = "EQUITY",
  OPTION = "OPTION",
  INDEX = "INDEX",
  MUTUAL_FUND = "MUTUAL_FUND",
  CASH_EQUIVALENT = "CASH_EQUIVALENT",
  FIXED_INCOME = "FIXED_INCOME",
  CURRENCY = "CURRENCY"
}
export declare enum OptionInstrumentType {
  VANILLA = "VANILLA",
  BINARY = "BINARY",
  BARRIER = "BARRIER"
}
export declare enum PutCall {
  PUT = "PUT",
  CALL = "CALL"
}
export interface OptionInstrument {
  assetType: AssetType;
  cusip?: string;
  symbol: string;
  description?: string;
  type?: OptionInstrumentType;
  putCall?: PutCall;
  underlyingSymbol?: string;
  optionMultiplier?: number;
  optionDeliverables?: OptionDeliverable;
}
export interface OptionDeliverable {
  symbol: string;
  deliverableUnits: number;
  currencyType: CurrencyType;
  assetType: AssetType;
}
export declare enum CurrencyType {
  USD = "USD",
  CAD = "CAD",
  EUR = "EUR",
  JPY = "JPY"
}
export declare enum QuantityType {
  ALL_SHARES = "ALL_SHARES",
  DOLLARS = "DOLLARS",
  SHARES = "SHARES"
}
export declare enum PositionEffect {
  OPENING = "OPENING",
  CLOSING = "CLOSING",
  AUTOMATIC = "AUTOMATIC"
}
export declare enum InstructionType {
  BUY = "BUY",
  SELL = "SELL",
  BUY_TO_COVER = "BUY_TO_COVER",
  SELL_SHORT = "SELL_SHORT",
  BUY_TO_OPEN = "BUY_TO_OPEN",
  BUY_TO_CLOSE = "BUY_TO_CLOSE",
  SELL_TO_OPEN = "SELL_TO_OPEN",
  SELL_TO_CLOSE = "SELL_TO_CLOSE",
  EXCHANGE = "EXCHANGE"
}
export interface Instrument {
  symbol: string;
  assetType: AssetType;
}
export interface OrdersByQueryConfig {
  accountId?: string;
  maxResults?: number;
  fromEnteredTime?: string;
  toEnteredTime?: string;
  status?: 'AWAITING_PARENT_ORDER' | 'AWAITING_CONDITION';
}

export declare enum ComplexOrderStrategyType {
  NONE = "NONE",
  COVERED = "COVERED",
  VERTICAL = "VERTICAL",
  BACK_RATIO = "BACK_RATIO",
  CALENDAR = "CALENDAR",
  DIAGONAL = "DIAGONAL",
  STRADDLE = "STRADDLE",
  STRANGLE = "STRANGLE",
  COLLAR_SYNTHETIC = "COLLAR_SYNTHETIC",
  BUTTERFLY = "BUTTERFLY",
  CONDOR = "CONDOR",
  IRON_CONDOR = "IRON_CONDOR",
  VERTICAL_ROLL = "VERTICAL_ROLL",
  COLLAR_WITH_STOCK = "COLLAR_WITH_STOCK",
  DOUBLE_DIAGONAL = "DOUBLE_DIAGONAL",
  UNBALANCED_BUTTERFLY = "UNBALANCED_BUTTERFLY",
  UNBALANCED_CONDOR = "UNBALANCED_CONDOR",
  UNBALANCED_IRON_CONDOR = "UNBALANCED_IRON_CONDOR",
  UNBALANCED_VERTICAL_ROLL = "UNBALANCED_VERTICAL_ROLL",
  CUSTOM = "CUSTOM"
}

export declare enum SpecialInstruction {
  ALL_OR_NONE = 'ALL_OR_NONE', 
  DO_NOT_REDUCE = 'DO_NOT_REDUCE', 
  ALL_OR_NONE_DO_NOT_REDUCE = 'ALL_OR_NONE_DO_NOT_REDUCE'
}

export declare enum Status {
  AWAITING_PARENT_ORDER = 'AWAITING_PARENT_ORDER', 
  AWAITING_CONDITION = 'AWAITING_CONDITION', 
  AWAITING_MANUAL_REVIEW = 'AWAITING_MANUAL_REVIEW', 
  ACCEPTED = 'ACCEPTED', 
  AWAITING_UR_OUT = 'AWAITING_UR_OUT', 
  PENDING_ACTIVATION = 'PENDING_ACTIVATION',
  QUEUED = 'QUEUED', 
  WORKING = 'WORKING', 
  REJECTED = 'REJECTED', 
  PENDING_CANCEL = 'PENDING_CANCEL', 
  CANCELED = 'CANCELED', 
  PENDING_REPLACE = 'PENDING_REPLACE', 
  REPLACED = 'REPLACED', 
  FILLED = 'FILLED', 
  EXPIRED = 'EXPIRED'
}

export declare interface OrderActivity {
  activityType: ActivityType,
  executionType: string,
  quantity: number,
  orderRemainingQuantity: number,
  executionLegs: ExecutionLegs[]
}

export declare enum ActivityType {
  EXECUTION = 'EXECUTION', 
  ORDER_ACTION = 'ORDER_ACTION'
}

export declare interface ExecutionLegs {
  legId: number,
  quantity: number,
  mismarkedQuantity: number,
  price: number,
  time: string
}