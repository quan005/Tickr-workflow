import { holiday, getMarketClose } from './getMarketClose';
import * as moment from "moment-timezone";

export function timeUntilMarketOpen(): number {
  if (holiday() || getMarketClose()) {
      return -1;
  }

  const marketOpen = moment().tz('America/New_York').set('hour', 9).set('minute', 30);
  const now = moment().tz('America/New_York');
  const diff = moment.duration(marketOpen.diff(now));

  const hoursRemaining = diff.hours();
  const hoursToMilliSeconds = ((hoursRemaining * 60) * 60) * 1000;

  const minutesRemaining = diff.minutes();
  const minutesToMilliSeconds = (minutesRemaining * 60) * 1000;

  let total = hoursToMilliSeconds + minutesToMilliSeconds;

  if (total < 0) {
      total = 0;
  }

  return total;
}