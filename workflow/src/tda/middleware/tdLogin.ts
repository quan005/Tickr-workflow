import * as puppeteer from "puppeteer";

const tdLogin = (address: string) => {
  return new Promise<string>(async (resolve, reject) => {
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox'
      ],
      headless: true,
    });

    const page = await browser.newPage();
    let targetUrl = '';

    try {

      await page.goto(address);

      await page.click('#username0');
      await page.keyboard.type(`${process.env.TD_USERNAME}`);

      await page.click('#password1');
      await page.keyboard.type(`${process.env.TD_PASSWORD}`);
      await page.waitForSelector('#accept');

      await page.click('#accept');
      await page.waitForSelector('summary');

      await page.click('summary');
      await page.waitForSelector("input[name='init_secretquestion']");

      const secretQuestion = await page.$("input[name='init_secretquestion']");
      await secretQuestion?.click();
      await page.waitForSelector('#secretquestion0');

      const securityQuestionText = await page.evaluate(() => Array.from(document.querySelectorAll("p"), element => element.textContent));
      const secretQuestionTextSelection = securityQuestionText[2];
      let selectedAnswer = '';

      if (secretQuestionTextSelection === "Question: What was your high school mascot?") {
        selectedAnswer += `${process.env.TD_ANSWER_1}`;
      } else if (secretQuestionTextSelection === "Question: What is your father's middle name?") {
        selectedAnswer += `${process.env.TD_ANSWER_2}`;
      } else if (secretQuestionTextSelection === "Question: In what city were you married? (Enter full name of city only.)") {
        selectedAnswer += `${process.env.TD_ANSWER_3}`;
      } else {
        selectedAnswer += `${process.env.TD_ANSWER_4}`;
      }

      await page.click('#secretquestion0');
      await page.keyboard.type(selectedAnswer);
      await page.waitForSelector('#accept');

      await page.click('#accept');
      await page.waitForSelector('#trustthisdevice0_0');

      const trustDevice = await page.$$("div.option");
      await trustDevice[0].click();

      await page.click('#accept');
      await page.waitForSelector('#stepup_authorization0');

      await page.click('#accept');

    } catch (err) {
      return reject(err);

    } finally {
      const target = page.target();
      targetUrl += target.url();
      await browser.close();
      return resolve(targetUrl);
    }
  })
}

export { tdLogin }