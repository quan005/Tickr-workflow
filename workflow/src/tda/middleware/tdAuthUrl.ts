const tdAuthUrl = async (clientId: string): Promise<string> => {
  const clientCode = clientId + '@AMER.OAUTHAP';

  const params = new URLSearchParams({
    'response_type': 'code',
    'redirect_uri': `${process.env.REDIRECT_URI}`,
    'client_id': clientCode,
  });

  const paramsString = params.toString();

  const url = `${process.env.TD_AUTH_URL}` + paramsString;

  return url;
}

export { tdAuthUrl }