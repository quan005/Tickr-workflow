const Days90 = 7776000; // 90 days in seconds
const Minutes30 = 1800; // 30 mins in seconds

const tdValidateTokens = async (access_token_expires_at_date: string, refresh_token_expires_at_date: string): Promise<boolean> => {
  const time = Date().toString();
  const accessTokenComparison = await compareTimeDifference(access_token_expires_at_date, time, Days90);
  const refreshTokenComparison = await compareTimeDifference(refresh_token_expires_at_date, time, Minutes30);

  if (accessTokenComparison || refreshTokenComparison) {
    return true;
  } else {
    return false;
  }
}

const compareTimeDifference = async (time_1: string, time_2: string, maxDifference: number): Promise<boolean> => {
  const date1 = Date.parse(time_1);
  const date2 = Date.parse(time_2);

  const diff = Math.floor((date2 - date1) / 1000); // difference in seconds

  return (diff >= maxDifference);
}

export { tdValidateTokens }