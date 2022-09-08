import express from "express"
import helmet from "helmet"
import bodyParser from "body-parser"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config();

import { app } from "../tda/routers/index"


const expressServer = express()

expressServer.use(cors())
expressServer.use(helmet())
expressServer.use(express.json())
expressServer.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'https://api.tdameritrade.com');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Pass to next layer of middleware
  next();
});
expressServer.use(bodyParser.urlencoded({ extended: true }));
expressServer.use(bodyParser.json());

expressServer.use('/api', app);

expressServer.get('/', (req, res) => {
  res.status(200).send(
      `<div>
          <h2>Server Running Live...</h2>
          <p>Url to get auth <strong>'/api/auth'</strong></p>
      </div>`
  );
});

export { expressServer }






// const defaultConfig = {
//   apiKey: 'GYNQGLGLPINXJNWLKFZM48NQ1C86KS8D', //save in a env
//   redirectUri: 'https://localhost', //save in a env
//   sslKey: path.resolve(__dirname + "/certs/localhost/localhost.decrypted.key"),
//   sslCert: path.resolve(__dirname + "/certs/localhost/localhost.crt")
// }

// const configFile = path.resolve('config.json')

// const config = fs.existsSync(configFile)
//   ? JSON.parse(fs.readFileSync(configFile, 'utf8'))
//   : defaultConfig

// const td = new TDAmeritrade(config)

// td.on('login', async address => {

//   const browser = await puppeteer.launch({
//     args: [
//       '--no-sandbox'
//     ],
//     headless: false,
//     ignoreHTTPSErrors: true
//   })

//   const page = await browser.newPage();

//   await page.goto(address)

//   await page.click('#username0');
//   await page.keyboard.type('Quan0005'); //save in a env

//   await page.click('#password1');
//   await page.keyboard.type('bF%9.APR^fgVcDv'); //save in a env

//   await page.click('#accept');
//   await page.waitForNavigation();

//   await page.click('summary');

//   const secretQuestion = await page.$("input[name='init_secretquestion']")
//   await secretQuestion?.click()
//   await page.waitForNavigation();
  
//   const securityQuestionText = await page.evaluate(() => Array.from(document.querySelectorAll("p"), element => element.textContent))
//   const secretQuestionTextSelection = securityQuestionText[2]
//   let selectedAnswer

//   if (secretQuestionTextSelection === "Question: What was your high school mascot?") {
//     selectedAnswer = 'aztec' //save in a env
//   } else if (secretQuestionTextSelection === "Question: What is your father's middle name?"){
//     selectedAnswer = 'lavon' //save in a env
//   } else if (secretQuestionTextSelection === "Question: In what city were you married? (Enter full name of city only.)") {
//     selectedAnswer = 'chandler' //save in a env
//   } else {
//     selectedAnswer = 'bear' //save in a env
//   }

//   await page.click('#secretquestion0');
//   await page.keyboard.type(selectedAnswer);

//   await page.click('#accept');
//   await page.waitForNavigation();

//   const trustDevice = await page.$$("div.option")
//   await trustDevice[0].click()

//   await page.click('#accept');
//   await page.waitForNavigation();

//   await page.click('#accept');
//   const target = await page.target()
//   const targetUrl = await target.url()

//   await browser.close()
//   const parseUrl = url.parse(targetUrl, true).query
//   const urlCode = parseUrl.code

//   const payload = {
//     'grant_type': 'authorization_code',
//     'access_type': 'offline',
//     'code': urlCode,
//     'client_id': 'GYNQGLGLPINXJNWLKFZM48NQ1C86KS8D', //save in a env
//     'redirect_uri': 'https://localhost'  //save in a env
//   }

//   const postData = JSON.stringify(payload);

//   const options = {
//     hostname: 'api.tdameritrade.com',
//     port: 443,
//     path: '/v1/oauth2/token',
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     key: fs.readFileSync(path.resolve(__dirname + "/certs/localhost/localhost.decrypted.key"), 'utf8'),
//     cert: fs.readFileSync(path.resolve(__dirname + "/certs/localhost/localhost.crt"), 'utf8')
//   }

//   const res = await https.request(options, (res) => {
//     console.log('statusCode:', res.statusCode);
//     console.log('headers:', res.headers);
  
//     res.on('data', (d) => {
//       console.log(d);
//     });
//   });
  
//   res.on('error', (e) => {
//     console.error(e);
//   });
  
//   res.write(postData);
//   res.end();

//   console.log(res)

// })

// td.on('token', (returned) => {
//   console.log('returned', returned)
//   // const content = JSON.stringify(td., null, 2)
//   // fs.writeFile(configFile, content, error => {
//   //     if (error) {
//   //         console.log(`Failed to update config: ${configFile}\n${error}`)
//   //     } else {
//   //         console.log(`Updated config: ${configFile}`)
//   //     }
//   // })
// })
