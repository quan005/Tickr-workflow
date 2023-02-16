"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.tdLogin = void 0;
var puppeteer = require("puppeteer");
var tdLogin = function (address) {
    return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var browser, page, targetUrl, secretQuestion, securityQuestionText, secretQuestionTextSelection, selectedAnswer, trustDevice, err_1, target;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer.launch({
                        args: [
                            '--no-sandbox'
                        ],
                        headless: true
                    })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    targetUrl = '';
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 28, 29, 31]);
                    return [4 /*yield*/, page.goto(address)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.click('#username0')];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.keyboard.type("".concat(process.env.TD_USERNAME))];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, page.click('#password1')];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, page.keyboard.type("".concat(process.env.TD_PASSWORD))];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector('#accept')];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, page.click('#accept')];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector('summary')];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, page.click('summary')];
                case 12:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("input[name='init_secretquestion']")];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, page.$("input[name='init_secretquestion']")];
                case 14:
                    secretQuestion = _a.sent();
                    return [4 /*yield*/, (secretQuestion === null || secretQuestion === void 0 ? void 0 : secretQuestion.click())];
                case 15:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector('#secretquestion0')];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, page.evaluate(function () { return Array.from(document.querySelectorAll("p"), function (element) { return element.textContent; }); })];
                case 17:
                    securityQuestionText = _a.sent();
                    secretQuestionTextSelection = securityQuestionText[2];
                    selectedAnswer = '';
                    if (secretQuestionTextSelection === "Question: What was your high school mascot?") {
                        selectedAnswer += "".concat(process.env.TD_ANSWER_1);
                    }
                    else if (secretQuestionTextSelection === "Question: What is your father's middle name?") {
                        selectedAnswer += "".concat(process.env.TD_ANSWER_2);
                    }
                    else if (secretQuestionTextSelection === "Question: In what city were you married? (Enter full name of city only.)") {
                        selectedAnswer += "".concat(process.env.TD_ANSWER_3);
                    }
                    else {
                        selectedAnswer += "".concat(process.env.TD_ANSWER_4);
                    }
                    return [4 /*yield*/, page.click('#secretquestion0')];
                case 18:
                    _a.sent();
                    return [4 /*yield*/, page.keyboard.type(selectedAnswer)];
                case 19:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector('#accept')];
                case 20:
                    _a.sent();
                    return [4 /*yield*/, page.click('#accept')];
                case 21:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector('#trustthisdevice0_0')];
                case 22:
                    _a.sent();
                    return [4 /*yield*/, page.$$("div.option")];
                case 23:
                    trustDevice = _a.sent();
                    return [4 /*yield*/, trustDevice[0].click()];
                case 24:
                    _a.sent();
                    return [4 /*yield*/, page.click('#accept')];
                case 25:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector('#stepup_authorization0')];
                case 26:
                    _a.sent();
                    return [4 /*yield*/, page.click('#accept')];
                case 27:
                    _a.sent();
                    return [3 /*break*/, 31];
                case 28:
                    err_1 = _a.sent();
                    return [2 /*return*/, reject(err_1)];
                case 29:
                    target = page.target();
                    targetUrl += target.url();
                    return [4 /*yield*/, browser.close()];
                case 30:
                    _a.sent();
                    return [2 /*return*/, resolve(targetUrl)];
                case 31: return [2 /*return*/];
            }
        });
    }); });
};
exports.tdLogin = tdLogin;
//# sourceMappingURL=tdLogin.js.map