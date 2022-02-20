"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayFormatType = exports.ResponseType = exports.RestMethod = void 0;
// Axios document can be found here: https://github.com/axios/axios
var RestMethod;
(function (RestMethod) {
    RestMethod["GET"] = "get";
    RestMethod["POST"] = "post";
    RestMethod["DELETE"] = "delete";
})(RestMethod = exports.RestMethod || (exports.RestMethod = {}));
var ResponseType;
(function (ResponseType) {
    ResponseType["URL_FORM_ENCODED"] = "form";
    ResponseType["JSON"] = "json";
    ResponseType["TEXT"] = "text";
    ResponseType["STREAM"] = "stream";
    ResponseType["DOCUMENT"] = "document";
    ResponseType["ARRAY_BUFFER"] = "arraybuffer";
})(ResponseType = exports.ResponseType || (exports.ResponseType = {}));
var ArrayFormatType;
(function (ArrayFormatType) {
    ArrayFormatType["COMMA"] = "comma";
    ArrayFormatType["INDICES"] = "indices";
    ArrayFormatType["BRACKETS"] = "brackets";
    ArrayFormatType["REPEAT"] = "repeat";
})(ArrayFormatType = exports.ArrayFormatType || (exports.ArrayFormatType = {}));
