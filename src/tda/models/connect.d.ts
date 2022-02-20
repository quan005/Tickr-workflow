export declare enum RestMethod {
  GET = "get",
  POST = "post",
  DELETE = "delete"
}
export declare enum ResponseType {
  URL_FORM_ENCODED = "form",
  JSON = "json",
  TEXT = "text",
  STREAM = "stream",
  DOCUMENT = "document",
  ARRAY_BUFFER = "arraybuffer"
}
export declare enum ArrayFormatType {
  COMMA = "comma",
  INDICES = "indices",
  BRACKETS = "brackets",
  REPEAT = "repeat"
}
export interface Request {
  url: string;
  data: object;
  headers: object;
  params: object;
  responseType: ResponseType;
  arrayFormat: ArrayFormatType;
}
