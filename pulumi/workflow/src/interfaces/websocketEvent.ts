import * as WebSocket from "ws";

export interface ContentData {
  0: string,
  1: number,
  2: number,
  3: number,
  4: number,
  5: number,
  seq?: number,
  key?: string,
}

export interface SocketResponse {
  service: string,
  timestamp: number,
  command: string,
  content: ContentData[],
}

export interface MessageEvent extends WebSocket {
  data: SocketResponse[],
}