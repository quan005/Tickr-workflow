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
var kafkajs_1 = require("kafkajs");
var confluent_schema_registry_1 = require("@kafkajs/confluent-schema-registry");
var client_1 = require("@temporalio/client");
var workflows_1 = require("./workflows");
var dotenv = require("dotenv");
dotenv.config();
// need to connect to kafka topic and consume the message
var broker = process.env.KAFKA_BROKER;
var schemaRegistryUrl = process.env.SCHEMA_REGISTRY_URL;
var kafka = new kafkajs_1.Kafka({
    clientId: 'find-position-client',
    brokers: ["".concat(broker, ":9092")]
});
var schemaRegistry = new confluent_schema_registry_1.SchemaRegistry({
    host: schemaRegistryUrl
});
var consumer = kafka.consumer({
    groupId: 'find-position-group'
});
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, consumer.connect()];
            case 1:
                _a.sent();
                return [4 /*yield*/, consumer.subscribe({
                        topic: 'find-position'
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, consumer.run({
                        eachMessage: function (_a) {
                            var topic = _a.topic, partition = _a.partition, message = _a.message;
                            return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                                        var premarketMessage, connection, temporalClient, priceActionResult;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, schemaRegistry.decode(message.value)];
                                                case 1:
                                                    premarketMessage = _a.sent();
                                                    return [4 /*yield*/, client_1.Connection.connect({
                                                            address: "".concat(process.env.TEMPORAL_GRPC_ENDPOINT)
                                                        })];
                                                case 2:
                                                    connection = _a.sent();
                                                    temporalClient = new client_1.WorkflowClient({
                                                        connection: connection,
                                                        namespace: 'default'
                                                    });
                                                    return [4 /*yield*/, temporalClient.start(workflows_1.priceAction, {
                                                            args: [premarketMessage],
                                                            workflowId: 'priceAction-' + Math.floor(Math.random() * 1000),
                                                            taskQueue: 'price-action-positions',
                                                            workflowTaskTimeout: 480000
                                                        })];
                                                case 3:
                                                    priceActionResult = _a.sent();
                                                    console.log('priceAction result', priceActionResult.result());
                                                    return [2 /*return*/, resolve(priceActionResult)];
                                            }
                                        });
                                    }); });
                                    return [2 /*return*/];
                                });
                            });
                        }
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
run()["catch"](function (err) {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=client.js.map