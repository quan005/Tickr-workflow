require('module-alias/register');
import * as activities from "../priceActionPosition";
import * as utilities from "../utilities";
import * as mockPremarketData from "../mocks/premarketData.mock";
// import * as moment from "moment-timezone";
// import { tdCredentialsToString } from "../../tda/middleware/tdCredentialToString";
// import { TokenJSON } from '../../interfaces/token';
// import {
//   AssetType,
//   ComplexOrderStrategyType,
//   DurationType,
//   InstructionType,
//   OrderLegType,
//   OrderStrategyType,
//   OrderType,
//   PutCall,
//   SessionType,
// } from "../../interfaces/orders";
import * as dotenv from "dotenv";
dotenv.config();


// it("returns an object with userid equal to TD_USERNAME env variable", async () => {
//   const premarketData = mockPremarketData.premarketData;
//   const currentPrice = await activities.getCurrentPrice(premarketData['symbol'], premarketData["demandZones"], premarketData["supplyZones"]);
//   console.log('currentPrice', currentPrice);
// //   expect(typeof code).toEqual('');
// });

it("returns a object with the selected supply and demand zones", async () => {
    const supply = [
    {
        "top": 121.86,
        "bottom": 121.32,
        "datetime": "('NKE', Timestamp('2023-03-09 15:30:00'))"
    },
    {
        "top": 121.41,
        "bottom": 121.21,
        "datetime": "('NKE', Timestamp('2023-03-09 16:00:00'))"
    },
    {
        "top": 118.67,
        "bottom": 118.625,
        "datetime": "('NKE', Timestamp('2023-03-09 20:00:00'))"
    },
    {
        "top": 118.99,
        "bottom": 118.83,
        "datetime": "('NKE', Timestamp('2023-03-10 14:30:00'))"
    },
    {
        "top": 117.66,
        "bottom": 117.51,
        "datetime": "('NKE', Timestamp('2023-03-10 20:30:00'))"
    },
    {
        "top": 119.25,
        "bottom": 119,
        "datetime": "('NKE', Timestamp('2023-03-14 13:30:00'))"
    },
    {
        "top": 119.24,
        "bottom": 119.09,
        "datetime": "('NKE', Timestamp('2023-03-14 14:30:00'))"
    },
    {
        "top": 117.4,
        "bottom": 116.32,
        "datetime": "('NKE', Timestamp('2023-03-15 13:30:00'))"
    },
    {
        "top": 118.52,
        "bottom": 118.29,
        "datetime": "('NKE', Timestamp('2023-03-15 19:00:00'))"
    },
    {
        "top": 121.73,
        "bottom": 121.17,
        "datetime": "('NKE', Timestamp('2023-03-17 13:30:00'))"
    },
    {
        "top": 123.89,
        "bottom": 123.66,
        "datetime": "('NKE', Timestamp('2023-03-21 14:00:00'))"
    },
    {
        "top": 124.11,
        "bottom": 123.935,
        "datetime": "('NKE', Timestamp('2023-03-21 15:30:00'))"
    },
    {
        "top": 124.88,
        "bottom": 124.865,
        "datetime": "('NKE', Timestamp('2023-03-22 14:00:00'))"
    },
    {
        "top": 122.04,
        "bottom": 121.98,
        "datetime": "('NKE', Timestamp('2023-03-22 19:30:00'))"
    },
    {
        "top": 120.47,
        "bottom": 120.36,
        "datetime": "('NKE', Timestamp('2023-03-23 18:30:00'))"
    },
    {
        "top": 121.07,
        "bottom": 120.245,
        "datetime": "('NKE', Timestamp('2023-03-23 19:00:00'))"
    },
    {
        "top": 120.98,
        "bottom": 120.83,
        "datetime": "('NKE', Timestamp('2023-03-24 19:30:00'))"
    },
    {
        "top": 121.07,
        "bottom": 121.02,
        "datetime": "('NKE', Timestamp('2023-03-27 13:30:00'))"
    },
    {
        "top": 119.76,
        "bottom": 119.64,
        "datetime": "('NKE', Timestamp('2023-03-27 14:00:00'))"
    },
    {
        "top": 119.24,
        "bottom": 119.01,
        "datetime": "('NKE', Timestamp('2023-03-27 14:30:00'))"
    },
    {
        "top": 118.57,
        "bottom": 118.54,
        "datetime": "('NKE', Timestamp('2023-03-27 19:30:00'))"
    },
    {
        "top": 118.44,
        "bottom": 117.95,
        "datetime": "('NKE', Timestamp('2023-03-28 13:30:00'))"
    },
    {
        "top": 120.04,
        "bottom": 119.82,
        "datetime": "('NKE', Timestamp('2023-03-29 14:00:00'))"
    },
    {
        "top": 119.6187,
        "bottom": 119.39,
        "datetime": "('NKE', Timestamp('2023-03-29 14:30:00'))"
    },
    {
        "top": 121.44,
        "bottom": 121.03,
        "datetime": "('NKE', Timestamp('2023-03-30 13:30:00'))"
    },
    {
        "top": 122.85,
        "bottom": 122.5,
        "datetime": "('NKE', Timestamp('2023-04-03 13:30:00'))"
    },
    {
        "top": 122.44,
        "bottom": 122.41,
        "datetime": "('NKE', Timestamp('2023-04-03 14:00:00'))"
    },
    {
        "top": 122.235,
        "bottom": 122.13,
        "datetime": "('NKE', Timestamp('2023-04-03 14:30:00'))"
    },
    {
        "top": 122.59,
        "bottom": 122.49,
        "datetime": "('NKE', Timestamp('2023-04-05 14:00:00'))"
    },
    {
        "top": 121.12,
        "bottom": 121.07,
        "datetime": "('NKE', Timestamp('2023-04-05 17:00:00'))"
    },
    {
        "top": 121.19,
        "bottom": 120.99,
        "datetime": "('NKE', Timestamp('2023-04-05 19:30:00'))"
    },
    {
        "top": 119.54,
        "bottom": 119.51,
        "datetime": "('NKE', Timestamp('2023-04-06 13:30:00'))"
    },
    {
        "top": 120.43,
        "bottom": 120.38,
        "datetime": "('NKE', Timestamp('2023-04-06 19:30:00'))"
    },
    {
        "top": 124.08,
        "bottom": 124.04,
        "datetime": "('NKE', Timestamp('2023-04-11 19:30:00'))"
    },
    {
        "top": 124.76,
        "bottom": 124.76,
        "datetime": "('NKE', Timestamp('2023-04-12 13:30:00'))"
    },
    {
        "top": 124.2734,
        "bottom": 124.27,
        "datetime": "('NKE', Timestamp('2023-04-12 18:30:00'))"
    },
    {
        "top": 123.67,
        "bottom": 123.61,
        "datetime": "('NKE', Timestamp('2023-04-12 19:00:00'))"
    },
    {
        "top": 125.4,
        "bottom": 124.64,
        "datetime": "('NKE', Timestamp('2023-04-13 13:30:00'))"
    },
    {
        "top": 126.6714,
        "bottom": 126.64,
        "datetime": "('NKE', Timestamp('2023-04-13 19:00:00'))"
    },
    {
        "top": 126.58,
        "bottom": 126.58,
        "datetime": "('NKE', Timestamp('2023-04-13 19:30:00'))"
    },
    {
        "top": 126.155,
        "bottom": 126.15,
        "datetime": "('NKE', Timestamp('2023-04-14 19:00:00'))"
    },
    {
        "top": 126.16,
        "bottom": 126.01,
        "datetime": "('NKE', Timestamp('2023-04-14 19:30:00'))"
    },
    {
        "top": 126.48,
        "bottom": 126.03,
        "datetime": "('NKE', Timestamp('2023-04-17 13:30:00'))"
    },
    {
        "top": 127.28,
        "bottom": 127.23,
        "datetime": "('NKE', Timestamp('2023-04-18 13:30:00'))"
    },
    {
        "top": 125.72,
        "bottom": 125.6375,
        "datetime": "('NKE', Timestamp('2023-04-18 14:00:00'))"
    },
    {
        "top": 126.505,
        "bottom": 126.465,
        "datetime": "('NKE', Timestamp('2023-04-18 19:30:00'))"
    },
    {
        "top": 126,
        "bottom": 126,
        "datetime": "('NKE', Timestamp('2023-04-19 13:30:00'))"
    },
    {
        "top": 125.9,
        "bottom": 125.8739,
        "datetime": "('NKE', Timestamp('2023-04-19 19:00:00'))"
    },
    {
        "top": 125.7444,
        "bottom": 125.69,
        "datetime": "('NKE', Timestamp('2023-04-19 19:30:00'))"
    },
    {
        "top": 125.02,
        "bottom": 124.8,
        "datetime": "('NKE', Timestamp('2023-04-20 13:30:00'))"
    },
    {
        "top": 124.51,
        "bottom": 124.43,
        "datetime": "('NKE', Timestamp('2023-04-20 19:00:00'))"
    },
    {
        "top": 124.475,
        "bottom": 124.4,
        "datetime": "('NKE', Timestamp('2023-04-21 13:30:00'))"
    },
    {
        "top": 124.59,
        "bottom": 124.4,
        "datetime": "('NKE', Timestamp('2023-04-21 14:30:00'))"
    },
    {
        "top": 126.29,
        "bottom": 125.51,
        "datetime": "('NKE', Timestamp('2023-04-24 13:30:00'))"
    },
    {
        "top": 126.77,
        "bottom": 126.53,
        "datetime": "('NKE', Timestamp('2023-04-25 13:30:00'))"
    },
    {
        "top": 124.04,
        "bottom": 124.02,
        "datetime": "('NKE', Timestamp('2023-04-26 18:30:00'))"
    },
    {
        "top": 123.68,
        "bottom": 123.68,
        "datetime": "('NKE', Timestamp('2023-04-26 19:00:00'))"
    },
    {
        "top": 124.6,
        "bottom": 124.44,
        "datetime": "('NKE', Timestamp('2023-04-27 13:30:00'))"
    },
    {
        "top": 125.87,
        "bottom": 125.81,
        "datetime": "('NKE', Timestamp('2023-04-27 19:30:00'))"
    },
    {
        "top": 127.07,
        "bottom": 126.82,
        "datetime": "('NKE', Timestamp('2023-04-28 14:30:00'))"
    },
    {
        "top": 128.68,
        "bottom": 128.52,
        "datetime": "('NKE', Timestamp('2023-05-01 15:00:00'))"
    },
    {
        "top": 127.73,
        "bottom": 127.68,
        "datetime": "('NKE', Timestamp('2023-05-01 19:00:00'))"
    },
    {
        "top": 127.53,
        "bottom": 127.43,
        "datetime": "('NKE', Timestamp('2023-05-02 14:00:00'))"
    },
    {
        "top": 126.47,
        "bottom": 126.47,
        "datetime": "('NKE', Timestamp('2023-05-02 14:30:00'))"
    },
    {
        "top": 127.54,
        "bottom": 127.53,
        "datetime": "('NKE', Timestamp('2023-05-02 19:30:00'))"
    },
    {
        "top": 128.18,
        "bottom": 127.95,
        "datetime": "('NKE', Timestamp('2023-05-03 18:30:00'))"
    },
    {
        "top": 128.38,
        "bottom": 127.92,
        "datetime": "('NKE', Timestamp('2023-05-03 19:00:00'))"
    },
    {
        "top": 127.06,
        "bottom": 126.92,
        "datetime": "('NKE', Timestamp('2023-05-03 19:30:00'))"
    },
    {
        "top": 125.185,
        "bottom": 124.94,
        "datetime": "('NKE', Timestamp('2023-05-04 13:30:00'))"
    },
    {
        "top": 124.3599,
        "bottom": 124.27,
        "datetime": "('NKE', Timestamp('2023-05-04 14:30:00'))"
    },
    {
        "top": 123.97,
        "bottom": 123.7,
        "datetime": "('NKE', Timestamp('2023-05-04 19:30:00'))"
    },
    {
        "top": 126.53,
        "bottom": 126.41,
        "datetime": "('NKE', Timestamp('2023-05-05 13:30:00'))"
    },
    {
        "top": 127.0283,
        "bottom": 126.96,
        "datetime": "('NKE', Timestamp('2023-05-05 19:30:00'))"
    },
    {
        "top": 127.69,
        "bottom": 127.26,
        "datetime": "('NKE', Timestamp('2023-05-08 13:30:00'))"
    },
    {
        "top": 125.66,
        "bottom": 125.27,
        "datetime": "('NKE', Timestamp('2023-05-09 13:30:00'))"
    },
    {
        "top": 124.98,
        "bottom": 124.815,
        "datetime": "('NKE', Timestamp('2023-05-09 14:00:00'))"
    },
    {
        "top": 125.5,
        "bottom": 125.385,
        "datetime": "('NKE', Timestamp('2023-05-09 19:30:00'))"
    },
    {
        "top": 126.455,
        "bottom": 126.29,
        "datetime": "('NKE', Timestamp('2023-05-10 13:30:00'))"
    },
    {
        "top": 123.9,
        "bottom": 123.6,
        "datetime": "('NKE', Timestamp('2023-05-10 19:30:00'))"
    },
    {
        "top": 123.86,
        "bottom": 123.45,
        "datetime": "('NKE', Timestamp('2023-05-11 13:30:00'))"
    },
    {
        "top": 122.74,
        "bottom": 122.71,
        "datetime": "('NKE', Timestamp('2023-05-11 19:00:00'))"
    },
    {
        "top": 121.1599,
        "bottom": 120.99,
        "datetime": "('NKE', Timestamp('2023-05-12 13:30:00'))"
    },
    {
        "top": 119.95,
        "bottom": 119.82,
        "datetime": "('NKE', Timestamp('2023-05-15 13:30:00'))"
    },
    {
        "top": 117.8392,
        "bottom": 117.5,
        "datetime": "('NKE', Timestamp('2023-05-16 13:30:00'))"
    },
    {
        "top": 117.27,
        "bottom": 116.99,
        "datetime": "('NKE', Timestamp('2023-05-16 14:30:00'))"
    },
    {
        "top": 117.08,
        "bottom": 116.97,
        "datetime": "('NKE', Timestamp('2023-05-16 19:30:00'))"
    },
    {
        "top": 116.6,
        "bottom": 116.38,
        "datetime": "('NKE', Timestamp('2023-05-17 13:30:00'))"
    },
    {
        "top": 117.77,
        "bottom": 117.43,
        "datetime": "('NKE', Timestamp('2023-05-18 13:30:00'))"
    },
    {
        "top": 114.86,
        "bottom": 114.56,
        "datetime": "('NKE', Timestamp('2023-05-19 13:30:00'))"
    },
    {
        "top": 112.85,
        "bottom": 112.85,
        "datetime": "('NKE', Timestamp('2023-05-22 13:30:00'))"
    },
    {
        "top": 112.195,
        "bottom": 112.17,
        "datetime": "('NKE', Timestamp('2023-05-22 14:00:00'))"
    },
    {
        "top": 111.94,
        "bottom": 111.695,
        "datetime": "('NKE', Timestamp('2023-05-22 14:30:00'))"
    },
    {
        "top": 111,
        "bottom": 110.96,
        "datetime": "('NKE', Timestamp('2023-05-22 19:30:00'))"
    },
    {
        "top": 110.82,
        "bottom": 110.75,
        "datetime": "('NKE', Timestamp('2023-05-23 14:00:00'))"
    },
    {
        "top": 109.19,
        "bottom": 108.87,
        "datetime": "('NKE', Timestamp('2023-05-23 17:00:00'))"
    },
    {
        "top": 109.09,
        "bottom": 108.995,
        "datetime": "('NKE', Timestamp('2023-05-23 19:30:00'))"
    },
    {
        "top": 109.1,
        "bottom": 109,
        "datetime": "('NKE', Timestamp('2023-05-24 13:30:00'))"
    },
    {
        "top": 108.31,
        "bottom": 108.26,
        "datetime": "('NKE', Timestamp('2023-05-24 14:00:00'))"
    },
    {
        "top": 108.56,
        "bottom": 108.34,
        "datetime": "('NKE', Timestamp('2023-05-24 19:30:00'))"
    },
    {
        "top": 107.9,
        "bottom": 107.83,
        "datetime": "('NKE', Timestamp('2023-05-25 19:30:00'))"
    },
    {
        "top": 108.16,
        "bottom": 107.87,
        "datetime": "('NKE', Timestamp('2023-05-26 19:00:00'))"
    },
    {
        "top": 107.9,
        "bottom": 107.85,
        "datetime": "('NKE', Timestamp('2023-05-26 19:30:00'))"
    },
    {
        "top": 108.88,
        "bottom": 108.4,
        "datetime": "('NKE', Timestamp('2023-05-30 13:30:00'))"
    },
    {
        "top": 107.74,
        "bottom": 107.64,
        "datetime": "('NKE', Timestamp('2023-05-30 14:00:00'))"
    },
    {
        "top": 106.74,
        "bottom": 106.7,
        "datetime": "('NKE', Timestamp('2023-05-30 19:00:00'))"
    },
    {
        "top": 105.43,
        "bottom": 105.31,
        "datetime": "('NKE', Timestamp('2023-05-31 15:00:00'))"
    },
    {
        "top": 105.6519,
        "bottom": 105.59,
        "datetime": "('NKE', Timestamp('2023-05-31 19:00:00'))"
    },
    {
        "top": 106.01,
        "bottom": 105.42,
        "datetime": "('NKE', Timestamp('2023-05-31 19:30:00'))"
    },
    {
        "top": 104.31,
        "bottom": 104.18,
        "datetime": "('NKE', Timestamp('2023-06-01 13:30:00'))"
    },
    {
        "top": 104.22,
        "bottom": 104.01,
        "datetime": "('NKE', Timestamp('2023-06-01 19:00:00'))"
    },
    {
        "top": 103.97,
        "bottom": 103.92,
        "datetime": "('NKE', Timestamp('2023-06-01 19:30:00'))"
    },
    {
        "top": 107.86,
        "bottom": 107.63,
        "datetime": "('NKE', Timestamp('2023-06-02 13:30:00'))"
    },
    {
        "top": 108.42,
        "bottom": 108.14,
        "datetime": "('NKE', Timestamp('2023-06-02 19:00:00'))"
    },
    {
        "top": 108.385,
        "bottom": 108.09,
        "datetime": "('NKE', Timestamp('2023-06-02 19:30:00'))"
    },
    {
        "top": 107.325,
        "bottom": 107.11,
        "datetime": "('NKE', Timestamp('2023-06-05 14:00:00'))"
    },
    {
        "top": 105.71,
        "bottom": 105.7,
        "datetime": "('NKE', Timestamp('2023-06-05 18:30:00'))"
    },
    {
        "top": 105.71,
        "bottom": 105.55,
        "datetime": "('NKE', Timestamp('2023-06-05 19:30:00'))"
    },
    {
        "top": 106.13,
        "bottom": 105.695,
        "datetime": "('NKE', Timestamp('2023-06-06 14:00:00'))"
    },
    {
        "top": 108.07,
        "bottom": 108.015,
        "datetime": "('NKE', Timestamp('2023-06-07 17:00:00'))"
    },
    {
        "top": 107.98,
        "bottom": 107.97,
        "datetime": "('NKE', Timestamp('2023-06-07 19:30:00'))"
    },
    {
        "top": 106.09,
        "bottom": 106.03,
        "datetime": "('NKE', Timestamp('2023-06-09 14:30:00'))"
    },
    {
        "top": 106.02,
        "bottom": 105.975,
        "datetime": "('NKE', Timestamp('2023-06-09 19:30:00'))"
    },
    {
        "top": 106.5,
        "bottom": 106.29,
        "datetime": "('NKE', Timestamp('2023-06-12 13:30:00'))"
    },
    {
        "top": 105.24,
        "bottom": 105.09,
        "datetime": "('NKE', Timestamp('2023-06-12 14:00:00'))"
    },
    {
        "top": 107.295,
        "bottom": 107.29,
        "datetime": "('NKE', Timestamp('2023-06-13 14:30:00'))"
    },
    {
        "top": 107.27,
        "bottom": 107.2386,
        "datetime": "('NKE', Timestamp('2023-06-13 15:00:00'))"
    },
    {
        "top": 107.04,
        "bottom": 106.98,
        "datetime": "('NKE', Timestamp('2023-06-13 15:30:00'))"
    },
    {
        "top": 112.79,
        "bottom": 112.78,
        "datetime": "('NKE', Timestamp('2023-06-14 18:00:00'))"
    },
    {
        "top": 113.4,
        "bottom": 112.97,
        "datetime": "('NKE', Timestamp('2023-06-14 19:30:00'))"
    },
    {
        "top": 112,
        "bottom": 111.83,
        "datetime": "('NKE', Timestamp('2023-06-15 13:30:00'))"
    },
    {
        "top": 112.815,
        "bottom": 112.6701,
        "datetime": "('NKE', Timestamp('2023-06-15 19:30:00'))"
    },
    {
        "top": 114.56,
        "bottom": 114,
        "datetime": "('NKE', Timestamp('2023-06-16 13:30:00'))"
    },
    {
        "top": 114.13,
        "bottom": 113.77,
        "datetime": "('NKE', Timestamp('2023-06-16 19:30:00'))"
    },
    {
        "top": 112.815,
        "bottom": 111.41,
        "datetime": "('NKE', Timestamp('2023-06-20 13:30:00'))"
    },
    {
        "top": 110.5,
        "bottom": 110.35,
        "datetime": "('NKE', Timestamp('2023-06-20 14:00:00'))"
    },
    {
        "top": 110.1,
        "bottom": 109.62,
        "datetime": "('NKE', Timestamp('2023-06-21 14:00:00'))"
    },
    {
        "top": 110.305,
        "bottom": 110.24,
        "datetime": "('NKE', Timestamp('2023-06-21 19:30:00'))"
    },
    {
        "top": 111.11,
        "bottom": 110.75,
        "datetime": "('NKE', Timestamp('2023-06-22 13:30:00'))"
    },
    {
        "top": 110.94,
        "bottom": 110.85,
        "datetime": "('NKE', Timestamp('2023-06-22 19:00:00'))"
    },
    {
        "top": 110.64,
        "bottom": 110.55,
        "datetime": "('NKE', Timestamp('2023-06-22 19:30:00'))"
    },
    {
        "top": 109.25,
        "bottom": 109.1,
        "datetime": "('NKE', Timestamp('2023-06-23 14:00:00'))"
    },
    {
        "top": 110.02,
        "bottom": 109.96,
        "datetime": "('NKE', Timestamp('2023-06-23 19:30:00'))"
    },
    {
        "top": 112.15,
        "bottom": 112.07,
        "datetime": "('NKE', Timestamp('2023-06-26 19:30:00'))"
    },
    {
        "top": 113.44,
        "bottom": 113.35,
        "datetime": "('NKE', Timestamp('2023-06-27 14:30:00'))"
    },
    {
        "top": 113.97,
        "bottom": 113.89,
        "datetime": "('NKE', Timestamp('2023-06-27 19:30:00'))"
    },
    {
        "top": 113.745,
        "bottom": 113.34,
        "datetime": "('NKE', Timestamp('2023-06-28 13:30:00'))"
    },
    {
        "top": 113.13,
        "bottom": 113.07,
        "datetime": "('NKE', Timestamp('2023-06-28 14:00:00'))"
    },
    {
        "top": 113.185,
        "bottom": 113.12,
        "datetime": "('NKE', Timestamp('2023-06-28 19:00:00'))"
    },
    {
        "top": 114.07,
        "bottom": 114.06,
        "datetime": "('NKE', Timestamp('2023-06-29 14:00:00'))"
    },
    {
        "top": 113.46,
        "bottom": 113.21,
        "datetime": "('NKE', Timestamp('2023-06-29 14:30:00'))"
    },
    {
        "top": 112,
        "bottom": 111.59,
        "datetime": "('NKE', Timestamp('2023-06-30 13:30:00'))"
    },
    {
        "top": 111.78,
        "bottom": 111.68,
        "datetime": "('NKE', Timestamp('2023-06-30 14:30:00'))"
    },
    {
        "top": 110.95,
        "bottom": 110.65,
        "datetime": "('NKE', Timestamp('2023-06-30 19:30:00'))"
    },
    {
        "top": 111.3,
        "bottom": 111.06,
        "datetime": "('NKE', Timestamp('2023-07-03 13:30:00'))"
    },
    {
        "top": 109.57,
        "bottom": 109.55,
        "datetime": "('NKE', Timestamp('2023-07-03 16:30:00'))"
    },
    {
        "top": 108.905,
        "bottom": 108.62,
        "datetime": "('NKE', Timestamp('2023-07-05 13:30:00'))"
    },
    {
        "top": 108.0942,
        "bottom": 107.86,
        "datetime": "('NKE', Timestamp('2023-07-05 14:00:00'))"
    },
    {
        "top": 107.84,
        "bottom": 107.535,
        "datetime": "('NKE', Timestamp('2023-07-05 14:30:00'))"
    },
    {
        "top": 107.419,
        "bottom": 107.32,
        "datetime": "('NKE', Timestamp('2023-07-05 15:00:00'))"
    },
    {
        "top": 107.3275,
        "bottom": 107.17,
        "datetime": "('NKE', Timestamp('2023-07-05 15:30:00'))"
    },
    {
        "top": 106.88,
        "bottom": 106.85,
        "datetime": "('NKE', Timestamp('2023-07-05 16:00:00'))"
    },
    {
        "top": 106.09,
        "bottom": 105.29,
        "datetime": "('NKE', Timestamp('2023-07-06 13:30:00'))"
    },
    {
        "top": 105.21,
        "bottom": 105.13,
        "datetime": "('NKE', Timestamp('2023-07-06 14:00:00'))"
    },
    {
        "top": 105.32,
        "bottom": 105.14,
        "datetime": "('NKE', Timestamp('2023-07-06 19:30:00'))"
    },
    {
        "top": 104.87,
        "bottom": 104.8,
        "datetime": "('NKE', Timestamp('2023-07-07 13:30:00'))"
    },
    {
        "top": 104.98,
        "bottom": 104.88,
        "datetime": "('NKE', Timestamp('2023-07-07 14:30:00'))"
    },
    {
        "top": 105.1,
        "bottom": 105.02,
        "datetime": "('NKE', Timestamp('2023-07-07 19:30:00'))"
    },
    {
        "top": 106.31,
        "bottom": 106.03,
        "datetime": "('NKE', Timestamp('2023-07-10 14:00:00'))"
    },
    {
        "top": 107.45,
        "bottom": 107.27,
        "datetime": "('NKE', Timestamp('2023-07-11 17:30:00'))"
    },
    {
        "top": 109.09,
        "bottom": 108.525,
        "datetime": "('NKE', Timestamp('2023-07-12 13:30:00'))"
    },
    {
        "top": 109.13,
        "bottom": 109.07,
        "datetime": "('NKE', Timestamp('2023-07-13 13:30:00'))"
    },
    {
        "top": 108.1,
        "bottom": 107.98,
        "datetime": "('NKE', Timestamp('2023-07-13 19:00:00'))"
    },
    {
        "top": 108.09,
        "bottom": 107.95,
        "datetime": "('NKE', Timestamp('2023-07-13 19:30:00'))"
    },
    {
        "top": 108.31,
        "bottom": 108.31,
        "datetime": "('NKE', Timestamp('2023-07-14 14:00:00'))"
    },
    {
        "top": 107.935,
        "bottom": 107.83,
        "datetime": "('NKE', Timestamp('2023-07-14 14:30:00'))"
    },
    {
        "top": 108.025,
        "bottom": 107.93,
        "datetime": "('NKE', Timestamp('2023-07-14 15:30:00'))"
    },
    {
        "top": 108.12,
        "bottom": 107.95,
        "datetime": "('NKE', Timestamp('2023-07-14 19:00:00'))"
    },
    {
        "top": 109.0995,
        "bottom": 108.975,
        "datetime": "('NKE', Timestamp('2023-07-17 19:30:00'))"
    },
    {
        "top": 109.67,
        "bottom": 109.38,
        "datetime": "('NKE', Timestamp('2023-07-19 14:00:00'))"
    },
    {
        "top": 109.22,
        "bottom": 109.11,
        "datetime": "('NKE', Timestamp('2023-07-19 14:30:00'))"
    },
    {
        "top": 108.975,
        "bottom": 108.81,
        "datetime": "('NKE', Timestamp('2023-07-19 15:00:00'))"
    },
    {
        "top": 110.16,
        "bottom": 110.135,
        "datetime": "('NKE', Timestamp('2023-07-19 19:30:00'))"
    },
    {
        "top": 110.02,
        "bottom": 109.755,
        "datetime": "('NKE', Timestamp('2023-07-20 14:00:00'))"
    },
    {
        "top": 109.64,
        "bottom": 109.63,
        "datetime": "('NKE', Timestamp('2023-07-20 14:30:00'))"
    },
    {
        "top": 108.92,
        "bottom": 108.87,
        "datetime": "('NKE', Timestamp('2023-07-20 15:00:00'))"
    },
    {
        "top": 108.595,
        "bottom": 108.55,
        "datetime": "('NKE', Timestamp('2023-07-20 15:30:00'))"
    },
    {
        "top": 108.07,
        "bottom": 108.01,
        "datetime": "('NKE', Timestamp('2023-07-20 19:00:00'))"
    },
    {
        "top": 107.955,
        "bottom": 107.8,
        "datetime": "('NKE', Timestamp('2023-07-20 19:30:00'))"
    },
    {
        "top": 108.16,
        "bottom": 108,
        "datetime": "('NKE', Timestamp('2023-07-21 14:00:00'))"
    },
    {
        "top": 110.55,
        "bottom": 110.41,
        "datetime": "('NKE', Timestamp('2023-07-24 13:30:00'))"
    },
    {
        "top": 109.31,
        "bottom": 109.13,
        "datetime": "('NKE', Timestamp('2023-07-24 14:00:00'))"
    },
    {
        "top": 110.24,
        "bottom": 109.645,
        "datetime": "('NKE', Timestamp('2023-07-24 16:30:00'))"
    },
    {
        "top": 108.85,
        "bottom": 108.28,
        "datetime": "('NKE', Timestamp('2023-07-25 13:30:00'))"
    },
    {
        "top": 107.92,
        "bottom": 107.83,
        "datetime": "('NKE', Timestamp('2023-07-25 16:00:00'))"
    },
    {
        "top": 108.49,
        "bottom": 108.475,
        "datetime": "('NKE', Timestamp('2023-07-25 19:30:00'))"
    },
    {
        "top": 108.97,
        "bottom": 108.3,
        "datetime": "('NKE', Timestamp('2023-07-26 13:30:00'))"
    },
    {
        "top": 110.23,
        "bottom": 109.83,
        "datetime": "('NKE', Timestamp('2023-07-27 13:30:00'))"
    },
    {
        "top": 109.7,
        "bottom": 109.545,
        "datetime": "('NKE', Timestamp('2023-07-27 14:00:00'))"
    },
    {
        "top": 108.959,
        "bottom": 107.97,
        "datetime": "('NKE', Timestamp('2023-07-28 13:30:00'))"
    },
    {
        "top": 110.08,
        "bottom": 109.405,
        "datetime": "('NKE', Timestamp('2023-07-31 13:30:00'))"
    },
    {
        "top": 110.55,
        "bottom": 110.305,
        "datetime": "('NKE', Timestamp('2023-07-31 15:30:00'))"
    },
    {
        "top": 110.54,
        "bottom": 110.5,
        "datetime": "('NKE', Timestamp('2023-07-31 19:00:00'))"
    },
    {
        "top": 109.68,
        "bottom": 109.52,
        "datetime": "('NKE', Timestamp('2023-08-01 19:30:00'))"
    },
    {
        "top": 108.515,
        "bottom": 108.32,
        "datetime": "('NKE', Timestamp('2023-08-02 13:30:00'))"
    },
    {
        "top": 108.28,
        "bottom": 108.1,
        "datetime": "('NKE', Timestamp('2023-08-02 14:00:00'))"
    },
    {
        "top": 108.36,
        "bottom": 108.17,
        "datetime": "('NKE', Timestamp('2023-08-02 15:30:00'))"
    },
    {
        "top": 108.795,
        "bottom": 108.645,
        "datetime": "('NKE', Timestamp('2023-08-03 19:30:00'))"
    },
    {
        "top": 108.9,
        "bottom": 108.71,
        "datetime": "('NKE', Timestamp('2023-08-04 13:30:00'))"
    },
    {
        "top": 108.937,
        "bottom": 108.79,
        "datetime": "('NKE', Timestamp('2023-08-04 19:00:00'))"
    },
    {
        "top": 110.9399,
        "bottom": 109.87,
        "datetime": "('NKE', Timestamp('2023-08-07 13:30:00'))"
    },
    {
        "top": 109.89,
        "bottom": 109.63,
        "datetime": "('NKE', Timestamp('2023-08-08 13:30:00'))"
    },
    {
        "top": 108.2751,
        "bottom": 108.21,
        "datetime": "('NKE', Timestamp('2023-08-08 14:00:00'))"
    },
    {
        "top": 108.055,
        "bottom": 108.05,
        "datetime": "('NKE', Timestamp('2023-08-08 14:30:00'))"
    },
    {
        "top": 109.52,
        "bottom": 109.325,
        "datetime": "('NKE', Timestamp('2023-08-08 19:00:00'))"
    },
    {
        "top": 109.08,
        "bottom": 108.94,
        "datetime": "('NKE', Timestamp('2023-08-09 15:30:00'))"
    },
    {
        "top": 110.01,
        "bottom": 109.95,
        "datetime": "('NKE', Timestamp('2023-08-09 19:00:00'))"
    },
    {
        "top": 109.985,
        "bottom": 109.905,
        "datetime": "('NKE', Timestamp('2023-08-09 19:30:00'))"
    },
    {
        "top": 111.95,
        "bottom": 111.88,
        "datetime": "('NKE', Timestamp('2023-08-10 14:00:00'))"
    },
    {
        "top": 111.7216,
        "bottom": 111.68,
        "datetime": "('NKE', Timestamp('2023-08-10 14:30:00'))"
    },
    {
        "top": 111.17,
        "bottom": 111.145,
        "datetime": "('NKE', Timestamp('2023-08-10 15:00:00'))"
    },
    {
        "top": 109.36,
        "bottom": 108.9,
        "datetime": "('NKE', Timestamp('2023-08-11 13:30:00'))"
    },
    {
        "top": 108.26,
        "bottom": 108.21,
        "datetime": "('NKE', Timestamp('2023-08-11 19:00:00'))"
    },
    {
        "top": 108.08,
        "bottom": 107.92,
        "datetime": "('NKE', Timestamp('2023-08-14 13:30:00'))"
    },
    {
        "top": 107.645,
        "bottom": 107.59,
        "datetime": "('NKE', Timestamp('2023-08-14 19:00:00'))"
    },
    {
        "top": 106.77,
        "bottom": 106.07,
        "datetime": "('NKE', Timestamp('2023-08-15 13:30:00'))"
    },
    {
        "top": 106.82,
        "bottom": 106.505,
        "datetime": "('NKE', Timestamp('2023-08-15 19:00:00'))"
    },
    {
        "top": 107.34,
        "bottom": 107.3,
        "datetime": "('NKE', Timestamp('2023-08-16 19:00:00'))"
    },
    {
        "top": 107.12,
        "bottom": 107.04,
        "datetime": "('NKE', Timestamp('2023-08-16 19:30:00'))"
    },
    {
        "top": 105.6,
        "bottom": 105.58,
        "datetime": "('NKE', Timestamp('2023-08-17 18:30:00'))"
    },
    {
        "top": 105.25,
        "bottom": 105.17,
        "datetime": "('NKE', Timestamp('2023-08-17 19:30:00'))"
    },
    {
        "top": 104.54,
        "bottom": 104.38,
        "datetime": "('NKE', Timestamp('2023-08-18 15:30:00'))"
    },
    {
        "top": 104.42,
        "bottom": 104.42,
        "datetime": "('NKE', Timestamp('2023-08-18 19:00:00'))"
    },
    {
        "top": 105.47,
        "bottom": 105.47,
        "datetime": "('NKE', Timestamp('2023-08-21 13:30:00'))"
    },
    {
        "top": 104.48,
        "bottom": 104.48,
        "datetime": "('NKE', Timestamp('2023-08-21 14:00:00'))"
    },
    {
        "top": 103.29,
        "bottom": 103.14,
        "datetime": "('NKE', Timestamp('2023-08-21 15:30:00'))"
    },
    {
        "top": 103.135,
        "bottom": 102.89,
        "datetime": "('NKE', Timestamp('2023-08-21 19:30:00'))"
    },
    {
        "top": 102.35,
        "bottom": 102,
        "datetime": "('NKE', Timestamp('2023-08-22 14:00:00'))"
    },
    {
        "top": 102.06,
        "bottom": 102.05,
        "datetime": "('NKE', Timestamp('2023-08-22 15:00:00'))"
    },
    {
        "top": 101.97,
        "bottom": 101.895,
        "datetime": "('NKE', Timestamp('2023-08-22 15:30:00'))"
    },
    {
        "top": 101.71,
        "bottom": 101.67,
        "datetime": "('NKE', Timestamp('2023-08-22 16:00:00'))"
    },
    {
        "top": 101.49,
        "bottom": 101.22,
        "datetime": "('NKE', Timestamp('2023-08-22 16:30:00'))"
    },
    {
        "top": 98.15,
        "bottom": 97.97,
        "datetime": "('NKE', Timestamp('2023-08-23 14:00:00'))"
    },
    {
        "top": 98.92,
        "bottom": 98.83,
        "datetime": "('NKE', Timestamp('2023-08-23 19:30:00'))"
    },
    {
        "top": 98.21,
        "bottom": 98.18,
        "datetime": "('NKE', Timestamp('2023-08-24 19:30:00'))"
    },
    {
        "top": 99.02,
        "bottom": 98.835,
        "datetime": "('NKE', Timestamp('2023-08-25 19:00:00'))"
    },
    {
        "top": 99.625,
        "bottom": 99.61,
        "datetime": "('NKE', Timestamp('2023-08-28 14:30:00'))"
    },
    {
        "top": 102.155,
        "bottom": 101.9,
        "datetime": "('NKE', Timestamp('2023-08-29 19:30:00'))"
    },
    {
        "top": 102.42,
        "bottom": 102.42,
        "datetime": "('NKE', Timestamp('2023-08-30 19:30:00'))"
    },
    {
        "top": 102.89,
        "bottom": 102.62,
        "datetime": "('NKE', Timestamp('2023-08-31 13:30:00'))"
    },
    {
        "top": 102.07,
        "bottom": 102.06,
        "datetime": "('NKE', Timestamp('2023-08-31 15:30:00'))"
    },
    {
        "top": 102.0575,
        "bottom": 101.95,
        "datetime": "('NKE', Timestamp('2023-08-31 18:30:00'))"
    },
    {
        "top": 101.96,
        "bottom": 101.795,
        "datetime": "('NKE', Timestamp('2023-08-31 19:30:00'))"
    },
    {
        "top": 102.645,
        "bottom": 102.485,
        "datetime": "('NKE', Timestamp('2023-09-01 14:30:00'))"
    },
    {
        "top": 101.96,
        "bottom": 101.5,
        "datetime": "('NKE', Timestamp('2023-09-05 13:30:00'))"
    },
    {
        "top": 100.95,
        "bottom": 100.83,
        "datetime": "('NKE', Timestamp('2023-09-05 14:00:00'))"
    },
    {
        "top": 100.58,
        "bottom": 100.57,
        "datetime": "('NKE', Timestamp('2023-09-05 19:00:00'))"
    },
    {
        "top": 98.76,
        "bottom": 98.26,
        "datetime": "('NKE', Timestamp('2023-09-07 13:30:00'))"
    },
    {
        "top": 98.3,
        "bottom": 98.16,
        "datetime": "('NKE', Timestamp('2023-09-07 14:00:00'))"
    },
    {
        "top": 98.07,
        "bottom": 97.98,
        "datetime": "('NKE', Timestamp('2023-09-07 19:30:00'))"
    },
    {
        "top": 98.1344,
        "bottom": 98.1,
        "datetime": "('NKE', Timestamp('2023-09-08 13:30:00'))"
    },
    {
        "top": 98.375,
        "bottom": 98.33,
        "datetime": "('NKE', Timestamp('2023-09-11 13:30:00'))"
    },
    {
        "top": 97.08,
        "bottom": 97.075,
        "datetime": "('NKE', Timestamp('2023-09-11 18:30:00'))"
    },
    {
        "top": 97.095,
        "bottom": 96.89,
        "datetime": "('NKE', Timestamp('2023-09-11 19:00:00'))"
    },
    {
        "top": 97.17,
        "bottom": 96.99,
        "datetime": "('NKE', Timestamp('2023-09-12 13:30:00'))"
    },
    {
        "top": 96.69,
        "bottom": 96.65,
        "datetime": "('NKE', Timestamp('2023-09-12 18:30:00'))"
    },
    {
        "top": 96.35,
        "bottom": 96.35,
        "datetime": "('NKE', Timestamp('2023-09-12 19:00:00'))"
    },
    {
        "top": 96.405,
        "bottom": 96.3,
        "datetime": "('NKE', Timestamp('2023-09-13 13:30:00'))"
    },
    {
        "top": 96.26,
        "bottom": 96.185,
        "datetime": "('NKE', Timestamp('2023-09-13 18:30:00'))"
    },
    {
        "top": 96.97,
        "bottom": 96.72,
        "datetime": "('NKE', Timestamp('2023-09-14 13:30:00'))"
    },
    {
        "top": 96.6,
        "bottom": 96.52,
        "datetime": "('NKE', Timestamp('2023-09-14 14:00:00'))"
    },
    {
        "top": 97.45,
        "bottom": 97.385,
        "datetime": "('NKE', Timestamp('2023-09-14 19:30:00'))"
    },
    {
        "top": 98.15,
        "bottom": 98.15,
        "datetime": "('NKE', Timestamp('2023-09-15 13:30:00'))"
    },
    {
        "top": 96.525,
        "bottom": 96.48,
        "datetime": "('NKE', Timestamp('2023-09-15 19:00:00'))"
    },
    {
        "top": 96.51,
        "bottom": 96.43,
        "datetime": "('NKE', Timestamp('2023-09-15 19:30:00'))"
    },
    {
        "top": 96.3663,
        "bottom": 96.23,
        "datetime": "('NKE', Timestamp('2023-09-18 14:00:00'))"
    },
    {
        "top": 96.03,
        "bottom": 95.985,
        "datetime": "('NKE', Timestamp('2023-09-18 15:30:00'))"
    },
    {
        "top": 95.825,
        "bottom": 95.71,
        "datetime": "('NKE', Timestamp('2023-09-18 16:00:00'))"
    },
    {
        "top": 95.49,
        "bottom": 95.04,
        "datetime": "('NKE', Timestamp('2023-09-19 13:30:00'))"
    },
    {
        "top": 94.875,
        "bottom": 94.82,
        "datetime": "('NKE', Timestamp('2023-09-19 19:00:00'))"
    },
    {
        "top": 94.8,
        "bottom": 94.75,
        "datetime": "('NKE', Timestamp('2023-09-19 19:30:00'))"
    },
    {
        "top": 95.4,
        "bottom": 95.3,
        "datetime": "('NKE', Timestamp('2023-09-20 14:00:00'))"
    },
    {
        "top": 94.55,
        "bottom": 94.29,
        "datetime": "('NKE', Timestamp('2023-09-20 18:30:00'))"
    },
    {
        "top": 94.2367,
        "bottom": 94.22,
        "datetime": "('NKE', Timestamp('2023-09-20 19:30:00'))"
    },
    {
        "top": 93.49,
        "bottom": 93.42,
        "datetime": "('NKE', Timestamp('2023-09-21 13:30:00'))"
    },
    {
        "top": 92.24,
        "bottom": 92.21,
        "datetime": "('NKE', Timestamp('2023-09-21 19:00:00'))"
    },
    {
        "top": 91.8,
        "bottom": 91.7406,
        "datetime": "('NKE', Timestamp('2023-09-21 19:30:00'))"
    },
    {
        "top": 91.62,
        "bottom": 91.61,
        "datetime": "('NKE', Timestamp('2023-09-22 14:00:00'))"
    },
    {
        "top": 91.52,
        "bottom": 91.4805,
        "datetime": "('NKE', Timestamp('2023-09-22 15:30:00'))"
    },
    {
        "top": 91.38,
        "bottom": 91.325,
        "datetime": "('NKE', Timestamp('2023-09-22 17:00:00'))"
    },
    {
        "top": 91.05,
        "bottom": 91.02,
        "datetime": "('NKE', Timestamp('2023-09-22 17:30:00'))"
    },
    {
        "top": 91.08,
        "bottom": 90.955,
        "datetime": "('NKE', Timestamp('2023-09-22 19:30:00'))"
    },
    {
        "top": 90.62,
        "bottom": 90.57,
        "datetime": "('NKE', Timestamp('2023-09-26 15:00:00'))"
    },
    {
        "top": 90.065,
        "bottom": 89.955,
        "datetime": "('NKE', Timestamp('2023-09-26 19:00:00'))"
    },
    {
        "top": 90.7,
        "bottom": 90.6,
        "datetime": "('NKE', Timestamp('2023-09-27 13:30:00'))"
    },
    {
        "top": 89.59,
        "bottom": 89.58,
        "datetime": "('NKE', Timestamp('2023-09-27 19:30:00'))"
    },
    {
        "top": 89.3,
        "bottom": 89.13,
        "datetime": "('NKE', Timestamp('2023-09-28 14:00:00'))"
    },
    {
        "top": 89.3475,
        "bottom": 89.34,
        "datetime": "('NKE', Timestamp('2023-09-28 18:30:00'))"
    },
    {
        "top": 99.47,
        "bottom": 99.37,
        "datetime": "('NKE', Timestamp('2023-09-29 13:30:00'))"
    },
    {
        "top": 97.34,
        "bottom": 97.315,
        "datetime": "('NKE', Timestamp('2023-09-29 14:00:00'))"
    },
    {
        "top": 96.65,
        "bottom": 96.5,
        "datetime": "('NKE', Timestamp('2023-09-29 14:30:00'))"
    },
    {
        "top": 96.0711,
        "bottom": 96.05,
        "datetime": "('NKE', Timestamp('2023-09-29 15:00:00'))"
    },
    {
        "top": 95.99,
        "bottom": 95.77,
        "datetime": "('NKE', Timestamp('2023-09-29 19:30:00'))"
    },
    {
        "top": 94.845,
        "bottom": 94.7,
        "datetime": "('NKE', Timestamp('2023-10-02 19:30:00'))"
    },
    {
        "top": 95.91,
        "bottom": 95.895,
        "datetime": "('NKE', Timestamp('2023-10-03 14:00:00'))"
    }
    ]
    
    const demand = [
    {
        "bottom": 118.9701,
        "top": 119.54,
        "datetime": "('NKE', Timestamp('2023-03-08 15:00:00'))"
    },
    {
        "bottom": 119.135,
        "top": 119.135,
        "datetime": "('NKE', Timestamp('2023-03-08 20:30:00'))"
    },
    {
        "bottom": 119.8675,
        "top": 120.08,
        "datetime": "('NKE', Timestamp('2023-03-09 14:30:00'))"
    },
    {
        "bottom": 120.91,
        "top": 121.16,
        "datetime": "('NKE', Timestamp('2023-03-09 15:00:00'))"
    },
    {
        "bottom": 117.59,
        "top": 117.7,
        "datetime": "('NKE', Timestamp('2023-03-09 20:30:00'))"
    },
    {
        "bottom": 115.79,
        "top": 115.82,
        "datetime": "('NKE', Timestamp('2023-03-13 13:30:00'))"
    },
    {
        "bottom": 116.645,
        "top": 116.765,
        "datetime": "('NKE', Timestamp('2023-03-13 19:30:00'))"
    },
    {
        "bottom": 118.03,
        "top": 118.12,
        "datetime": "('NKE', Timestamp('2023-03-14 19:30:00'))"
    },
    {
        "bottom": 115.81,
        "top": 116.405,
        "datetime": "('NKE', Timestamp('2023-03-15 14:30:00'))"
    },
    {
        "bottom": 116.6101,
        "top": 116.86,
        "datetime": "('NKE', Timestamp('2023-03-16 13:30:00'))"
    },
    {
        "bottom": 120.13,
        "top": 120.39,
        "datetime": "('NKE', Timestamp('2023-03-16 17:00:00'))"
    },
    {
        "bottom": 120.39,
        "top": 120.61,
        "datetime": "('NKE', Timestamp('2023-03-16 19:30:00'))"
    },
    {
        "bottom": 119.56,
        "top": 119.74,
        "datetime": "('NKE', Timestamp('2023-03-17 19:00:00'))"
    },
    {
        "bottom": 120.09,
        "top": 120.43,
        "datetime": "('NKE', Timestamp('2023-03-17 19:30:00'))"
    },
    {
        "bottom": 120.65,
        "top": 120.99,
        "datetime": "('NKE', Timestamp('2023-03-20 13:30:00'))"
    },
    {
        "bottom": 119.81,
        "top": 120.12,
        "datetime": "('NKE', Timestamp('2023-03-20 18:30:00'))"
    },
    {
        "bottom": 119.97,
        "top": 120.37,
        "datetime": "('NKE', Timestamp('2023-03-20 19:00:00'))"
    },
    {
        "bottom": 120.43,
        "top": 120.49,
        "datetime": "('NKE', Timestamp('2023-03-20 19:30:00'))"
    },
    {
        "bottom": 123.14,
        "top": 123.5,
        "datetime": "('NKE', Timestamp('2023-03-21 13:30:00'))"
    },
    {
        "bottom": 123.92,
        "top": 123.92,
        "datetime": "('NKE', Timestamp('2023-03-21 17:30:00'))"
    },
    {
        "bottom": 123.81,
        "top": 123.84,
        "datetime": "('NKE', Timestamp('2023-03-21 18:30:00'))"
    },
    {
        "bottom": 124.23,
        "top": 124.245,
        "datetime": "('NKE', Timestamp('2023-03-21 19:00:00'))"
    },
    {
        "bottom": 124.8,
        "top": 124.82,
        "datetime": "('NKE', Timestamp('2023-03-21 19:30:00'))"
    },
    {
        "bottom": 122.51,
        "top": 123.66,
        "datetime": "('NKE', Timestamp('2023-03-22 13:30:00'))"
    },
    {
        "bottom": 120.715,
        "top": 121.44,
        "datetime": "('NKE', Timestamp('2023-03-22 19:00:00'))"
    },
    {
        "bottom": 119.97,
        "top": 120.09,
        "datetime": "('NKE', Timestamp('2023-03-23 19:30:00'))"
    },
    {
        "bottom": 119.61,
        "top": 120.23,
        "datetime": "('NKE', Timestamp('2023-03-24 13:30:00'))"
    },
    {
        "bottom": 120.03,
        "top": 120.05,
        "datetime": "('NKE', Timestamp('2023-03-24 18:30:00'))"
    },
    {
        "bottom": 120.47,
        "top": 120.71,
        "datetime": "('NKE', Timestamp('2023-03-24 19:00:00'))"
    },
    {
        "bottom": 117.88,
        "top": 118,
        "datetime": "('NKE', Timestamp('2023-03-27 17:30:00'))"
    },
    {
        "bottom": 117.54,
        "top": 117.59,
        "datetime": "('NKE', Timestamp('2023-03-28 19:30:00'))"
    },
    {
        "bottom": 118.49,
        "top": 118.64,
        "datetime": "('NKE', Timestamp('2023-03-29 13:30:00'))"
    },
    {
        "bottom": 119.34,
        "top": 119.36,
        "datetime": "('NKE', Timestamp('2023-03-29 15:30:00'))"
    },
    {
        "bottom": 120.09,
        "top": 120.29,
        "datetime": "('NKE', Timestamp('2023-03-29 19:00:00'))"
    },
    {
        "bottom": 120.17,
        "top": 120.3,
        "datetime": "('NKE', Timestamp('2023-03-29 19:30:00'))"
    },
    {
        "bottom": 120.6,
        "top": 120.92,
        "datetime": "('NKE', Timestamp('2023-03-31 13:30:00'))"
    },
    {
        "bottom": 121.49,
        "top": 121.565,
        "datetime": "('NKE', Timestamp('2023-03-31 18:30:00'))"
    },
    {
        "bottom": 121.94,
        "top": 121.94,
        "datetime": "('NKE', Timestamp('2023-03-31 19:00:00'))"
    },
    {
        "bottom": 121.91,
        "top": 122.445,
        "datetime": "('NKE', Timestamp('2023-03-31 19:30:00'))"
    },
    {
        "bottom": 121.39,
        "top": 121.41,
        "datetime": "('NKE', Timestamp('2023-04-03 19:00:00'))"
    },
    {
        "bottom": 121.42,
        "top": 121.575,
        "datetime": "('NKE', Timestamp('2023-04-03 19:30:00'))"
    },
    {
        "bottom": 121.36,
        "top": 121.38,
        "datetime": "('NKE', Timestamp('2023-04-04 13:30:00'))"
    },
    {
        "bottom": 123.52,
        "top": 123.59,
        "datetime": "('NKE', Timestamp('2023-04-04 19:00:00'))"
    },
    {
        "bottom": 123.53,
        "top": 123.645,
        "datetime": "('NKE', Timestamp('2023-04-04 19:30:00'))"
    },
    {
        "bottom": 119.14,
        "top": 119.3,
        "datetime": "('NKE', Timestamp('2023-04-10 13:30:00'))"
    },
    {
        "bottom": 120.565,
        "top": 120.58,
        "datetime": "('NKE', Timestamp('2023-04-10 14:30:00'))"
    },
    {
        "bottom": 121.5401,
        "top": 121.59,
        "datetime": "('NKE', Timestamp('2023-04-10 19:00:00'))"
    },
    {
        "bottom": 121.57,
        "top": 121.61,
        "datetime": "('NKE', Timestamp('2023-04-10 19:30:00'))"
    },
    {
        "bottom": 122.04,
        "top": 122.04,
        "datetime": "('NKE', Timestamp('2023-04-11 13:30:00'))"
    },
    {
        "bottom": 122.58,
        "top": 122.72,
        "datetime": "('NKE', Timestamp('2023-04-11 14:00:00'))"
    },
    {
        "bottom": 123.52,
        "top": 123.555,
        "datetime": "('NKE', Timestamp('2023-04-11 18:30:00'))"
    },
    {
        "bottom": 123.77,
        "top": 123.78,
        "datetime": "('NKE', Timestamp('2023-04-11 19:00:00'))"
    },
    {
        "bottom": 123.33,
        "top": 123.34,
        "datetime": "('NKE', Timestamp('2023-04-12 19:30:00'))"
    },
    {
        "bottom": 124.468,
        "top": 124.71,
        "datetime": "('NKE', Timestamp('2023-04-13 14:00:00'))"
    },
    {
        "bottom": 126.91,
        "top": 127,
        "datetime": "('NKE', Timestamp('2023-04-14 13:30:00'))"
    },
    {
        "bottom": 125.58,
        "top": 125.61,
        "datetime": "('NKE', Timestamp('2023-04-17 19:00:00'))"
    },
    {
        "bottom": 125.72,
        "top": 126.05,
        "datetime": "('NKE', Timestamp('2023-04-17 19:30:00'))"
    },
    {
        "bottom": 124.35,
        "top": 124.35,
        "datetime": "('NKE', Timestamp('2023-04-20 14:00:00'))"
    },
    {
        "bottom": 123.7085,
        "top": 123.7085,
        "datetime": "('NKE', Timestamp('2023-04-20 19:30:00'))"
    },
    {
        "bottom": 125.19,
        "top": 125.35,
        "datetime": "('NKE', Timestamp('2023-04-21 19:30:00'))"
    },
    {
        "bottom": 125.145,
        "top": 125.435,
        "datetime": "('NKE', Timestamp('2023-04-24 14:00:00'))"
    },
    {
        "bottom": 126.49,
        "top": 126.49,
        "datetime": "('NKE', Timestamp('2023-04-24 19:00:00'))"
    },
    {
        "bottom": 126.75,
        "top": 126.75,
        "datetime": "('NKE', Timestamp('2023-04-24 19:30:00'))"
    },
    {
        "bottom": 125.99,
        "top": 125.99,
        "datetime": "('NKE', Timestamp('2023-04-25 14:00:00'))"
    },
    {
        "bottom": 124.3473,
        "top": 124.36,
        "datetime": "('NKE', Timestamp('2023-04-25 19:00:00'))"
    },
    {
        "bottom": 124.31,
        "top": 124.57,
        "datetime": "('NKE', Timestamp('2023-04-25 19:30:00'))"
    },
    {
        "bottom": 123.385,
        "top": 124.21,
        "datetime": "('NKE', Timestamp('2023-04-26 13:30:00'))"
    },
    {
        "bottom": 123.3225,
        "top": 123.47,
        "datetime": "('NKE', Timestamp('2023-04-26 19:30:00'))"
    },
    {
        "bottom": 123.16,
        "top": 123.44,
        "datetime": "('NKE', Timestamp('2023-04-27 14:00:00'))"
    },
    {
        "bottom": 124.96,
        "top": 125.15,
        "datetime": "('NKE', Timestamp('2023-04-28 13:30:00'))"
    },
    {
        "bottom": 125.48,
        "top": 125.485,
        "datetime": "('NKE', Timestamp('2023-04-28 14:00:00'))"
    },
    {
        "bottom": 126.26,
        "top": 126.3,
        "datetime": "('NKE', Timestamp('2023-04-28 19:30:00'))"
    },
    {
        "bottom": 126.86,
        "top": 126.92,
        "datetime": "('NKE', Timestamp('2023-05-01 13:30:00'))"
    },
    {
        "bottom": 127.545,
        "top": 127.57,
        "datetime": "('NKE', Timestamp('2023-05-01 19:30:00'))"
    },
    {
        "bottom": 126.26,
        "top": 127.15,
        "datetime": "('NKE', Timestamp('2023-05-02 13:30:00'))"
    },
    {
        "bottom": 123.67,
        "top": 125.49,
        "datetime": "('NKE', Timestamp('2023-05-03 13:30:00'))"
    },
    {
        "bottom": 124.215,
        "top": 124.3,
        "datetime": "('NKE', Timestamp('2023-05-04 14:00:00'))"
    },
    {
        "bottom": 126.43,
        "top": 126.43,
        "datetime": "('NKE', Timestamp('2023-05-05 18:30:00'))"
    },
    {
        "bottom": 126.61,
        "top": 126.8,
        "datetime": "('NKE', Timestamp('2023-05-05 19:00:00'))"
    },
    {
        "bottom": 126.5,
        "top": 126.56,
        "datetime": "('NKE', Timestamp('2023-05-08 19:00:00'))"
    },
    {
        "bottom": 126.635,
        "top": 126.67,
        "datetime": "('NKE', Timestamp('2023-05-08 19:30:00'))"
    },
    {
        "bottom": 124.54,
        "top": 124.65,
        "datetime": "('NKE', Timestamp('2023-05-09 14:30:00'))"
    },
    {
        "bottom": 125.2,
        "top": 125.2,
        "datetime": "('NKE', Timestamp('2023-05-09 19:00:00'))"
    },
    {
        "bottom": 124.105,
        "top": 124.105,
        "datetime": "('NKE', Timestamp('2023-05-10 14:00:00'))"
    },
    {
        "bottom": 123.12,
        "top": 123.21,
        "datetime": "('NKE', Timestamp('2023-05-10 19:00:00'))"
    },
    {
        "bottom": 122.325,
        "top": 122.63,
        "datetime": "('NKE', Timestamp('2023-05-11 14:00:00'))"
    },
    {
        "bottom": 122.35,
        "top": 122.485,
        "datetime": "('NKE', Timestamp('2023-05-11 18:30:00'))"
    },
    {
        "bottom": 121.9,
        "top": 122.16,
        "datetime": "('NKE', Timestamp('2023-05-11 19:30:00'))"
    },
    {
        "bottom": 120.13,
        "top": 120.21,
        "datetime": "('NKE', Timestamp('2023-05-12 14:00:00'))"
    },
    {
        "bottom": 119.17,
        "top": 119.29,
        "datetime": "('NKE', Timestamp('2023-05-12 19:00:00'))"
    },
    {
        "bottom": 119.375,
        "top": 119.46,
        "datetime": "('NKE', Timestamp('2023-05-12 19:30:00'))"
    },
    {
        "bottom": 118.005,
        "top": 118.415,
        "datetime": "('NKE', Timestamp('2023-05-15 14:00:00'))"
    },
    {
        "bottom": 119.58,
        "top": 119.74,
        "datetime": "('NKE', Timestamp('2023-05-15 19:30:00'))"
    },
    {
        "bottom": 116.12,
        "top": 116.73,
        "datetime": "('NKE', Timestamp('2023-05-16 14:00:00'))"
    },
    {
        "bottom": 115.765,
        "top": 115.84,
        "datetime": "('NKE', Timestamp('2023-05-17 14:00:00'))"
    },
    {
        "bottom": 115.95,
        "top": 116.23,
        "datetime": "('NKE', Timestamp('2023-05-17 14:30:00'))"
    },
    {
        "bottom": 116.38,
        "top": 116.43,
        "datetime": "('NKE', Timestamp('2023-05-17 16:30:00'))"
    },
    {
        "bottom": 116.78,
        "top": 116.81,
        "datetime": "('NKE', Timestamp('2023-05-17 19:00:00'))"
    },
    {
        "bottom": 116.76,
        "top": 116.84,
        "datetime": "('NKE', Timestamp('2023-05-17 19:30:00'))"
    },
    {
        "bottom": 118,
        "top": 118.04,
        "datetime": "('NKE', Timestamp('2023-05-18 19:00:00'))"
    },
    {
        "bottom": 118.27,
        "top": 118.43,
        "datetime": "('NKE', Timestamp('2023-05-18 19:30:00'))"
    },
    {
        "bottom": 113.75,
        "top": 114.18,
        "datetime": "('NKE', Timestamp('2023-05-19 14:00:00'))"
    },
    {
        "bottom": 114.45,
        "top": 114.9,
        "datetime": "('NKE', Timestamp('2023-05-19 14:30:00'))"
    },
    {
        "bottom": 114.46,
        "top": 114.54,
        "datetime": "('NKE', Timestamp('2023-05-19 19:30:00'))"
    },
    {
        "bottom": 109.4,
        "top": 109.77,
        "datetime": "('NKE', Timestamp('2023-05-23 13:30:00'))"
    },
    {
        "bottom": 107.7195,
        "top": 107.79,
        "datetime": "('NKE', Timestamp('2023-05-24 19:00:00'))"
    },
    {
        "bottom": 107.67,
        "top": 108.35,
        "datetime": "('NKE', Timestamp('2023-05-25 13:30:00'))"
    },
    {
        "bottom": 107.545,
        "top": 107.66,
        "datetime": "('NKE', Timestamp('2023-05-25 19:00:00'))"
    },
    {
        "bottom": 107,
        "top": 107,
        "datetime": "('NKE', Timestamp('2023-05-26 13:30:00'))"
    },
    {
        "bottom": 107.68,
        "top": 107.845,
        "datetime": "('NKE', Timestamp('2023-05-26 14:00:00'))"
    },
    {
        "bottom": 107.82,
        "top": 108.25,
        "datetime": "('NKE', Timestamp('2023-05-26 14:30:00'))"
    },
    {
        "bottom": 107.275,
        "top": 107.34,
        "datetime": "('NKE', Timestamp('2023-05-30 14:30:00'))"
    },
    {
        "bottom": 107.27,
        "top": 107.33,
        "datetime": "('NKE', Timestamp('2023-05-30 15:30:00'))"
    },
    {
        "bottom": 106.375,
        "top": 106.49,
        "datetime": "('NKE', Timestamp('2023-05-30 19:30:00'))"
    },
    {
        "bottom": 104.83,
        "top": 105.7,
        "datetime": "('NKE', Timestamp('2023-05-31 13:30:00'))"
    },
    {
        "bottom": 105.07,
        "top": 105.21,
        "datetime": "('NKE', Timestamp('2023-05-31 14:30:00'))"
    },
    {
        "bottom": 105.02,
        "top": 105.11,
        "datetime": "('NKE', Timestamp('2023-05-31 15:30:00'))"
    },
    {
        "bottom": 105.26,
        "top": 105.39,
        "datetime": "('NKE', Timestamp('2023-05-31 18:00:00'))"
    },
    {
        "bottom": 105.2,
        "top": 105.49,
        "datetime": "('NKE', Timestamp('2023-06-06 13:30:00'))"
    },
    {
        "bottom": 105.61,
        "top": 105.61,
        "datetime": "('NKE', Timestamp('2023-06-06 14:30:00'))"
    },
    {
        "bottom": 105.42,
        "top": 106.04,
        "datetime": "('NKE', Timestamp('2023-06-07 13:30:00'))"
    },
    {
        "bottom": 106.46,
        "top": 106.61,
        "datetime": "('NKE', Timestamp('2023-06-07 14:00:00'))"
    },
    {
        "bottom": 107.21,
        "top": 107.3,
        "datetime": "('NKE', Timestamp('2023-06-07 16:00:00'))"
    },
    {
        "bottom": 107.78,
        "top": 107.785,
        "datetime": "('NKE', Timestamp('2023-06-07 16:30:00'))"
    },
    {
        "bottom": 106.14,
        "top": 106.195,
        "datetime": "('NKE', Timestamp('2023-06-08 18:30:00'))"
    },
    {
        "bottom": 105.8301,
        "top": 106.09,
        "datetime": "('NKE', Timestamp('2023-06-08 19:30:00'))"
    },
    {
        "bottom": 105.36,
        "top": 105.91,
        "datetime": "('NKE', Timestamp('2023-06-09 13:30:00'))"
    },
    {
        "bottom": 104.6,
        "top": 104.95,
        "datetime": "('NKE', Timestamp('2023-06-12 14:30:00'))"
    },
    {
        "bottom": 105.05,
        "top": 105.13,
        "datetime": "('NKE', Timestamp('2023-06-12 15:00:00'))"
    },
    {
        "bottom": 105.23,
        "top": 105.26,
        "datetime": "('NKE', Timestamp('2023-06-12 15:30:00'))"
    },
    {
        "bottom": 106.3,
        "top": 106.3,
        "datetime": "('NKE', Timestamp('2023-06-12 19:00:00'))"
    },
    {
        "bottom": 106.59,
        "top": 106.67,
        "datetime": "('NKE', Timestamp('2023-06-12 19:30:00'))"
    },
    {
        "bottom": 106.965,
        "top": 107.14,
        "datetime": "('NKE', Timestamp('2023-06-13 13:30:00'))"
    },
    {
        "bottom": 106.33,
        "top": 106.365,
        "datetime": "('NKE', Timestamp('2023-06-13 19:30:00'))"
    },
    {
        "bottom": 107.48,
        "top": 107.48,
        "datetime": "('NKE', Timestamp('2023-06-14 13:30:00'))"
    },
    {
        "bottom": 109.9,
        "top": 109.91,
        "datetime": "('NKE', Timestamp('2023-06-14 14:00:00'))"
    },
    {
        "bottom": 110.21,
        "top": 110.28,
        "datetime": "('NKE', Timestamp('2023-06-14 14:30:00'))"
    },
    {
        "bottom": 111.2337,
        "top": 111.24,
        "datetime": "('NKE', Timestamp('2023-06-14 15:00:00'))"
    },
    {
        "bottom": 111.57,
        "top": 111.66,
        "datetime": "('NKE', Timestamp('2023-06-14 15:30:00'))"
    },
    {
        "bottom": 111.85,
        "top": 112.29,
        "datetime": "('NKE', Timestamp('2023-06-14 16:00:00'))"
    },
    {
        "bottom": 111.73,
        "top": 111.79,
        "datetime": "('NKE', Timestamp('2023-06-15 18:30:00'))"
    },
    {
        "bottom": 112.21,
        "top": 112.59,
        "datetime": "('NKE', Timestamp('2023-06-15 19:00:00'))"
    },
    {
        "bottom": 113.25,
        "top": 113.59,
        "datetime": "('NKE', Timestamp('2023-06-16 19:00:00'))"
    },
    {
        "bottom": 108.96,
        "top": 109.205,
        "datetime": "('NKE', Timestamp('2023-06-20 19:30:00'))"
    },
    {
        "bottom": 108.82,
        "top": 109.13,
        "datetime": "('NKE', Timestamp('2023-06-21 13:30:00'))"
    },
    {
        "bottom": 109.95,
        "top": 109.98,
        "datetime": "('NKE', Timestamp('2023-06-21 19:00:00'))"
    },
    {
        "bottom": 110.17,
        "top": 110.34,
        "datetime": "('NKE', Timestamp('2023-06-22 14:30:00'))"
    },
    {
        "bottom": 110.53,
        "top": 110.625,
        "datetime": "('NKE', Timestamp('2023-06-22 15:00:00'))"
    },
    {
        "bottom": 107.3,
        "top": 107.75,
        "datetime": "('NKE', Timestamp('2023-06-23 13:30:00'))"
    },
    {
        "bottom": 109.04,
        "top": 109.06,
        "datetime": "('NKE', Timestamp('2023-06-23 14:30:00'))"
    },
    {
        "bottom": 109.67,
        "top": 109.67,
        "datetime": "('NKE', Timestamp('2023-06-26 13:30:00'))"
    },
    {
        "bottom": 111.61,
        "top": 111.71,
        "datetime": "('NKE', Timestamp('2023-06-26 14:00:00'))"
    },
    {
        "bottom": 111.82,
        "top": 111.925,
        "datetime": "('NKE', Timestamp('2023-06-26 19:00:00'))"
    },
    {
        "bottom": 112.43,
        "top": 112.53,
        "datetime": "('NKE', Timestamp('2023-06-27 13:30:00'))"
    },
    {
        "bottom": 112.78,
        "top": 112.87,
        "datetime": "('NKE', Timestamp('2023-06-27 14:00:00'))"
    },
    {
        "bottom": 113,
        "top": 113.0699,
        "datetime": "('NKE', Timestamp('2023-06-28 18:30:00'))"
    },
    {
        "bottom": 112.865,
        "top": 112.97,
        "datetime": "('NKE', Timestamp('2023-06-28 19:30:00'))"
    },
    {
        "bottom": 113.31,
        "top": 113.6,
        "datetime": "('NKE', Timestamp('2023-06-29 13:30:00'))"
    },
    {
        "bottom": 112.79,
        "top": 113.06,
        "datetime": "('NKE', Timestamp('2023-06-29 15:00:00'))"
    },
    {
        "bottom": 113.1201,
        "top": 113.15,
        "datetime": "('NKE', Timestamp('2023-06-29 19:00:00'))"
    },
    {
        "bottom": 112.94,
        "top": 113.29,
        "datetime": "('NKE', Timestamp('2023-06-29 19:30:00'))"
    },
    {
        "bottom": 110.79,
        "top": 110.95,
        "datetime": "('NKE', Timestamp('2023-06-30 14:00:00'))"
    },
    {
        "bottom": 106.535,
        "top": 106.69,
        "datetime": "('NKE', Timestamp('2023-07-05 17:00:00'))"
    },
    {
        "bottom": 106.57,
        "top": 106.74,
        "datetime": "('NKE', Timestamp('2023-07-05 19:30:00'))"
    },
    {
        "bottom": 104.34,
        "top": 104.44,
        "datetime": "('NKE', Timestamp('2023-07-07 14:00:00'))"
    },
    {
        "bottom": 104.25,
        "top": 104.48,
        "datetime": "('NKE', Timestamp('2023-07-10 13:30:00'))"
    },
    {
        "bottom": 105.3601,
        "top": 105.58,
        "datetime": "('NKE', Timestamp('2023-07-10 19:30:00'))"
    },
    {
        "bottom": 105.62,
        "top": 105.65,
        "datetime": "('NKE', Timestamp('2023-07-11 13:30:00'))"
    },
    {
        "bottom": 105.69,
        "top": 105.955,
        "datetime": "('NKE', Timestamp('2023-07-11 14:00:00'))"
    },
    {
        "bottom": 106.32,
        "top": 106.55,
        "datetime": "('NKE', Timestamp('2023-07-11 14:30:00'))"
    },
    {
        "bottom": 106.97,
        "top": 107.1,
        "datetime": "('NKE', Timestamp('2023-07-11 19:00:00'))"
    },
    {
        "bottom": 107.06,
        "top": 107.23,
        "datetime": "('NKE', Timestamp('2023-07-11 19:30:00'))"
    },
    {
        "bottom": 107.22,
        "top": 107.6,
        "datetime": "('NKE', Timestamp('2023-07-12 14:00:00'))"
    },
    {
        "bottom": 107.475,
        "top": 107.495,
        "datetime": "('NKE', Timestamp('2023-07-12 19:30:00'))"
    },
    {
        "bottom": 107.81,
        "top": 107.94,
        "datetime": "('NKE', Timestamp('2023-07-14 13:30:00'))"
    },
    {
        "bottom": 107.68,
        "top": 107.82,
        "datetime": "('NKE', Timestamp('2023-07-14 19:30:00'))"
    },
    {
        "bottom": 106.76,
        "top": 107.26,
        "datetime": "('NKE', Timestamp('2023-07-17 13:30:00'))"
    },
    {
        "bottom": 108.72,
        "top": 108.82,
        "datetime": "('NKE', Timestamp('2023-07-17 19:00:00'))"
    },
    {
        "bottom": 108.31,
        "top": 108.58,
        "datetime": "('NKE', Timestamp('2023-07-18 13:30:00'))"
    },
    {
        "bottom": 109.55,
        "top": 109.77,
        "datetime": "('NKE', Timestamp('2023-07-18 14:00:00'))"
    },
    {
        "bottom": 109.78,
        "top": 109.9671,
        "datetime": "('NKE', Timestamp('2023-07-18 14:30:00'))"
    },
    {
        "bottom": 109.39,
        "top": 109.45,
        "datetime": "('NKE', Timestamp('2023-07-18 17:30:00'))"
    },
    {
        "bottom": 109.595,
        "top": 109.67,
        "datetime": "('NKE', Timestamp('2023-07-18 19:30:00'))"
    },
    {
        "bottom": 108.98,
        "top": 109.08,
        "datetime": "('NKE', Timestamp('2023-07-19 13:30:00'))"
    },
    {
        "bottom": 108.985,
        "top": 109.57,
        "datetime": "('NKE', Timestamp('2023-07-20 13:30:00'))"
    },
    {
        "bottom": 108.32,
        "top": 108.34,
        "datetime": "('NKE', Timestamp('2023-07-21 15:00:00'))"
    },
    {
        "bottom": 108.79,
        "top": 108.98,
        "datetime": "('NKE', Timestamp('2023-07-21 15:30:00'))"
    },
    {
        "bottom": 108.695,
        "top": 108.75,
        "datetime": "('NKE', Timestamp('2023-07-21 19:30:00'))"
    },
    {
        "bottom": 108.52,
        "top": 108.52,
        "datetime": "('NKE', Timestamp('2023-07-24 19:30:00'))"
    },
    {
        "bottom": 107.47,
        "top": 107.64,
        "datetime": "('NKE', Timestamp('2023-07-25 15:00:00'))"
    },
    {
        "bottom": 107.6,
        "top": 107.77,
        "datetime": "('NKE', Timestamp('2023-07-25 15:30:00'))"
    },
    {
        "bottom": 108.9,
        "top": 108.96,
        "datetime": "('NKE', Timestamp('2023-07-26 18:30:00'))"
    },
    {
        "bottom": 108.81,
        "top": 108.95,
        "datetime": "('NKE', Timestamp('2023-07-26 19:30:00'))"
    },
    {
        "bottom": 107.49,
        "top": 107.62,
        "datetime": "('NKE', Timestamp('2023-07-27 19:00:00'))"
    },
    {
        "bottom": 107.4,
        "top": 107.66,
        "datetime": "('NKE', Timestamp('2023-07-27 19:30:00'))"
    },
    {
        "bottom": 107.63,
        "top": 107.83,
        "datetime": "('NKE', Timestamp('2023-07-28 14:00:00'))"
    },
    {
        "bottom": 108.41,
        "top": 108.53,
        "datetime": "('NKE', Timestamp('2023-07-28 19:30:00'))"
    },
    {
        "bottom": 109.0476,
        "top": 109.25,
        "datetime": "('NKE', Timestamp('2023-07-31 14:00:00'))"
    },
    {
        "bottom": 109.93,
        "top": 110.35,
        "datetime": "('NKE', Timestamp('2023-07-31 19:30:00'))"
    },
    {
        "bottom": 109.82,
        "top": 110,
        "datetime": "('NKE', Timestamp('2023-08-01 13:30:00'))"
    },
    {
        "bottom": 109.401,
        "top": 109.45,
        "datetime": "('NKE', Timestamp('2023-08-01 16:30:00'))"
    },
    {
        "bottom": 106.645,
        "top": 107,
        "datetime": "('NKE', Timestamp('2023-08-03 13:30:00'))"
    },
    {
        "bottom": 107.745,
        "top": 107.745,
        "datetime": "('NKE', Timestamp('2023-08-03 14:30:00'))"
    },
    {
        "bottom": 108.24,
        "top": 108.65,
        "datetime": "('NKE', Timestamp('2023-08-04 14:00:00'))"
    },
    {
        "bottom": 108.75,
        "top": 108.76,
        "datetime": "('NKE', Timestamp('2023-08-04 14:30:00'))"
    },
    {
        "bottom": 109.52,
        "top": 109.86,
        "datetime": "('NKE', Timestamp('2023-08-04 15:00:00'))"
    },
    {
        "bottom": 108.48,
        "top": 108.57,
        "datetime": "('NKE', Timestamp('2023-08-04 19:30:00'))"
    },
    {
        "bottom": 109.215,
        "top": 109.295,
        "datetime": "('NKE', Timestamp('2023-08-07 14:00:00'))"
    },
    {
        "bottom": 109.83,
        "top": 109.83,
        "datetime": "('NKE', Timestamp('2023-08-07 19:30:00'))"
    },
    {
        "bottom": 107.35,
        "top": 107.74,
        "datetime": "('NKE', Timestamp('2023-08-08 15:00:00'))"
    },
    {
        "bottom": 109.16,
        "top": 109.28,
        "datetime": "('NKE', Timestamp('2023-08-08 19:30:00'))"
    },
    {
        "bottom": 109.421,
        "top": 109.79,
        "datetime": "('NKE', Timestamp('2023-08-09 13:30:00'))"
    },
    {
        "bottom": 109.6,
        "top": 109.915,
        "datetime": "('NKE', Timestamp('2023-08-09 14:00:00'))"
    },
    {
        "bottom": 110.3,
        "top": 110.31,
        "datetime": "('NKE', Timestamp('2023-08-10 13:30:00'))"
    },
    {
        "bottom": 108.545,
        "top": 108.72,
        "datetime": "('NKE', Timestamp('2023-08-10 19:30:00'))"
    },
    {
        "bottom": 107.86,
        "top": 108.08,
        "datetime": "('NKE', Timestamp('2023-08-11 19:30:00'))"
    },
    {
        "bottom": 107.15,
        "top": 107.29,
        "datetime": "('NKE', Timestamp('2023-08-14 14:00:00'))"
    },
    {
        "bottom": 107.7,
        "top": 107.71,
        "datetime": "('NKE', Timestamp('2023-08-14 14:30:00'))"
    },
    {
        "bottom": 107.42,
        "top": 107.55,
        "datetime": "('NKE', Timestamp('2023-08-14 19:30:00'))"
    },
    {
        "bottom": 105.6901,
        "top": 106,
        "datetime": "('NKE', Timestamp('2023-08-15 14:00:00'))"
    },
    {
        "bottom": 106.315,
        "top": 106.41,
        "datetime": "('NKE', Timestamp('2023-08-15 19:30:00'))"
    },
    {
        "bottom": 106.07,
        "top": 106.07,
        "datetime": "('NKE', Timestamp('2023-08-16 13:30:00'))"
    },
    {
        "bottom": 104.78,
        "top": 105.09,
        "datetime": "('NKE', Timestamp('2023-08-17 19:00:00'))"
    },
    {
        "bottom": 103.76,
        "top": 103.83,
        "datetime": "('NKE', Timestamp('2023-08-18 13:30:00'))"
    },
    {
        "bottom": 104.21,
        "top": 104.33,
        "datetime": "('NKE', Timestamp('2023-08-18 19:30:00'))"
    },
    {
        "bottom": 103.15,
        "top": 103.29,
        "datetime": "('NKE', Timestamp('2023-08-21 14:30:00'))"
    },
    {
        "bottom": 100.96,
        "top": 100.96,
        "datetime": "('NKE', Timestamp('2023-08-22 13:30:00'))"
    },
    {
        "bottom": 101.6,
        "top": 101.8,
        "datetime": "('NKE', Timestamp('2023-08-22 14:30:00'))"
    },
    {
        "bottom": 100.9,
        "top": 100.92,
        "datetime": "('NKE', Timestamp('2023-08-22 19:00:00'))"
    },
    {
        "bottom": 101.16,
        "top": 101.23,
        "datetime": "('NKE', Timestamp('2023-08-22 19:30:00'))"
    },
    {
        "bottom": 96.92,
        "top": 96.98,
        "datetime": "('NKE', Timestamp('2023-08-23 13:30:00'))"
    },
    {
        "bottom": 96.65,
        "top": 96.73,
        "datetime": "('NKE', Timestamp('2023-08-23 14:30:00'))"
    },
    {
        "bottom": 98.34,
        "top": 98.7,
        "datetime": "('NKE', Timestamp('2023-08-24 13:30:00'))"
    },
    {
        "bottom": 97.96,
        "top": 97.99,
        "datetime": "('NKE', Timestamp('2023-08-24 19:00:00'))"
    },
    {
        "bottom": 98.25,
        "top": 98.5,
        "datetime": "('NKE', Timestamp('2023-08-25 13:30:00'))"
    },
    {
        "bottom": 98.74,
        "top": 98.825,
        "datetime": "('NKE', Timestamp('2023-08-25 19:30:00'))"
    },
    {
        "bottom": 99.46,
        "top": 99.59,
        "datetime": "('NKE', Timestamp('2023-08-28 13:30:00'))"
    },
    {
        "bottom": 99.26,
        "top": 99.275,
        "datetime": "('NKE', Timestamp('2023-08-28 19:30:00'))"
    },
    {
        "bottom": 99.72,
        "top": 100.03,
        "datetime": "('NKE', Timestamp('2023-08-29 13:30:00'))"
    },
    {
        "bottom": 100.01,
        "top": 100.05,
        "datetime": "('NKE', Timestamp('2023-08-29 14:00:00'))"
    },
    {
        "bottom": 100.61,
        "top": 100.66,
        "datetime": "('NKE', Timestamp('2023-08-29 14:30:00'))"
    },
    {
        "bottom": 101.51,
        "top": 101.64,
        "datetime": "('NKE', Timestamp('2023-08-30 13:30:00'))"
    },
    {
        "bottom": 101.92,
        "top": 102.06,
        "datetime": "('NKE', Timestamp('2023-08-30 15:00:00'))"
    },
    {
        "bottom": 101.73,
        "top": 101.74,
        "datetime": "('NKE', Timestamp('2023-08-31 19:00:00'))"
    },
    {
        "bottom": 101.52,
        "top": 101.97,
        "datetime": "('NKE', Timestamp('2023-09-01 13:30:00'))"
    },
    {
        "bottom": 102.04,
        "top": 102.32,
        "datetime": "('NKE', Timestamp('2023-09-01 14:00:00'))"
    },
    {
        "bottom": 102.015,
        "top": 102.3,
        "datetime": "('NKE', Timestamp('2023-09-01 19:30:00'))"
    },
    {
        "bottom": 100.53,
        "top": 100.76,
        "datetime": "('NKE', Timestamp('2023-09-05 14:30:00'))"
    },
    {
        "bottom": 100.225,
        "top": 100.27,
        "datetime": "('NKE', Timestamp('2023-09-05 19:30:00'))"
    },
    {
        "bottom": 99.37,
        "top": 99.76,
        "datetime": "('NKE', Timestamp('2023-09-06 13:30:00'))"
    },
    {
        "bottom": 99.82,
        "top": 99.99,
        "datetime": "('NKE', Timestamp('2023-09-06 19:00:00'))"
    },
    {
        "bottom": 100.07,
        "top": 100.08,
        "datetime": "('NKE', Timestamp('2023-09-06 19:30:00'))"
    },
    {
        "bottom": 97.47,
        "top": 97.57,
        "datetime": "('NKE', Timestamp('2023-09-08 19:30:00'))"
    },
    {
        "bottom": 97.46,
        "top": 97.865,
        "datetime": "('NKE', Timestamp('2023-09-11 14:00:00'))"
    },
    {
        "bottom": 96.58,
        "top": 96.77,
        "datetime": "('NKE', Timestamp('2023-09-11 19:30:00'))"
    },
    {
        "bottom": 96.205,
        "top": 96.21,
        "datetime": "('NKE', Timestamp('2023-09-12 19:30:00'))"
    },
    {
        "bottom": 95.75,
        "top": 95.865,
        "datetime": "('NKE', Timestamp('2023-09-13 14:00:00'))"
    },
    {
        "bottom": 95.81,
        "top": 96.08,
        "datetime": "('NKE', Timestamp('2023-09-13 19:00:00'))"
    },
    {
        "bottom": 96.08,
        "top": 96.1,
        "datetime": "('NKE', Timestamp('2023-09-13 19:30:00'))"
    },
    {
        "bottom": 95.72,
        "top": 96,
        "datetime": "('NKE', Timestamp('2023-09-18 13:30:00'))"
    },
    {
        "bottom": 95.305,
        "top": 95.37,
        "datetime": "('NKE', Timestamp('2023-09-18 19:00:00'))"
    },
    {
        "bottom": 95.335,
        "top": 95.41,
        "datetime": "('NKE', Timestamp('2023-09-18 19:30:00'))"
    },
    {
        "bottom": 94.55,
        "top": 94.56,
        "datetime": "('NKE', Timestamp('2023-09-19 15:00:00'))"
    },
    {
        "bottom": 93.97,
        "top": 93.97,
        "datetime": "('NKE', Timestamp('2023-09-20 13:30:00'))"
    },
    {
        "bottom": 94.01,
        "top": 94.11,
        "datetime": "('NKE', Timestamp('2023-09-20 19:00:00'))"
    },
    {
        "bottom": 91.34,
        "top": 91.58,
        "datetime": "('NKE', Timestamp('2023-09-22 13:30:00'))"
    },
    {
        "bottom": 90.55,
        "top": 90.75,
        "datetime": "('NKE', Timestamp('2023-09-22 18:00:00'))"
    },
    {
        "bottom": 89.79,
        "top": 90,
        "datetime": "('NKE', Timestamp('2023-09-25 13:30:00'))"
    },
    {
        "bottom": 90.225,
        "top": 90.34,
        "datetime": "('NKE', Timestamp('2023-09-25 19:30:00'))"
    },
    {
        "bottom": 89.93,
        "top": 90,
        "datetime": "('NKE', Timestamp('2023-09-26 13:30:00'))"
    },
    {
        "bottom": 90.14,
        "top": 90.46,
        "datetime": "('NKE', Timestamp('2023-09-26 14:00:00'))"
    },
    {
        "bottom": 89.885,
        "top": 89.9,
        "datetime": "('NKE', Timestamp('2023-09-26 19:30:00'))"
    },
    {
        "bottom": 89.32,
        "top": 89.425,
        "datetime": "('NKE', Timestamp('2023-09-27 18:00:00'))"
    },
    {
        "bottom": 89.38,
        "top": 89.45,
        "datetime": "('NKE', Timestamp('2023-09-27 19:00:00'))"
    },
    {
        "bottom": 88.93,
        "top": 89.1,
        "datetime": "('NKE', Timestamp('2023-09-28 13:30:00'))"
    },
    {
        "bottom": 89.14,
        "top": 89.23,
        "datetime": "('NKE', Timestamp('2023-09-28 19:00:00'))"
    },
    {
        "bottom": 89.32,
        "top": 89.445,
        "datetime": "('NKE', Timestamp('2023-09-28 19:30:00'))"
    },
    {
        "bottom": 94.18,
        "top": 94.32,
        "datetime": "('NKE', Timestamp('2023-10-03 13:30:00'))"
    },
    {
        "bottom": 94.85,
        "top": 94.85,
        "datetime": "('NKE', Timestamp('2023-10-03 16:00:00'))"
    },
    {
        "bottom": 94.7201,
        "top": 94.87,
        "datetime": "('NKE', Timestamp('2023-10-03 19:00:00'))"
    },
    {
        "bottom": 94.81,
        "top": 94.89,
        "datetime": "('NKE', Timestamp('2023-10-03 19:30:00'))"
    }
    ];
    
   const price = 95.635;
   const getSupplyDemand = await utilities.findZones(price, supply, demand);

   console.log(getSupplyDemand)
});

// it("returns an object with the account info", async () => {
//   let Symbol = 'AAPL';
//   let token = '';
//   let gettingUserPrinciples = {
//     userPrinciples: null,
//     params: null,
//     loginRequest: null,
//     marketRequest: null,
//     bookRequest: null,
//     timeSalesRequest: null
//   };


//   token = await activities.getLoginCredentials();
//   gettingUserPrinciples = await activities.getUserPrinciples(token, Symbol);

//   const accountId = process.env.TD_ACCOUNT_ID;
//   const getAccount = await activities.getAccount(token, accountId);
//   console.log(`getAccount`, getAccount);
//   expect(getAccount.securitiesAccount.accountId).toEqual(accountId);
// });

// it("returns an object with current price, and surrounding demand and supply zones", async () => {
//   let token = ""
//   let gettingUserPrinciples = {
//     userPrinciples: null,
//     params: null,
//     loginRequest: null,
//     marketRequest: null,
//     bookRequest: null,
//     timeSalesRequest: null
//   };
//   const demandZones = mockPremarketData.premarketData.demandZones;
//   const supplyZones = mockPremarketData.premarketData.supplyZones;
//   token = await activities.getLoginCredentials();
//   console.log('token', token)

//   gettingUserPrinciples = await activities.getUserPrinciples(token, mockPremarketData.premarketData.symbol);
//   console.log('gettingUserPrinciples', gettingUserPrinciples);
//   const wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;

//   const currentPrice = await activities.getCurrentPrice(wsUri, gettingUserPrinciples.loginRequest, gettingUserPrinciples.marketRequest, demandZones, supplyZones, false);
//   console.log(currentPrice);
//   expect(typeof token).toBe("string");
// });

// it("returns an object with current price, and surrounding demand and supply zones", async () => {
//   let token = ""
//   const account_id = process.env.TD_ACCOUNT_ID;
//   const price = 0.02;
//   const quantity = 1;
//   const symbol = "AAPL_032423C180";
//   const orderData = {
//     accountId: account_id,
//     order: {
//       orderType: OrderType.LIMIT,
//       price: price,
//       session: SessionType.NORMAL,
//       duration: DurationType.FILL_OR_KILL,
//       orderStrategyType: OrderStrategyType.SINGLE,
//       orderLegCollection: [{
//         orderLegType: OrderLegType.OPTION,
//         instruction: InstructionType.BUY_TO_OPEN,
//         quantity: quantity,
//         instrument: {
//           assetType: AssetType.OPTION,
//           symbol: symbol,
//           putCall: PutCall.CALL,
//         },
//       }],
//       complexOrderStrategyType: ComplexOrderStrategyType.NONE,
//     },
//   };
//   const urlCode = await activities.getUrlCode();
//   token = await activities.getLoginCredentials(urlCode);
//   console.log('token', token);
//   const openPositionResponse = await activities.placeOrder(token, account_id, orderData);
//   console.log(openPositionResponse);
//   expect(typeof token).toBe("string");
// });

// it("returns an object with current price, and surrounding demand and supply zones", async () => {
//   let token = ""
//   token = await activities.getLoginCredentials();
//   const quote = await activities.getQuote(token, 'AAPL_033123C146');
//   console.log('quote', quote);
//   expect(typeof token).toBe("string");
// });

// // it("returns the current price surrounding key levels", async () => {
// //   const currentPrice = 132.31;
// //   const keyLevels = mockPremarketData.premarketData.keyLevels;
// //   const surroundingKeyLevels = await activities.get_surrounding_key_levels(currentPrice, keyLevels);
// //   expect(surroundingKeyLevels).toEqual({
// //     above_resistance: 133.94,
// //     resistance: 132.46,
// //     support: 131,
// //     below_support: 129.66
// //   });
// // });

// it("returns an object of demand and supply, with an entry, takeProfit, stoploss, and cutPosition", async () => {
//   const toDate = moment().add((5 - moment().isoWeekday()), 'day').format('YYYY-MM-DD');
//   const fromDate = moment().isoWeekday() !== 5 ? moment().add((moment().isoWeekday() % 5), 'day').subtract(1, 'day').format('YYYY-MM-DD') : moment().add((moment().isoWeekday() % 5), 'day').format('YYYY-MM-DD');
//   const numberOfDaysAway = moment().isoWeekday() !== 5 ? (5 - moment().isoWeekday()) : 0;
//   const optionString = `${toDate}:${numberOfDaysAway}`;
//   console.log('optionString', optionString);

//   const parseJson = JSON.parse(JSON.stringify(currentPrice));
//   console.log('parseJson', parseJson);
//   console.log('parseJson', parseJson.putExpDateMap[optionString]);

//   const positionSetup = activities.filterOptionResponse(parseJson.putExpDateMap[optionString], "PUT");
//   console.log('positionSetup', positionSetup);
//   expect(positionSetup).toEqual({
//     demand: {
//       entry: 132.46,
//       stopLoss: 132.06,
//       takeProfit: 133.94,
//       cutPosition: 133.2
//     },
//     supply: null
//   });
// });

// // it("returns an object with a call selection", async () => {
// //   const positionSetup = {
// //     demand: {
// //       entry: 132.46,
// //       stopLoss: 132.06,
// //       takeProfit: 133.94,
// //       cutPosition: 133.2
// //     },
// //     supply: null
// //   };
// //   let token = {
// //     access_token: null,
// //     refresh_token: null,
// //     access_token_expires_at: null,
// //     refresh_token_expires_at: null,
// //     logged_in: null,
// //     access_token_expires_at_date: null,
// //     refresh_token_expires_at_date: null
// //   };
// //   let gettingUserPrinciples = {
// //     userPrinciples: null,
// //     params: null,
// //   };
// //   const accessToken = TokenJSON.access_token;
// //   const symbol = mockPremarketData.premarketData.symbol;
// //   const optionSelection = await activities.getOptionsSelection(positionSetup, symbol, accessToken);
// //   console.log('optionSelection', optionSelection);
// // });
