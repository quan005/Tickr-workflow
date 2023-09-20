import * as https from "https";

export function getLoginCredentials(): Promise<string> {
    let token: string;
  
    return new Promise((resolve, reject) => {
      const authOptions = {
        host: `${process.env.API_HOSTNAME}`,
        path: '/api/auth',
        method: 'GET',
        rejectUnauthorized: false,
      };
  
      const request = https.request(authOptions, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
          data += chunk;
        });
  
        resp.on('end', () => {
          try {
            console.log('login data', data)

            if (!data || data[0] === "<" || JSON.parse(data) === undefined) {
              return reject(new Error('Url code is not available.'));
            }

            const parsedJson = JSON.parse(data);
            token = JSON.stringify(parsedJson);
    
            if (!token) {
              return reject(new Error('Access token not available!'));
            }
    
            return resolve(token);
          } catch (e) {
            reject(new Error('Failed to parse response.'));
          }
        })
      })
      
      request.on('error', (e) => {
        reject(new Error(e.message));
      });
  
      request.end();
    });
  }