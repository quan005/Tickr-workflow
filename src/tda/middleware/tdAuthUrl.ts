const tdAuthUrl = async (clientId: string): Promise<string> =>  {
  const clientCode = clientId + '@AMER.OAUTHAP'

  const params = new URLSearchParams({
    'response_type': 'code',
    'redirect_uri': 'https://localhost',  //save in a env (process.env.REDIRECT_URI)
    'client_id': clientCode
  });

  const paramsString = params.toString()

  const url = 'https://auth.tdameritrade.com/auth?' + paramsString

  return url
}

export { tdAuthUrl }