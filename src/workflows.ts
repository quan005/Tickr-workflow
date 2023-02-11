import { proxyActivities } from '@temporalio/workflow';
import * as activities from "./activities/priceActionPosition";
import { PremarketData } from "./interfaces/premarketData";
import { TokenJSON } from './interfaces/token';

const {
  is_market_open,
  get_current_price,
  get_surrounding_key_levels,
  get_position_setup,
  getOptionsSelection,
  waitToSignalOpenPosition,
  checkIfPositionFilled,
  getOptionSymbol,
  waitToSignalCutPosition,
  waitToSignalClosePosition,
  getLoginCredentials,
  getUserPrinciples } = proxyActivities<typeof activities>({
    startToCloseTimeout: 28800000,
  });

export async function priceAction(premarketData: PremarketData): Promise<string> {
  if (premarketData === undefined || premarketData === null) {
    return 'No Opportunities'
  }

  const budget = premarketData.budget;
  const clientId = premarketData.client_id;
  const accountId = premarketData.account_id;
  const keyLevels = premarketData.keyLevels;
  const demandZones = premarketData.demandZones;
  const supplyZones = premarketData.supplyZones;
  const symbol = premarketData.symbol;

  let token: TokenJSON = {
    access_token: null,
    refresh_token: null,
    access_token_expires_at: null,
    refresh_token_expires_at: null,
    logged_in: null,
    access_token_expires_at_date: null,
    refresh_token_expires_at_date: null
  };

  let gettingUserPrinciples = {
    userPrinciples: null,
    params: null,
  };

  const marketOpen = await is_market_open();

  if (marketOpen) {
    while (gettingUserPrinciples.params === null) {
      token = await getLoginCredentials(clientId);
      gettingUserPrinciples = await getUserPrinciples(token.access_token);
    }

    let params = gettingUserPrinciples.params;
    let adminConfig = {
      "service": "ADMIN",
      "command": "LOGIN",
      "requestid": "0",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "credential": params,
        "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
        "version": "1.0",
        "qoslevel": "0",
      },
    }
    let quoteConfig = {
      "service": "QUOTE",
      "requestid": "1",
      "command": "SUBS",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "keys": premarketData.symbol,
        "fields": "0,1,2,3,4,5",
      },
    };
    let bookConfig = {
      "service": "NASDAQ_BOOK",
      "requestid": "3",
      "command": "SUBS",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "keys": premarketData.symbol,
        "fields": "0,1,2,3",
      },
    };
    let timeSaleConfig = {
      "service": "TIMESALE_EQUITY",
      "requestid": "4",
      "command": "SUBS",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "keys": premarketData.symbol,
        "fields": "0,1,2,3",
      },
    };
    let loginRequest = {
      "requests": [
        adminConfig,
      ],
    };
    let marketRequest = {
      "requests": [
        quoteConfig,
      ],
    };
    let bookRequest = {
      "requests": [
        bookConfig,
      ],
    };
    let timeSalesRequest = {
      "requests": [
        timeSaleConfig,
      ],
    };

    let wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

    const currentPrice = await get_current_price(wsUri, loginRequest, marketRequest, demandZones, supplyZones);
    const surroundingKeyLevels = await get_surrounding_key_levels(currentPrice.closePrice, keyLevels);
    const positionSetup = await get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone);
    const optionSelection = await getOptionsSelection(positionSetup, symbol, token.access_token);


    token = {
      access_token: null,
      refresh_token: null,
      access_token_expires_at: null,
      refresh_token_expires_at: null,
      logged_in: null,
      access_token_expires_at_date: null,
      refresh_token_expires_at_date: null
    };

    gettingUserPrinciples = {
      userPrinciples: null,
      params: null,
    };

    while (gettingUserPrinciples.params === null) {
      token = await getLoginCredentials(clientId);
      gettingUserPrinciples = await getUserPrinciples(token.access_token);
    }

    params = gettingUserPrinciples.params;
    adminConfig = {
      "service": "ADMIN",
      "command": "LOGIN",
      "requestid": "0",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "credential": params,
        "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
        "version": "1.0",
        "qoslevel": "0",
      },
    }
    quoteConfig = {
      "service": "QUOTE",
      "requestid": "1",
      "command": "SUBS",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "keys": premarketData.symbol,
        "fields": "0,1,2,3,4,5",
      },
    };
    bookConfig = {
      "service": "NASDAQ_BOOK",
      "requestid": "3",
      "command": "SUBS",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "keys": premarketData.symbol,
        "fields": "0,1,2,3",
      },
    };
    timeSaleConfig = {
      "service": "TIMESALE_EQUITY",
      "requestid": "4",
      "command": "SUBS",
      "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
      "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
      "parameters": {
        "keys": premarketData.symbol,
        "fields": "0,1,2,3",
      },
    };
    loginRequest = {
      "requests": [
        adminConfig,
      ],
    };
    marketRequest = {
      "requests": [
        quoteConfig,
      ],
    };
    bookRequest = {
      "requests": [
        bookConfig,
      ],
    };
    timeSalesRequest = {
      "requests": [
        timeSaleConfig,
      ],
    };

    wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

    const signalOpenPosition = await waitToSignalOpenPosition(wsUri, loginRequest, bookRequest, timeSalesRequest, positionSetup, optionSelection, budget, accountId, token.access_token);

    token = {
      access_token: null,
      refresh_token: null,
      access_token_expires_at: null,
      refresh_token_expires_at: null,
      logged_in: null,
      access_token_expires_at_date: null,
      refresh_token_expires_at_date: null
    };

    gettingUserPrinciples = {
      userPrinciples: null,
      params: null,
    };

    if (signalOpenPosition.position) {
      const quantity = await checkIfPositionFilled(signalOpenPosition.position, accountId, token.access_token);
      const optionSymbol = await getOptionSymbol(signalOpenPosition.position, accountId, token.access_token);

      while (gettingUserPrinciples.params === null) {
        token = await getLoginCredentials(clientId);
        gettingUserPrinciples = await getUserPrinciples(token.access_token);
      }

      params = gettingUserPrinciples.params;
      adminConfig = {
        "service": "ADMIN",
        "command": "LOGIN",
        "requestid": "0",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "credential": params,
          "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
          "version": "1.0",
          "qoslevel": "0",
        },
      }
      quoteConfig = {
        "service": "QUOTE",
        "requestid": "1",
        "command": "SUBS",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3,4,5",
        },
      };
      bookConfig = {
        "service": "NASDAQ_BOOK",
        "requestid": "3",
        "command": "SUBS",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3",
        },
      };
      timeSaleConfig = {
        "service": "TIMESALE_EQUITY",
        "requestid": "4",
        "command": "SUBS",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3",
        },
      };
      loginRequest = {
        "requests": [
          adminConfig,
        ],
      };
      marketRequest = {
        "requests": [
          quoteConfig,
        ],
      };
      bookRequest = {
        "requests": [
          bookConfig,
        ],
      };
      timeSalesRequest = {
        "requests": [
          timeSaleConfig,
        ],
      };

      wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

      const cutFilled = await waitToSignalCutPosition(wsUri, loginRequest, bookRequest, timeSalesRequest, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);
      const remainingQuantity = quantity - cutFilled

      token = {
        access_token: null,
        refresh_token: null,
        access_token_expires_at: null,
        refresh_token_expires_at: null,
        logged_in: null,
        access_token_expires_at_date: null,
        refresh_token_expires_at_date: null
      };

      gettingUserPrinciples = {
        userPrinciples: null,
        params: null,
      };

      while (gettingUserPrinciples.params === null) {
        token = await getLoginCredentials(clientId);
        gettingUserPrinciples = await getUserPrinciples(token.access_token);
      }

      params = gettingUserPrinciples.params;
      adminConfig = {
        "service": "ADMIN",
        "command": "LOGIN",
        "requestid": "0",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "credential": params,
          "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
          "version": "1.0",
          "qoslevel": "0",
        },
      }
      quoteConfig = {
        "service": "QUOTE",
        "requestid": "1",
        "command": "SUBS",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3,4,5",
        },
      };
      bookConfig = {
        "service": "NASDAQ_BOOK",
        "requestid": "3",
        "command": "SUBS",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3",
        },
      };
      timeSaleConfig = {
        "service": "TIMESALE_EQUITY",
        "requestid": "4",
        "command": "SUBS",
        "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
        "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
        "parameters": {
          "keys": premarketData.symbol,
          "fields": "0,1,2,3",
        },
      };
      loginRequest = {
        "requests": [
          adminConfig,
        ],
      };
      marketRequest = {
        "requests": [
          quoteConfig,
        ],
      };
      bookRequest = {
        "requests": [
          bookConfig,
        ],
      };
      timeSalesRequest = {
        "requests": [
          timeSaleConfig,
        ],
      };

      wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

      const signalClosePosition = await waitToSignalClosePosition(wsUri, loginRequest, bookRequest, timeSalesRequest, optionSymbol, remainingQuantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);

      return signalClosePosition.orderId;
    } else {
      return 'NOGOODPOSITIONS';
    }
  } else {
    return 'MARKETCLOSED';
  }
}