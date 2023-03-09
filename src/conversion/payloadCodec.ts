// import { METADATA_ENCODING_KEY, Payload, PayloadCodec, ValueError } from '@temporalio/common';
// import { decode, encode } from 'messagepack';

// const ENCODING = 'json/plain';

// export class MsgpackPayloadCodec implements PayloadCodec {

//   async encode(payloads: Payload[]): Promise<Payload[]> {
//     return Promise.all(
//       payloads.map(async (payload) => ({
//         metadata: {
//           [METADATA_ENCODING_KEY]: encode(ENCODING),
//           format: encode('extended'),
//         },
//         data: await msgpackEncode(payload),
//       }))
//     );
//   }

//   async decode(payloads: Payload[]): Promise<Payload[]> {
//     return Promise.all(
//       payloads.map(async (payload) => {
//         if (!payload.metadata || decode(payload.metadata[METADATA_ENCODING_KEY]) !== ENCODING) {
//           return payload;
//         }
//         if (!payload.data) {
//           throw new ValueError('Payload data is missing');
//         }

//         return decode(payload.data);
//       })
//     );
//   }
// }

// async function msgpackEncode(payload: Payload): Promise<Uint8Array> {
//   if (payload === undefined) return undefined;
//   let encoded: Uint8Array
//   try {
//     encoded = encode(payload);
//   } catch (e) {
//     throw new ValueError(
//       `Can't run encode on this value: ${payload}. Either convert it (or its properties) to serializable values (see https://msgpack.org/ ), or create a custom data converter. Msgpack encode error message: ${errorMessage(
//         e
//       )}`,
//       e as Error
//     );
//   }

//   return encoded
// }

// export function errorMessage(error: unknown): string | undefined {
//   if (typeof error === 'string') {
//     return error;
//   }
//   if (error instanceof Error) {
//     return error.message;
//   }
//   return undefined;
// }