const tdCredentialsToString = async (json: object): Promise<string> => {
  return Object.keys(json).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(json[key]);
  }).join('&');
}

export { tdCredentialsToString }