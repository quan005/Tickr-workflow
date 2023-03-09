// import {
//   EncodingType,
//   METADATA_ENCODING_KEY,
//   Payload,
//   PayloadConverterWithEncoding,
//   PayloadConverterError,
// } from '@temporalio/common';
// import { decode, encode } from 'messagepack';

// /**
//  * Converts between values and [msgpack](https://msgpack.org/) Payloads.
//  */
// export class MsgpackPayloadConverter implements PayloadConverterWithEncoding {
//   // Use 'json/plain' so that Payloads are displayed in the UI
//   public encodingType = 'json/plain' as EncodingType;

//   public toPayload(value: unknown): Payload | undefined {
//     if (value === undefined) return undefined;
//     let encoded
//     try {
//       encoded = encode(value);
//     } catch (e) {
//       throw new UnsupportedMsgpacknTypeError(
//         `Can't run encode on this value: ${value}. Either convert it (or its properties) to serializable values (see https://msgpack.org/ ), or create a custom data converter. Msgpack encode error message: ${errorMessage(
//           e
//         )}`,
//         e as Error
//       );
//     }

//     return {
//       metadata: {
//         [METADATA_ENCODING_KEY]: encode('json/plain'),
//         // Include an additional metadata field to indicate that this is an EJSON payload
//         format: encode('extended'),
//       },
//       data: encoded,
//     };
//   }

//   public fromPayload<T>(content: Payload): T {
//     if (!content.data) return undefined;
//     let decoded
//     try {
//       decoded = decode(content.data);
//     } catch (e) {
//       throw new UnsupportedMsgpacknTypeError(
//         `Can't run decode on this value: ${content}. Either convert it (or its properties) to serializable values (see https://msgpack.org/ ), or create a custom data converter. Msgpack encode error message: ${errorMessage(
//           e
//         )}`,
//         e as Error
//       );
//     }

//     return decoded;
//   }
// }

// export class UnsupportedMsgpacknTypeError extends PayloadConverterError {
//   public readonly name: string = 'UnsupportedJsonTypeError';

//   constructor(message: string | undefined, public readonly cause?: Error) {
//     super(message ?? undefined);
//   }
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