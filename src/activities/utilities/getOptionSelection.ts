import * as moment from "moment-timezone";
import { getOptionChain } from "@src/activities/api_request";
import { filterOptionResponse } from "./filterOptionResponse";
import { ContractType, OptionChainResponse, RangeType } from "@src/interfaces/optionChain";
import { PositionSetup } from "@src/interfaces/positionSetup";

export async function getOptionsSelection(position_setup: string, reversal: boolean, symbol: string, budget: number): Promise<string> {
    let callOptionResponse: OptionChainResponse | null = null;
    let putOptionResponse: OptionChainResponse | null = null;
  
    const friday = moment().add((5 - moment().isoWeekday()), 'day').format('MM-DD');
    let holiday: boolean;
  
    if (friday === '04-07' || friday === '05-29' || friday === '06-19' || friday === '07-03' || friday === '07-04' || friday === '09-04') {
      holiday = true;
    }
  
    const endOfWeek = holiday ? 4 : 5;
    const toDate = moment().add((endOfWeek - moment().isoWeekday()), 'day').format('YYYY-MM-DD');
    const fromDate = moment().format('YYYY-MM-DD');
    const numberOfDaysAway = moment().isoWeekday() !== endOfWeek ? (endOfWeek - moment().isoWeekday()) : 0;
    const optionString = `${toDate}:${numberOfDaysAway}`;
    const newPositionSetup: PositionSetup = JSON.parse(position_setup);
  
    if (newPositionSetup.demand.primary !== null || newPositionSetup.supply.primary !== null && reversal === true) {
      callOptionResponse = await getOptionChain({ symbol: symbol, contractType: ContractType.CALL, range: RangeType.ITM, fromDate: fromDate, toDate: toDate, strikeCount: 20 });
    }
  
    if (newPositionSetup.supply.primary !== null || newPositionSetup.demand.primary !== null && reversal === true) {
      putOptionResponse = await getOptionChain({ symbol: symbol, contractType: ContractType.PUT, range: RangeType.ITM, fromDate: fromDate, toDate: toDate, strikeCount: 20 });
    }
  
    if (callOptionResponse !== null && putOptionResponse !== null) {
      const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL", budget);
      const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT", budget);
  
      if (call && put) {
        return JSON.stringify({
          CALL: {
            symbol: call.symbol,
            description: call.description,
            multiplier: call.multiplier,
            bid: call.bid,
            ask: call.ask,
            mark: call.mark,
            totalVolume: call.totalVolume,
            delta: call.delta,
            gamma: call.gamma,
            theta: call.theta,
            vega: call.vega,
            rho: call.rho,
            strikePrice: call.strikePrice
          },
          PUT: {
            symbol: put.symbol,
            description: put.description,
            multiplier: put.multiplier,
            bid: put.bid,
            ask: put.ask,
            mark: put.mark,
            totalVolume: put.totalVolume,
            delta: put.delta,
            gamma: put.gamma,
            theta: put.theta,
            vega: put.vega,
            rho: put.rho,
            strikePrice: put.strikePrice
          }
        });
      } else if (call) {
        return JSON.stringify({
          CALL: {
            symbol: call.symbol,
            description: call.description,
            multiplier: call.multiplier,
            bid: call.bid,
            ask: call.ask,
            mark: call.mark,
            totalVolume: call.totalVolume,
            delta: call.delta,
            gamma: call.gamma,
            theta: call.theta,
            vega: call.vega,
            rho: call.rho,
            strikePrice: call.strikePrice
          },
          PUT: null
        });
      } else if (put) {
        return JSON.stringify({
          CALL: null,
          PUT: {
            symbol: put.symbol,
            description: put.description,
            multiplier: put.multiplier,
            bid: put.bid,
            ask: put.ask,
            mark: put.mark,
            totalVolume: put.totalVolume,
            delta: put.delta,
            gamma: put.gamma,
            theta: put.theta,
            vega: put.vega,
            rho: put.rho,
            strikePrice: put.strikePrice
          }
        });
      } else {
        return 'There are no call or put options that meet the requirements!';
      }
    } else if (callOptionResponse !== null) {
      const call = filterOptionResponse(callOptionResponse.callExpDateMap[optionString], "CALL", budget);
  
      if (call === null) {
        return 'There are no call options that meet the requirements!';
      }
  
      return JSON.stringify({
        CALL: {
          symbol: call.symbol,
          description: call.description,
          multiplier: call.multiplier,
          bid: call.bid,
          ask: call.ask,
          mark: call.mark,
          totalVolume: call.totalVolume,
          delta: call.delta,
          gamma: call.gamma,
          theta: call.theta,
          vega: call.vega,
          rho: call.rho,
          strikePrice: call.strikePrice
        },
        PUT: null
      });
    } else if (putOptionResponse !== null) {
      const put = filterOptionResponse(putOptionResponse.putExpDateMap[optionString], "PUT", budget);
  
      if (put === null) {
        return 'There are no put options that meet the requirements!';
      }
  
      return JSON.stringify({
        CALL: null,
        PUT: {
          symbol: put.symbol,
          description: put.description,
          multiplier: put.multiplier,
          bid: put.bid,
          ask: put.ask,
          mark: put.mark,
          totalVolume: put.totalVolume,
          delta: put.delta,
          gamma: put.gamma,
          theta: put.theta,
          vega: put.vega,
          rho: put.rho,
          strikePrice: put.strikePrice
        }
      });
    } else {
      return 'Both call and put responses were null!';
    }
  }