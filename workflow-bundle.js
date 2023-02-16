var __TEMPORAL__;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@temporalio/common/lib/activity-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/activity-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityCancellationType = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.workflow_commands.ActivityCancellationType
var ActivityCancellationType;
(function (ActivityCancellationType) {
    ActivityCancellationType[ActivityCancellationType["TRY_CANCEL"] = 0] = "TRY_CANCEL";
    ActivityCancellationType[ActivityCancellationType["WAIT_CANCELLATION_COMPLETED"] = 1] = "WAIT_CANCELLATION_COMPLETED";
    ActivityCancellationType[ActivityCancellationType["ABANDON"] = 2] = "ABANDON";
})(ActivityCancellationType = exports.ActivityCancellationType || (exports.ActivityCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/data-converter.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/data-converter.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultDataConverter = exports.defaultFailureConverter = void 0;
const failure_converter_1 = __webpack_require__(/*! ./failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
/**
 * The default {@link FailureConverter} used by the SDK.
 *
 * Error messages and stack traces are serizalized as plain text.
 */
exports.defaultFailureConverter = new failure_converter_1.DefaultFailureConverter();
/**
 * A "loaded" data converter that uses the default set of failure and payload converters.
 */
exports.defaultDataConverter = {
    payloadConverter: payload_converter_1.defaultPayloadConverter,
    failureConverter: exports.defaultFailureConverter,
    payloadCodecs: [],
};


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/failure-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/failure-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultFailureConverter = exports.cutoffStackTrace = void 0;
const failure_1 = __webpack_require__(/*! ../failure */ "./node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ../type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js");
/**
 * Stack traces will be cutoff when on of these patterns is matched
 */
const CUTOFF_STACK_PATTERNS = [
    /** Activity execution */
    /\s+at Activity\.execute \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/,
    /** Workflow activation */
    /\s+at Activator\.\S+NextHandler \(.*[\\/]workflow[\\/](?:src|lib)[\\/]internals\.[jt]s:\d+:\d+\)/,
    /** Workflow run anything in context */
    /\s+at Script\.runInContext \((?:node:vm|vm\.js):\d+:\d+\)/,
];
/**
 * Cuts out the framework part of a stack trace, leaving only user code entries
 */
function cutoffStackTrace(stack) {
    const lines = (stack ?? '').split(/\r?\n/);
    const acc = Array();
    lineLoop: for (const line of lines) {
        for (const pattern of CUTOFF_STACK_PATTERNS) {
            if (pattern.test(line))
                break lineLoop;
        }
        acc.push(line);
    }
    return acc.join('\n');
}
exports.cutoffStackTrace = cutoffStackTrace;
/**
 * Default, cross-language-compatible Failure converter.
 *
 * By default, it will leave error messages and stack traces as plain text. In order to encrypt them, set
 * `encodeCommonAttributes` to `true` in the constructor options and use a {@link PayloadCodec} that can encrypt /
 * decrypt Payloads in your {@link WorkerOptions.dataConverter | Worker} and
 * {@link ClientOptions.dataConverter | Client options}.
 *
 * @experimental
 */
class DefaultFailureConverter {
    constructor(options) {
        const { encodeCommonAttributes } = options ?? {};
        this.options = {
            encodeCommonAttributes: encodeCommonAttributes ?? false,
        };
    }
    /**
     * Converts a Failure proto message to a JS Error object.
     *
     * Does not set common properties, that is done in {@link failureToError}.
     */
    failureToErrorInner(failure, payloadConverter) {
        if (failure.applicationFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, failure.applicationFailureInfo.type, Boolean(failure.applicationFailureInfo.nonRetryable), (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.applicationFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.serverFailureInfo) {
            return new failure_1.ServerFailure(failure.message ?? undefined, Boolean(failure.serverFailureInfo.nonRetryable), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.timeoutFailureInfo) {
            return new failure_1.TimeoutFailure(failure.message ?? undefined, (0, payload_converter_1.fromPayloadsAtIndex)(payloadConverter, 0, failure.timeoutFailureInfo.lastHeartbeatDetails?.payloads), failure.timeoutFailureInfo.timeoutType ?? failure_1.TimeoutType.TIMEOUT_TYPE_UNSPECIFIED);
        }
        if (failure.terminatedFailureInfo) {
            return new failure_1.TerminatedFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.canceledFailureInfo) {
            return new failure_1.CancelledFailure(failure.message ?? undefined, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.canceledFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.resetWorkflowFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, 'ResetWorkflow', false, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.resetWorkflowFailureInfo.lastHeartbeatDetails?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.childWorkflowExecutionFailureInfo) {
            const { namespace, workflowType, workflowExecution, retryState } = failure.childWorkflowExecutionFailureInfo;
            if (!(workflowType?.name && workflowExecution)) {
                throw new TypeError('Missing attributes on childWorkflowExecutionFailureInfo');
            }
            return new failure_1.ChildWorkflowFailure(namespace ?? undefined, workflowExecution, workflowType.name, retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.activityFailureInfo) {
            if (!failure.activityFailureInfo.activityType?.name) {
                throw new TypeError('Missing activityType?.name on activityFailureInfo');
            }
            return new failure_1.ActivityFailure(failure.activityFailureInfo.activityType.name, failure.activityFailureInfo.activityId ?? undefined, failure.activityFailureInfo.retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, failure.activityFailureInfo.identity ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        return new failure_1.TemporalFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
    }
    failureToError(failure, payloadConverter) {
        if (failure.encodedAttributes) {
            const attrs = payloadConverter.fromPayload(failure.encodedAttributes);
            // Don't apply encodedAttributes unless they conform to an expected schema
            if (typeof attrs === 'object' && attrs !== null) {
                const { message, stack_trace } = attrs;
                // Avoid mutating the argument
                failure = { ...failure };
                if (typeof message === 'string') {
                    failure.message = message;
                }
                if (typeof stack_trace === 'string') {
                    failure.stackTrace = stack_trace;
                }
            }
        }
        const err = this.failureToErrorInner(failure, payloadConverter);
        err.stack = failure.stackTrace ?? '';
        err.failure = failure;
        return err;
    }
    errorToFailure(err, payloadConverter) {
        const failure = this.errorToFailureInner(err, payloadConverter);
        if (this.options.encodeCommonAttributes) {
            const { message, stackTrace } = failure;
            failure.message = 'Encoded failure';
            failure.stackTrace = '';
            failure.encodedAttributes = payloadConverter.toPayload({ message, stack_trace: stackTrace });
        }
        return failure;
    }
    errorToFailureInner(err, payloadConverter) {
        if (err instanceof failure_1.TemporalFailure) {
            if (err.failure)
                return err.failure;
            const base = {
                message: err.message,
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
                source: failure_1.FAILURE_SOURCE,
            };
            if (err instanceof failure_1.ActivityFailure) {
                return {
                    ...base,
                    activityFailureInfo: {
                        ...err,
                        activityType: { name: err.activityType },
                    },
                };
            }
            if (err instanceof failure_1.ChildWorkflowFailure) {
                return {
                    ...base,
                    childWorkflowExecutionFailureInfo: {
                        ...err,
                        workflowExecution: err.execution,
                        workflowType: { name: err.workflowType },
                    },
                };
            }
            if (err instanceof failure_1.ApplicationFailure) {
                return {
                    ...base,
                    applicationFailureInfo: {
                        type: err.type,
                        nonRetryable: err.nonRetryable,
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.CancelledFailure) {
                return {
                    ...base,
                    canceledFailureInfo: {
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.TimeoutFailure) {
                return {
                    ...base,
                    timeoutFailureInfo: {
                        timeoutType: err.timeoutType,
                        lastHeartbeatDetails: err.lastHeartbeatDetails
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, err.lastHeartbeatDetails) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.TerminatedFailure) {
                return {
                    ...base,
                    terminatedFailureInfo: {},
                };
            }
            if (err instanceof failure_1.ServerFailure) {
                return {
                    ...base,
                    serverFailureInfo: { nonRetryable: err.nonRetryable },
                };
            }
            // Just a TemporalFailure
            return base;
        }
        const base = {
            source: failure_1.FAILURE_SOURCE,
        };
        if ((0, type_helpers_1.isRecord)(err) && (0, type_helpers_1.hasOwnProperties)(err, ['message', 'stack'])) {
            return {
                ...base,
                message: String(err.message) ?? '',
                stackTrace: cutoffStackTrace(String(err.stack)),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
            };
        }
        const recommendation = ` [A non-Error value was thrown from your code. We recommend throwing Error objects so that we can provide a stack trace]`;
        if (typeof err === 'string') {
            return { ...base, message: err + recommendation };
        }
        if (typeof err === 'object') {
            let message = '';
            try {
                message = JSON.stringify(err);
            }
            catch (_err) {
                message = String(err);
            }
            return { ...base, message: message + recommendation };
        }
        return { ...base, message: String(err) + recommendation };
    }
    /**
     * Converts a Failure proto message to a JS Error object if defined or returns undefined.
     */
    optionalFailureToOptionalError(failure, payloadConverter) {
        return failure ? this.failureToError(failure, payloadConverter) : undefined;
    }
    /**
     * Converts an error to a Failure proto message if defined or returns undefined
     */
    optionalErrorToOptionalFailure(err, payloadConverter) {
        return err ? this.errorToFailure(err, payloadConverter) : undefined;
    }
}
exports.DefaultFailureConverter = DefaultFailureConverter;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-codec.js":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-codec.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/payload-converter.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/payload-converter.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultPayloadConverter = exports.DefaultPayloadConverter = exports.searchAttributePayloadConverter = exports.SearchAttributePayloadConverter = exports.JsonPayloadConverter = exports.BinaryPayloadConverter = exports.UndefinedPayloadConverter = exports.CompositePayloadConverter = exports.mapFromPayloads = exports.arrayFromPayloads = exports.fromPayloadsAtIndex = exports.mapToPayloads = exports.toPayloads = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
const errors_1 = __webpack_require__(/*! ../errors */ "./node_modules/@temporalio/common/lib/errors.js");
const types_1 = __webpack_require__(/*! ./types */ "./node_modules/@temporalio/common/lib/converter/types.js");
/**
 * Implements conversion of a list of values.
 *
 * @param converter
 * @param values JS values to convert to Payloads
 * @return list of {@link Payload}s
 * @throws {@link ValueError} if conversion of the value passed as parameter failed for any
 *     reason.
 */
function toPayloads(converter, ...values) {
    if (values.length === 0) {
        return undefined;
    }
    return values.map((value) => converter.toPayload(value));
}
exports.toPayloads = toPayloads;
/**
 * Run {@link PayloadConverter.toPayload} on each value in the map.
 *
 * @throws {@link ValueError} if conversion of any value in the map fails
 */
function mapToPayloads(converter, map) {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, converter.toPayload(v)]));
}
exports.mapToPayloads = mapToPayloads;
/**
 * Implements conversion of an array of values of different types. Useful for deserializing
 * arguments of function invocations.
 *
 * @param converter
 * @param index index of the value in the payloads
 * @param payloads serialized value to convert to JS values.
 * @return converted JS value
 * @throws {@link PayloadConverterError} if conversion of the data passed as parameter failed for any
 *     reason.
 */
function fromPayloadsAtIndex(converter, index, payloads) {
    // To make adding arguments a backwards compatible change
    if (payloads === undefined || payloads === null || index >= payloads.length) {
        return undefined;
    }
    return converter.fromPayload(payloads[index]);
}
exports.fromPayloadsAtIndex = fromPayloadsAtIndex;
/**
 * Run {@link PayloadConverter.fromPayload} on each value in the array.
 */
function arrayFromPayloads(converter, payloads) {
    if (!payloads) {
        return [];
    }
    return payloads.map((payload) => converter.fromPayload(payload));
}
exports.arrayFromPayloads = arrayFromPayloads;
function mapFromPayloads(converter, map) {
    if (map == null)
        return map;
    return Object.fromEntries(Object.entries(map).map(([k, payload]) => {
        const value = converter.fromPayload(payload);
        return [k, value];
    }));
}
exports.mapFromPayloads = mapFromPayloads;
/**
 * Tries to convert values to {@link Payload}s using the {@link PayloadConverterWithEncoding}s provided to the constructor, in the order provided.
 *
 * Converts Payloads to values based on the `Payload.metadata.encoding` field, which matches the {@link PayloadConverterWithEncoding.encodingType}
 * of the converter that created the Payload.
 */
class CompositePayloadConverter {
    constructor(...converters) {
        this.converterByEncoding = new Map();
        if (converters.length === 0) {
            throw new errors_1.PayloadConverterError('Must provide at least one PayloadConverterWithEncoding');
        }
        this.converters = converters;
        for (const converter of converters) {
            this.converterByEncoding.set(converter.encodingType, converter);
        }
    }
    /**
     * Tries to run `.toPayload(value)` on each converter in the order provided at construction.
     * Returns the first successful result, throws {@link ValueError} if there is no converter that can handle the value.
     */
    toPayload(value) {
        for (const converter of this.converters) {
            const result = converter.toPayload(value);
            if (result !== undefined) {
                return result;
            }
        }
        throw new errors_1.ValueError(`Unable to convert ${value} to payload`);
    }
    /**
     * Run {@link PayloadConverterWithEncoding.fromPayload} based on the `encoding` metadata of the {@link Payload}.
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const encoding = (0, encoding_1.decode)(payload.metadata[types_1.METADATA_ENCODING_KEY]);
        const converter = this.converterByEncoding.get(encoding);
        if (converter === undefined) {
            throw new errors_1.ValueError(`Unknown encoding: ${encoding}`);
        }
        return converter.fromPayload(payload);
    }
}
exports.CompositePayloadConverter = CompositePayloadConverter;
/**
 * Converts between JS undefined and NULL Payload
 */
class UndefinedPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_NULL;
    }
    toPayload(value) {
        if (value !== undefined) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_NULL,
            },
        };
    }
    fromPayload(_content) {
        return undefined; // Just return undefined
    }
}
exports.UndefinedPayloadConverter = UndefinedPayloadConverter;
/**
 * Converts between binary data types and RAW Payload
 */
class BinaryPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_RAW;
    }
    toPayload(value) {
        if (!(value instanceof Uint8Array)) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_RAW,
            },
            data: value,
        };
    }
    fromPayload(content) {
        return content.data;
    }
}
exports.BinaryPayloadConverter = BinaryPayloadConverter;
/**
 * Converts between non-undefined values and serialized JSON Payload
 */
class JsonPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_JSON;
    }
    toPayload(value) {
        if (value === undefined) {
            return undefined;
        }
        let json;
        try {
            json = JSON.stringify(value);
        }
        catch (e) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_JSON,
            },
            data: (0, encoding_1.encode)(json),
        };
    }
    fromPayload(content) {
        if (content.data === undefined || content.data === null) {
            throw new errors_1.ValueError('Got payload with no data');
        }
        return JSON.parse((0, encoding_1.decode)(content.data));
    }
}
exports.JsonPayloadConverter = JsonPayloadConverter;
/**
 * Converts Search Attribute values using JsonPayloadConverter
 */
class SearchAttributePayloadConverter {
    constructor() {
        this.jsonConverter = new JsonPayloadConverter();
        this.validNonDateTypes = ['string', 'number', 'boolean'];
    }
    toPayload(values) {
        if (!(values instanceof Array)) {
            throw new errors_1.ValueError(`SearchAttribute value must be an array`);
        }
        if (values.length > 0) {
            const firstValue = values[0];
            const firstType = typeof firstValue;
            if (firstType === 'object') {
                for (const idx in values) {
                    const value = values[idx];
                    if (!(value instanceof Date)) {
                        throw new errors_1.ValueError(`SearchAttribute values must arrays of strings, numbers, booleans, or Dates. The value ${value} at index ${idx} is of type ${typeof value}`);
                    }
                }
            }
            else {
                if (!this.validNonDateTypes.includes(firstType)) {
                    throw new errors_1.ValueError(`SearchAttribute array values must be: string | number | boolean | Date`);
                }
                for (const idx in values) {
                    const value = values[idx];
                    if (typeof value !== firstType) {
                        throw new errors_1.ValueError(`All SearchAttribute array values must be of the same type. The first value ${firstValue} of type ${firstType} doesn't match value ${value} of type ${typeof value} at index ${idx}`);
                    }
                }
            }
        }
        // JSON.stringify takes care of converting Dates to ISO strings
        const ret = this.jsonConverter.toPayload(values);
        if (ret === undefined) {
            throw new errors_1.IllegalStateError('Could not convert search attributes to payloads');
        }
        return ret;
    }
    /**
     * Datetime Search Attribute values are converted to `Date`s
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const value = this.jsonConverter.fromPayload(payload);
        let arrayWrappedValue = value instanceof Array ? value : [value];
        const searchAttributeType = (0, encoding_1.decode)(payload.metadata.type);
        if (searchAttributeType === 'Datetime') {
            arrayWrappedValue = arrayWrappedValue.map((dateString) => new Date(dateString));
        }
        return arrayWrappedValue;
    }
}
exports.SearchAttributePayloadConverter = SearchAttributePayloadConverter;
exports.searchAttributePayloadConverter = new SearchAttributePayloadConverter();
class DefaultPayloadConverter extends CompositePayloadConverter {
    // Match the order used in other SDKs, but exclude Protobuf converters so that the code, including
    // `proto3-json-serializer`, doesn't take space in Workflow bundles that don't use Protobufs. To use Protobufs, use
    // {@link DefaultPayloadConverterWithProtobufs}.
    //
    // Go SDK:
    // https://github.com/temporalio/sdk-go/blob/5e5645f0c550dcf717c095ae32c76a7087d2e985/converter/default_data_converter.go#L28
    constructor() {
        super(new UndefinedPayloadConverter(), new BinaryPayloadConverter(), new JsonPayloadConverter());
    }
}
exports.DefaultPayloadConverter = DefaultPayloadConverter;
/**
 * The default {@link PayloadConverter} used by the SDK. Supports `Uint8Array` and JSON serializables (so if
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description | `JSON.stringify(yourArgOrRetval)`}
 * works, the default payload converter will work).
 *
 * To also support Protobufs, create a custom payload converter with {@link DefaultPayloadConverter}:
 *
 * `const myConverter = new DefaultPayloadConverter({ protobufRoot })`
 */
exports.defaultPayloadConverter = new DefaultPayloadConverter();


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/converter/types.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/converter/types.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.METADATA_MESSAGE_TYPE_KEY = exports.encodingKeys = exports.encodingTypes = exports.METADATA_ENCODING_KEY = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "./node_modules/@temporalio/common/lib/encoding.js");
exports.METADATA_ENCODING_KEY = 'encoding';
exports.encodingTypes = {
    METADATA_ENCODING_NULL: 'binary/null',
    METADATA_ENCODING_RAW: 'binary/plain',
    METADATA_ENCODING_JSON: 'json/plain',
    METADATA_ENCODING_PROTOBUF_JSON: 'json/protobuf',
    METADATA_ENCODING_PROTOBUF: 'binary/protobuf',
};
exports.encodingKeys = {
    METADATA_ENCODING_NULL: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_NULL),
    METADATA_ENCODING_RAW: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_RAW),
    METADATA_ENCODING_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_JSON),
    METADATA_ENCODING_PROTOBUF_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF_JSON),
    METADATA_ENCODING_PROTOBUF: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF),
};
exports.METADATA_MESSAGE_TYPE_KEY = 'messageType';


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/deprecated-time.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/deprecated-time.js ***!
  \****************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const time = __importStar(__webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js"));
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToMs(ts) {
    return time.optionalTsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 *
 * @hidden
 * @deprecated - meant for internal use only
 * @deprecated - meant for internal use only
 */
function tsToMs(ts) {
    return time.tsToMs(ts);
}
exports.tsToMs = tsToMs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msNumberToTs(millis) {
    return time.msNumberToTs(millis);
}
exports.msNumberToTs = msNumberToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToTs(str) {
    return time.msToTs(str);
}
exports.msToTs = msToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToTs(str) {
    return time.msOptionalToTs(str);
}
exports.msOptionalToTs = msOptionalToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToNumber(val) {
    return time.msOptionalToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToNumber(val) {
    return time.msToNumber(val);
}
exports.msToNumber = msToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function tsToDate(ts) {
    return time.tsToDate(ts);
}
exports.tsToDate = tsToDate;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToDate(ts) {
    return time.optionalTsToDate(ts);
}
exports.optionalTsToDate = optionalTsToDate;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/encoding.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/encoding.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Pasted with modifications from: https://raw.githubusercontent.com/anonyco/FastestSmallestTextEncoderDecoder/master/EncoderDecoderTogether.src.js
/* eslint no-fallthrough: 0 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decode = exports.encode = exports.TextEncoder = exports.TextDecoder = void 0;
const fromCharCode = String.fromCharCode;
const encoderRegexp = /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g;
const tmpBufferU16 = new Uint16Array(32);
class TextDecoder {
    decode(inputArrayOrBuffer) {
        const inputAs8 = inputArrayOrBuffer instanceof Uint8Array ? inputArrayOrBuffer : new Uint8Array(inputArrayOrBuffer);
        let resultingString = '', tmpStr = '', index = 0, nextEnd = 0, cp0 = 0, codePoint = 0, minBits = 0, cp1 = 0, pos = 0, tmp = -1;
        const len = inputAs8.length | 0;
        const lenMinus32 = (len - 32) | 0;
        // Note that tmp represents the 2nd half of a surrogate pair incase a surrogate gets divided between blocks
        for (; index < len;) {
            nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
            for (; pos < nextEnd; index = (index + 1) | 0, pos = (pos + 1) | 0) {
                cp0 = inputAs8[index] & 0xff;
                switch (cp0 >> 4) {
                    case 15:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        if (cp1 >> 6 !== 0b10 || 0b11110111 < cp0) {
                            index = (index - 1) | 0;
                            break;
                        }
                        codePoint = ((cp0 & 0b111) << 6) | (cp1 & 0b00111111);
                        minBits = 5; // 20 ensures it never passes -> all invalid replacements
                        cp0 = 0x100; //  keep track of th bit size
                    case 14:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b1111) << 6) | (cp1 & 0b00111111);
                        minBits = cp1 >> 6 === 0b10 ? (minBits + 4) | 0 : 24; // 24 ensures it never passes -> all invalid replacements
                        cp0 = (cp0 + 0x100) & 0x300; // keep track of th bit size
                    case 13:
                    case 12:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b11111) << 6) | (cp1 & 0b00111111);
                        minBits = (minBits + 7) | 0;
                        // Now, process the code point
                        if (index < len && cp1 >> 6 === 0b10 && codePoint >> minBits && codePoint < 0x110000) {
                            cp0 = codePoint;
                            codePoint = (codePoint - 0x10000) | 0;
                            if (0 <= codePoint /*0xffff < codePoint*/) {
                                // BMP code point
                                //nextEnd = nextEnd - 1|0;
                                tmp = ((codePoint >> 10) + 0xd800) | 0; // highSurrogate
                                cp0 = ((codePoint & 0x3ff) + 0xdc00) | 0; // lowSurrogate (will be inserted later in the switch-statement)
                                if (pos < 31) {
                                    // notice 31 instead of 32
                                    tmpBufferU16[pos] = tmp;
                                    pos = (pos + 1) | 0;
                                    tmp = -1;
                                }
                                else {
                                    // else, we are at the end of the inputAs8 and let tmp0 be filled in later on
                                    // NOTE that cp1 is being used as a temporary variable for the swapping of tmp with cp0
                                    cp1 = tmp;
                                    tmp = cp0;
                                    cp0 = cp1;
                                }
                            }
                            else
                                nextEnd = (nextEnd + 1) | 0; // because we are advancing i without advancing pos
                        }
                        else {
                            // invalid code point means replacing the whole thing with null replacement characters
                            cp0 >>= 8;
                            index = (index - cp0 - 1) | 0; // reset index  back to what it was before
                            cp0 = 0xfffd;
                        }
                        // Finally, reset the variables for the next go-around
                        minBits = 0;
                        codePoint = 0;
                        nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
                    /*case 11:
                  case 10:
                  case 9:
                  case 8:
                    codePoint ? codePoint = 0 : cp0 = 0xfffd; // fill with invalid replacement character
                  case 7:
                  case 6:
                  case 5:
                  case 4:
                  case 3:
                  case 2:
                  case 1:
                  case 0:
                    tmpBufferU16[pos] = cp0;
                    continue;*/
                    default: // fill with invalid replacement character
                        tmpBufferU16[pos] = cp0;
                        continue;
                    case 11:
                    case 10:
                    case 9:
                    case 8:
                }
                tmpBufferU16[pos] = 0xfffd; // fill with invalid replacement character
            }
            tmpStr += fromCharCode(tmpBufferU16[0], tmpBufferU16[1], tmpBufferU16[2], tmpBufferU16[3], tmpBufferU16[4], tmpBufferU16[5], tmpBufferU16[6], tmpBufferU16[7], tmpBufferU16[8], tmpBufferU16[9], tmpBufferU16[10], tmpBufferU16[11], tmpBufferU16[12], tmpBufferU16[13], tmpBufferU16[14], tmpBufferU16[15], tmpBufferU16[16], tmpBufferU16[17], tmpBufferU16[18], tmpBufferU16[19], tmpBufferU16[20], tmpBufferU16[21], tmpBufferU16[22], tmpBufferU16[23], tmpBufferU16[24], tmpBufferU16[25], tmpBufferU16[26], tmpBufferU16[27], tmpBufferU16[28], tmpBufferU16[29], tmpBufferU16[30], tmpBufferU16[31]);
            if (pos < 32)
                tmpStr = tmpStr.slice(0, (pos - 32) | 0); //-(32-pos));
            if (index < len) {
                //fromCharCode.apply(0, tmpBufferU16 : Uint8Array ?  tmpBufferU16.subarray(0,pos) : tmpBufferU16.slice(0,pos));
                tmpBufferU16[0] = tmp;
                pos = ~tmp >>> 31; //tmp !== -1 ? 1 : 0;
                tmp = -1;
                if (tmpStr.length < resultingString.length)
                    continue;
            }
            else if (tmp !== -1) {
                tmpStr += fromCharCode(tmp);
            }
            resultingString += tmpStr;
            tmpStr = '';
        }
        return resultingString;
    }
}
exports.TextDecoder = TextDecoder;
//////////////////////////////////////////////////////////////////////////////////////
function encoderReplacer(nonAsciiChars) {
    // make the UTF string into a binary UTF-8 encoded string
    let point = nonAsciiChars.charCodeAt(0) | 0;
    if (0xd800 <= point) {
        if (point <= 0xdbff) {
            const nextcode = nonAsciiChars.charCodeAt(1) | 0; // defaults to 0 when NaN, causing null replacement character
            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                if (point > 0xffff)
                    return fromCharCode((0x1e /*0b11110*/ << 3) | (point >> 18), (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
            }
            else
                point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
        else if (point <= 0xdfff) {
            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
    }
    /*if (point <= 0x007f) return nonAsciiChars;
    else */ if (point <= 0x07ff) {
        return fromCharCode((0x6 << 5) | (point >> 6), (0x2 << 6) | (point & 0x3f));
    }
    else
        return fromCharCode((0xe /*0b1110*/ << 4) | (point >> 12), (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
}
class TextEncoder {
    encode(inputString) {
        // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
        // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
        const encodedString = inputString === void 0 ? '' : '' + inputString, len = encodedString.length | 0;
        let result = new Uint8Array(((len << 1) + 8) | 0);
        let tmpResult;
        let i = 0, pos = 0, point = 0, nextcode = 0;
        let upgradededArraySize = !Uint8Array; // normal arrays are auto-expanding
        for (i = 0; i < len; i = (i + 1) | 0, pos = (pos + 1) | 0) {
            point = encodedString.charCodeAt(i) | 0;
            if (point <= 0x007f) {
                result[pos] = point;
            }
            else if (point <= 0x07ff) {
                result[pos] = (0x6 << 5) | (point >> 6);
                result[(pos = (pos + 1) | 0)] = (0x2 << 6) | (point & 0x3f);
            }
            else {
                widenCheck: {
                    if (0xd800 <= point) {
                        if (point <= 0xdbff) {
                            nextcode = encodedString.charCodeAt((i = (i + 1) | 0)) | 0; // defaults to 0 when NaN, causing null replacement character
                            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                                if (point > 0xffff) {
                                    result[pos] = (0x1e /*0b11110*/ << 3) | (point >> 18);
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                                    continue;
                                }
                                break widenCheck;
                            }
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                        else if (point <= 0xdfff) {
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                    }
                    if (!upgradededArraySize && i << 1 < pos && i << 1 < ((pos - 7) | 0)) {
                        upgradededArraySize = true;
                        tmpResult = new Uint8Array(len * 3);
                        tmpResult.set(result);
                        result = tmpResult;
                    }
                }
                result[pos] = (0xe /*0b1110*/ << 4) | (point >> 12);
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
            }
        }
        return Uint8Array ? result.subarray(0, pos) : result.slice(0, pos);
    }
    encodeInto(inputString, u8Arr) {
        const encodedString = inputString === void 0 ? '' : ('' + inputString).replace(encoderRegexp, encoderReplacer);
        let len = encodedString.length | 0, i = 0, char = 0, read = 0;
        const u8ArrLen = u8Arr.length | 0;
        const inputLength = inputString.length | 0;
        if (u8ArrLen < len)
            len = u8ArrLen;
        putChars: {
            for (; i < len; i = (i + 1) | 0) {
                char = encodedString.charCodeAt(i) | 0;
                switch (char >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        read = (read + 1) | 0;
                    // extension points:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        break;
                    case 12:
                    case 13:
                        if (((i + 1) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    case 14:
                        if (((i + 2) | 0) < u8ArrLen) {
                            //if (!(char === 0xEF && encodedString.substr(i+1|0,2) === "\xBF\xBD"))
                            read = (read + 1) | 0;
                            break;
                        }
                    case 15:
                        if (((i + 3) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    default:
                        break putChars;
                }
                //read = read + ((char >> 6) !== 2) |0;
                u8Arr[i] = char;
            }
        }
        return { written: i, read: inputLength < read ? inputLength : read };
    }
}
exports.TextEncoder = TextEncoder;
/**
 * Encode a UTF-8 string into a Uint8Array
 */
function encode(s) {
    return TextEncoder.prototype.encode(s);
}
exports.encode = encode;
/**
 * Decode a Uint8Array into a UTF-8 string
 */
function decode(a) {
    return TextDecoder.prototype.decode(a);
}
exports.decode = decode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/errors.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/errors.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WorkflowNotFoundError = exports.WorkflowExecutionAlreadyStartedError = exports.IllegalStateError = exports.PayloadConverterError = exports.ValueError = void 0;
/**
 * Thrown from code that receives a value that is unexpected or that it's unable to handle.
 */
class ValueError extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
        this.name = 'ValueError';
    }
}
exports.ValueError = ValueError;
/**
 * Thrown when a Payload Converter is misconfigured.
 */
class PayloadConverterError extends ValueError {
    constructor() {
        super(...arguments);
        this.name = 'PayloadConverterError';
    }
}
exports.PayloadConverterError = PayloadConverterError;
/**
 * Used in different parts of the SDK to note that something unexpected has happened.
 */
class IllegalStateError extends Error {
    constructor() {
        super(...arguments);
        this.name = 'IllegalStateError';
    }
}
exports.IllegalStateError = IllegalStateError;
/**
 * This exception is thrown in the following cases:
 *  - Workflow with the same Workflow Id is currently running
 *  - There is a closed Workflow with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE`
 *  - There is closed Workflow in the `Completed` state with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY`
 */
class WorkflowExecutionAlreadyStartedError extends Error {
    constructor(message, workflowId, workflowType) {
        super(message);
        this.workflowId = workflowId;
        this.workflowType = workflowType;
        this.name = 'WorkflowExecutionAlreadyStartedError';
    }
}
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError;
/**
 * Thrown when a Workflow with the given Id is not known to Temporal Server.
 * It could be because:
 * - Id passed is incorrect
 * - Workflow is closed (for some calls, e.g. `terminate`)
 * - Workflow was deleted from the Server after reaching its retention limit
 */
class WorkflowNotFoundError extends Error {
    constructor(message, workflowId, runId) {
        super(message);
        this.workflowId = workflowId;
        this.runId = runId;
        this.name = 'WorkflowNotFoundError';
    }
}
exports.WorkflowNotFoundError = WorkflowNotFoundError;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/failure.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/failure.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rootCause = exports.ensureTemporalFailure = exports.ensureApplicationFailure = exports.ChildWorkflowFailure = exports.ActivityFailure = exports.TimeoutFailure = exports.TerminatedFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ServerFailure = exports.TemporalFailure = exports.RetryState = exports.TimeoutType = exports.FAILURE_SOURCE = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
exports.FAILURE_SOURCE = 'TypeScriptSDK';
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.TimeoutType
var TimeoutType;
(function (TimeoutType) {
    TimeoutType[TimeoutType["TIMEOUT_TYPE_UNSPECIFIED"] = 0] = "TIMEOUT_TYPE_UNSPECIFIED";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_START_TO_CLOSE"] = 1] = "TIMEOUT_TYPE_START_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_START"] = 2] = "TIMEOUT_TYPE_SCHEDULE_TO_START";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_CLOSE"] = 3] = "TIMEOUT_TYPE_SCHEDULE_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_HEARTBEAT"] = 4] = "TIMEOUT_TYPE_HEARTBEAT";
})(TimeoutType = exports.TimeoutType || (exports.TimeoutType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.RetryState
var RetryState;
(function (RetryState) {
    RetryState[RetryState["RETRY_STATE_UNSPECIFIED"] = 0] = "RETRY_STATE_UNSPECIFIED";
    RetryState[RetryState["RETRY_STATE_IN_PROGRESS"] = 1] = "RETRY_STATE_IN_PROGRESS";
    RetryState[RetryState["RETRY_STATE_NON_RETRYABLE_FAILURE"] = 2] = "RETRY_STATE_NON_RETRYABLE_FAILURE";
    RetryState[RetryState["RETRY_STATE_TIMEOUT"] = 3] = "RETRY_STATE_TIMEOUT";
    RetryState[RetryState["RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED"] = 4] = "RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED";
    RetryState[RetryState["RETRY_STATE_RETRY_POLICY_NOT_SET"] = 5] = "RETRY_STATE_RETRY_POLICY_NOT_SET";
    RetryState[RetryState["RETRY_STATE_INTERNAL_SERVER_ERROR"] = 6] = "RETRY_STATE_INTERNAL_SERVER_ERROR";
    RetryState[RetryState["RETRY_STATE_CANCEL_REQUESTED"] = 7] = "RETRY_STATE_CANCEL_REQUESTED";
})(RetryState = exports.RetryState || (exports.RetryState = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Represents failures that can cross Workflow and Activity boundaries.
 *
 * **Never extend this class or any of its children.**
 *
 * The only child class you should ever throw from your code is {@link ApplicationFailure}.
 */
class TemporalFailure extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
        this.name = 'TemporalFailure';
    }
}
exports.TemporalFailure = TemporalFailure;
/** Exceptions originated at the Temporal service. */
class ServerFailure extends TemporalFailure {
    constructor(message, nonRetryable, cause) {
        super(message, cause);
        this.nonRetryable = nonRetryable;
        this.name = 'ServerFailure';
    }
}
exports.ServerFailure = ServerFailure;
/**
 * `ApplicationFailure`s are used to communicate application-specific failures in Workflows and Activities.
 *
 * The {@link type} property is matched against {@link RetryPolicy.nonRetryableErrorTypes} to determine if an instance
 * of this error is retryable. Another way to avoid retrying is by setting the {@link nonRetryable} flag to `true`.
 *
 * In Workflows, if you throw a non-`ApplicationFailure`, the Workflow Task will fail and be retried. If you throw an
 * `ApplicationFailure`, the Workflow Execution will fail.
 *
 * In Activities, you can either throw an `ApplicationFailure` or another `Error` to fail the Activity Task. In the
 * latter case, the `Error` will be converted to an `ApplicationFailure`. The conversion is done as following:
 *
 * - `type` is set to `error.constructor?.name ?? error.name`
 * - `message` is set to `error.message`
 * - `nonRetryable` is set to false
 * - `details` are set to null
 * - stack trace is copied from the original error
 *
 * When an {@link https://docs.temporal.io/concepts/what-is-an-activity-execution | Activity Execution} fails, the
 * `ApplicationFailure` from the last Activity Task will be the `cause` of the {@link ActivityFailure} thrown in the
 * Workflow.
 */
class ApplicationFailure extends TemporalFailure {
    /**
     * Alternatively, use {@link fromError} or {@link create}.
     */
    constructor(message, type, nonRetryable, details, cause) {
        super(message, cause);
        this.type = type;
        this.nonRetryable = nonRetryable;
        this.details = details;
        this.name = 'ApplicationFailure';
    }
    /**
     * Create a new `ApplicationFailure` from an Error object.
     *
     * First calls {@link ensureApplicationFailure | `ensureApplicationFailure(error)`} and then overrides any fields
     * provided in `overrides`.
     */
    static fromError(error, overrides) {
        const failure = ensureApplicationFailure(error);
        Object.assign(failure, overrides);
        return failure;
    }
    /**
     * Create a new `ApplicationFailure`.
     *
     * By default, will be retryable (unless its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}).
     */
    static create(options) {
        const { message, type, nonRetryable = false, details, cause } = options;
        return new this(message, type, nonRetryable, details, cause);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to false. Note that this error will still
     * not be retried if its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}.
     *
     * @param message Optional error message
     * @param type Optional error type (used by {@link RetryPolicy.nonRetryableErrorTypes})
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static retryable(message, type, ...details) {
        return new this(message, type ?? 'Error', false, details);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to true.
     *
     * When thrown from an Activity or Workflow, the Activity or Workflow will not be retried (even if `type` is not
     * listed in {@link RetryPolicy.nonRetryableErrorTypes}).
     *
     * @param message Optional error message
     * @param type Optional error type
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static nonRetryable(message, type, ...details) {
        return new this(message, type ?? 'Error', true, details);
    }
}
exports.ApplicationFailure = ApplicationFailure;
/**
 * This error is thrown when Cancellation has been requested. To allow Cancellation to happen, let it propagate. To
 * ignore Cancellation, catch it and continue executing. Note that Cancellation can only be requested a single time, so
 * your Workflow/Activity Execution will not receive further Cancellation requests.
 *
 * When a Workflow or Activity has been successfully cancelled, a `CancelledFailure` will be the `cause`.
 */
class CancelledFailure extends TemporalFailure {
    constructor(message, details = [], cause) {
        super(message, cause);
        this.details = details;
        this.name = 'CancelledFailure';
    }
}
exports.CancelledFailure = CancelledFailure;
/**
 * Used as the `cause` when a Workflow has been terminated
 */
class TerminatedFailure extends TemporalFailure {
    constructor(message, cause) {
        super(message, cause);
        this.name = 'TerminatedFailure';
    }
}
exports.TerminatedFailure = TerminatedFailure;
/**
 * Used to represent timeouts of Activities and Workflows
 */
class TimeoutFailure extends TemporalFailure {
    constructor(message, lastHeartbeatDetails, timeoutType) {
        super(message);
        this.lastHeartbeatDetails = lastHeartbeatDetails;
        this.timeoutType = timeoutType;
        this.name = 'TimeoutFailure';
    }
}
exports.TimeoutFailure = TimeoutFailure;
/**
 * Contains information about an Activity failure. Always contains the original reason for the failure as its `cause`.
 * For example, if an Activity timed out, the cause will be a {@link TimeoutFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
class ActivityFailure extends TemporalFailure {
    constructor(activityType, activityId, retryState, identity, cause) {
        super('Activity execution failed', cause);
        this.activityType = activityType;
        this.activityId = activityId;
        this.retryState = retryState;
        this.identity = identity;
        this.name = 'ActivityFailure';
    }
}
exports.ActivityFailure = ActivityFailure;
/**
 * Contains information about a Child Workflow failure. Always contains the reason for the failure as its {@link cause}.
 * For example, if the Child was Terminated, the `cause` is a {@link TerminatedFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
class ChildWorkflowFailure extends TemporalFailure {
    constructor(namespace, execution, workflowType, retryState, cause) {
        super('Child Workflow execution failed', cause);
        this.namespace = namespace;
        this.execution = execution;
        this.workflowType = workflowType;
        this.retryState = retryState;
        this.name = 'ChildWorkflowFailure';
    }
}
exports.ChildWorkflowFailure = ChildWorkflowFailure;
/**
 * If `error` is already an `ApplicationFailure`, returns `error`.
 *
 * Otherwise, converts `error` into an `ApplicationFailure` with:
 *
 * - `message`: `error.message` or `String(error)`
 * - `type`: `error.constructor.name` or `error.name`
 * - `stack`: `error.stack` or `''`
 */
function ensureApplicationFailure(error) {
    if (error instanceof ApplicationFailure) {
        return error;
    }
    const message = ((0, type_helpers_1.isRecord)(error) && String(error.message)) || String(error);
    const type = ((0, type_helpers_1.isRecord)(error) && (error.constructor?.name ?? error.name)) || undefined;
    const failure = ApplicationFailure.create({ message, type, nonRetryable: false });
    failure.stack = ((0, type_helpers_1.isRecord)(error) && String(error.stack)) || '';
    return failure;
}
exports.ensureApplicationFailure = ensureApplicationFailure;
/**
 * If `err` is an Error it is turned into an `ApplicationFailure`.
 *
 * If `err` was already a `TemporalFailure`, returns the original error.
 *
 * Otherwise returns an `ApplicationFailure` with `String(err)` as the message.
 */
function ensureTemporalFailure(err) {
    if (err instanceof TemporalFailure) {
        return err;
    }
    return ensureApplicationFailure(err);
}
exports.ensureTemporalFailure = ensureTemporalFailure;
/**
 * Get the root cause message of given `error`.
 *
 * In case `error` is a {@link TemporalFailure}, recurse the `cause` chain and return the root `cause.message`.
 * Otherwise, return `error.message`.
 */
function rootCause(error) {
    if (error instanceof TemporalFailure) {
        return error.cause ? rootCause(error.cause) : error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return undefined;
}
exports.rootCause = rootCause;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/index.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * Common library for code that's used across the Client, Worker, and/or Workflow
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorCode = exports.errorMessage = exports.str = exports.u8 = void 0;
const encoding = __importStar(__webpack_require__(/*! ./encoding */ "./node_modules/@temporalio/common/lib/encoding.js"));
const helpers = __importStar(__webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js"));
__exportStar(__webpack_require__(/*! ./activity-options */ "./node_modules/@temporalio/common/lib/activity-options.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/data-converter */ "./node_modules/@temporalio/common/lib/converter/data-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/failure-converter */ "./node_modules/@temporalio/common/lib/converter/failure-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-codec */ "./node_modules/@temporalio/common/lib/converter/payload-codec.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-converter */ "./node_modules/@temporalio/common/lib/converter/payload-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/types */ "./node_modules/@temporalio/common/lib/converter/types.js"), exports);
__exportStar(__webpack_require__(/*! ./deprecated-time */ "./node_modules/@temporalio/common/lib/deprecated-time.js"), exports);
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./failure */ "./node_modules/@temporalio/common/lib/failure.js"), exports);
__exportStar(__webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/common/lib/interfaces.js"), exports);
__exportStar(__webpack_require__(/*! ./retry-policy */ "./node_modules/@temporalio/common/lib/retry-policy.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
/**
 * Encode a UTF-8 string into a Uint8Array
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function u8(s) {
    return encoding.encode(s);
}
exports.u8 = u8;
/**
 * Decode a Uint8Array into a UTF-8 string
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function str(arr) {
    return encoding.decode(arr);
}
exports.str = str;
/**
 * Get `error.message` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorMessage(error) {
    return helpers.errorMessage(error);
}
exports.errorMessage = errorMessage;
/**
 * Get `error.code` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorCode(error) {
    return helpers.errorCode(error);
}
exports.errorCode = errorCode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interceptors.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interceptors.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.composeInterceptors = void 0;
/**
 * Composes all interceptor methods into a single function
 *
 * @param interceptors a list of interceptors
 * @param method the name of the interceptor method to compose
 * @param next the original function to be executed at the end of the interception chain
 */
// ts-prune-ignore-next (imported via lib/interceptors)
function composeInterceptors(interceptors, method, next) {
    for (let i = interceptors.length - 1; i >= 0; --i) {
        const interceptor = interceptors[i];
        if (interceptor[method] !== undefined) {
            const prev = next;
            // We loose type safety here because Typescript can't deduce that interceptor[method] is a function that returns
            // the same type as Next<I, M>
            next = ((input) => interceptor[method](input, prev));
        }
    }
    return next;
}
exports.composeInterceptors = composeInterceptors;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/interfaces.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/interfaces.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/retry-policy.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/retry-policy.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decompileRetryPolicy = exports.compileRetryPolicy = void 0;
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
const time_1 = __webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js");
/**
 * Turn a TS RetryPolicy into a proto compatible RetryPolicy
 */
function compileRetryPolicy(retryPolicy) {
    if (retryPolicy.backoffCoefficient != null && retryPolicy.backoffCoefficient <= 0) {
        throw new errors_1.ValueError('RetryPolicy.backoffCoefficient must be greater than 0');
    }
    if (retryPolicy.maximumAttempts != null) {
        if (retryPolicy.maximumAttempts === Number.POSITIVE_INFINITY) {
            // drop field (Infinity is the default)
            const { maximumAttempts: _, ...without } = retryPolicy;
            retryPolicy = without;
        }
        else if (retryPolicy.maximumAttempts <= 0) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be a positive integer');
        }
        else if (!Number.isInteger(retryPolicy.maximumAttempts)) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be an integer');
        }
    }
    const maximumInterval = (0, time_1.msOptionalToNumber)(retryPolicy.maximumInterval);
    const initialInterval = (0, time_1.msToNumber)(retryPolicy.initialInterval ?? 1000);
    if (maximumInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be 0');
    }
    if (initialInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.initialInterval cannot be 0');
    }
    if (maximumInterval != null && maximumInterval < initialInterval) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be less than its initialInterval');
    }
    return {
        maximumAttempts: retryPolicy.maximumAttempts,
        initialInterval: (0, time_1.msToTs)(initialInterval),
        maximumInterval: (0, time_1.msOptionalToTs)(maximumInterval),
        backoffCoefficient: retryPolicy.backoffCoefficient,
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes,
    };
}
exports.compileRetryPolicy = compileRetryPolicy;
/**
 * Turn a proto compatible RetryPolicy into a TS RetryPolicy
 */
function decompileRetryPolicy(retryPolicy) {
    if (!retryPolicy) {
        return undefined;
    }
    return {
        backoffCoefficient: retryPolicy.backoffCoefficient ?? undefined,
        maximumAttempts: retryPolicy.maximumAttempts ?? undefined,
        maximumInterval: (0, time_1.optionalTsToMs)(retryPolicy.maximumInterval),
        initialInterval: (0, time_1.optionalTsToMs)(retryPolicy.initialInterval),
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes ?? undefined,
    };
}
exports.decompileRetryPolicy = decompileRetryPolicy;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/time.js":
/*!*****************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/time.js ***!
  \*****************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalDateToTs = exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
// eslint-disable-next-line import/no-named-as-default
const long_1 = __importDefault(__webpack_require__(/*! long */ "./node_modules/@temporalio/common/node_modules/long/umd/index.js"));
const ms_1 = __importDefault(__webpack_require__(/*! ms */ "./node_modules/ms/index.js"));
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/common/lib/errors.js");
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 */
function optionalTsToMs(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return tsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 */
function tsToMs(ts) {
    if (ts === undefined || ts === null) {
        throw new Error(`Expected timestamp, got ${ts}`);
    }
    const { seconds, nanos } = ts;
    return (seconds || long_1.default.UZERO)
        .mul(1000)
        .add(Math.floor((nanos || 0) / 1000000))
        .toNumber();
}
exports.tsToMs = tsToMs;
function msNumberToTs(millis) {
    const seconds = Math.floor(millis / 1000);
    const nanos = (millis % 1000) * 1000000;
    if (Number.isNaN(seconds) || Number.isNaN(nanos)) {
        throw new errors_1.ValueError(`Invalid millis ${millis}`);
    }
    return { seconds: long_1.default.fromNumber(seconds), nanos };
}
exports.msNumberToTs = msNumberToTs;
function msToTs(str) {
    if (typeof str === 'number') {
        return msNumberToTs(str);
    }
    return msNumberToTs((0, ms_1.default)(str));
}
exports.msToTs = msToTs;
function msOptionalToTs(str) {
    return str ? msToTs(str) : undefined;
}
exports.msOptionalToTs = msOptionalToTs;
function msOptionalToNumber(val) {
    if (val === undefined)
        return undefined;
    return msToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
function msToNumber(val) {
    if (typeof val === 'number') {
        return val;
    }
    return (0, ms_1.default)(val);
}
exports.msToNumber = msToNumber;
function tsToDate(ts) {
    return new Date(tsToMs(ts));
}
exports.tsToDate = tsToDate;
function optionalTsToDate(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return new Date(tsToMs(ts));
}
exports.optionalTsToDate = optionalTsToDate;
// ts-prune-ignore-next (imported via schedule-helpers.ts)
function optionalDateToTs(date) {
    if (date === undefined || date === null) {
        return undefined;
    }
    return msToTs(date.getTime());
}
exports.optionalDateToTs = optionalDateToTs;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/type-helpers.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/type-helpers.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorCode = exports.errorMessage = exports.hasOwnProperties = exports.hasOwnProperty = exports.isRecord = exports.checkExtends = void 0;
/** Verify that an type _Copy extends _Orig */
function checkExtends() {
    // noop, just type check
}
exports.checkExtends = checkExtends;
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
exports.isRecord = isRecord;
// ts-prune-ignore-next
function hasOwnProperty(record, prop) {
    return prop in record;
}
exports.hasOwnProperty = hasOwnProperty;
function hasOwnProperties(record, props) {
    return props.every((prop) => prop in record);
}
exports.hasOwnProperties = hasOwnProperties;
/**
 * Get `error.message` (or `undefined` if not present)
 */
function errorMessage(error) {
    if (typeof error === 'string') {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return undefined;
}
exports.errorMessage = errorMessage;
/**
 * Get `error.code` (or `undefined` if not present)
 */
function errorCode(error) {
    if (typeof error === 'object' &&
        error.code !== undefined &&
        typeof error.code === 'string') {
        return error.code;
    }
    return undefined;
}
exports.errorCode = errorCode;


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-handle.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-handle.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/common/lib/workflow-options.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@temporalio/common/lib/workflow-options.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.compileWorkflowOptions = exports.WorkflowIdReusePolicy = void 0;
const time_1 = __webpack_require__(/*! ./time */ "./node_modules/@temporalio/common/lib/time.js");
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.WorkflowIdReusePolicy
/**
 * Concept: {@link https://docs.temporal.io/concepts/what-is-a-workflow-id-reuse-policy/ | Workflow Id Reuse Policy}
 *
 * Whether a Workflow can be started with a Workflow Id of a Closed Workflow.
 *
 * *Note: A Workflow can never be started with a Workflow Id of a Running Workflow.*
 */
var WorkflowIdReusePolicy;
(function (WorkflowIdReusePolicy) {
    /**
     * No need to use this.
     *
     * (If a `WorkflowIdReusePolicy` is set to this, or is not set at all, the default value will be used.)
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED"] = 0] = "WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state.
     * @default
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE"] = 1] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state that is not Completed.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY"] = 2] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY";
    /**
     * The Workflow cannot be started.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE"] = 3] = "WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE";
    /**
     * Terminate the current workflow if one is already running.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING"] = 4] = "WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING";
})(WorkflowIdReusePolicy = exports.WorkflowIdReusePolicy || (exports.WorkflowIdReusePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function compileWorkflowOptions(options) {
    const { workflowExecutionTimeout, workflowRunTimeout, workflowTaskTimeout, ...rest } = options;
    return {
        ...rest,
        workflowExecutionTimeout: (0, time_1.msOptionalToTs)(workflowExecutionTimeout),
        workflowRunTimeout: (0, time_1.msOptionalToTs)(workflowRunTimeout),
        workflowTaskTimeout: (0, time_1.msOptionalToTs)(workflowTaskTimeout),
    };
}
exports.compileWorkflowOptions = compileWorkflowOptions;


/***/ }),

/***/ "./node_modules/@temporalio/worker/lib/workflow-log-interceptor.js":
/*!*************************************************************************!*\
  !*** ./node_modules/@temporalio/worker/lib/workflow-log-interceptor.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.interceptors = exports.WorkflowInboundLogInterceptor = exports.workflowLogAttributes = void 0;
const workflow_1 = __webpack_require__(/*! @temporalio/workflow */ "./node_modules/@temporalio/workflow/lib/index.js");
const stack_helpers_1 = __webpack_require__(/*! @temporalio/workflow/lib/stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
/**
 * Returns a map of attributes to be set on log messages for a given Workflow
 */
function workflowLogAttributes(info) {
    return {
        namespace: info.namespace,
        taskQueue: info.taskQueue,
        workflowId: info.workflowId,
        runId: info.runId,
        workflowType: info.workflowType,
    };
}
exports.workflowLogAttributes = workflowLogAttributes;
/** Logs Workflow execution starts and completions */
class WorkflowInboundLogInterceptor {
    logAttributes() {
        return workflowLogAttributes((0, workflow_1.workflowInfo)());
    }
    execute(input, next) {
        const { defaultWorkerLogger: logger } = (0, workflow_1.proxySinks)();
        logger.debug('Workflow started', this.logAttributes());
        const p = next(input).then((res) => {
            logger.debug('Workflow completed', this.logAttributes());
            return res;
        }, (error) => {
            // Avoid using instanceof checks in case the modules they're defined in loaded more than once,
            // e.g. by jest or when multiple versions are installed.
            if (typeof error === 'object' && error != null) {
                if ((0, workflow_1.isCancellation)(error)) {
                    logger.debug('Workflow completed as cancelled', this.logAttributes());
                    throw error;
                }
                else if (error.name === 'ContinueAsNew') {
                    logger.debug('Workflow continued as new', this.logAttributes());
                    throw error;
                }
            }
            logger.warn('Workflow failed', { error, ...this.logAttributes() });
            throw error;
        });
        // Avoid showing this interceptor in stack trace query
        (0, stack_helpers_1.untrackPromise)(p);
        return p;
    }
}
exports.WorkflowInboundLogInterceptor = WorkflowInboundLogInterceptor;
// ts-prune-ignore-next
const interceptors = () => ({ inbound: [new WorkflowInboundLogInterceptor()] });
exports.interceptors = interceptors;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/alea.js":
/*!*******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/alea.js ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mash = exports.alea = void 0;
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// Taken and modified from https://github.com/davidbau/seedrandom/blob/released/lib/alea.js
class Alea {
    constructor(seed) {
        const mash = new Mash();
        // Apply the seeding algorithm from Baagoe.
        this.c = 1;
        this.s0 = mash.mash([32]);
        this.s1 = mash.mash([32]);
        this.s2 = mash.mash([32]);
        this.s0 -= mash.mash(seed);
        if (this.s0 < 0) {
            this.s0 += 1;
        }
        this.s1 -= mash.mash(seed);
        if (this.s1 < 0) {
            this.s1 += 1;
        }
        this.s2 -= mash.mash(seed);
        if (this.s2 < 0) {
            this.s2 += 1;
        }
    }
    next() {
        const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return (this.s2 = t - (this.c = t | 0));
    }
}
function alea(seed) {
    const xg = new Alea(seed);
    return xg.next.bind(xg);
}
exports.alea = alea;
class Mash {
    constructor() {
        this.n = 0xefc8249d;
    }
    mash(data) {
        let { n } = this;
        for (let i = 0; i < data.length; i++) {
            n += data[i];
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        this.n = n;
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    }
}
exports.Mash = Mash;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/cancellation-scope.js ***!
  \*********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CancellationScope_cancelRequested;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerSleepImplementation = exports.RootCancellationScope = exports.storage = exports.CancellationScope = exports.AsyncLocalStorage = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
/** Magic symbol used to create the root scope - intentionally not exported */
const NO_PARENT = Symbol('NO_PARENT');
/**
 * In the SDK, Workflows are represented internally by a tree of scopes where the `execute` function runs in the root scope.
 * Cancellation propagates from outer scopes to inner ones and is handled by catching {@link CancelledFailure}s
 * thrown by cancellable operations (see below).
 *
 * Scopes are created using the `CancellationScope` constructor or the static helper methods
 * {@link cancellable}, {@link nonCancellable} and {@link withTimeout}.
 *
 * When a `CancellationScope` is cancelled, it will propagate cancellation any child scopes and any cancellable
 * operations created within it, such as:
 *
 * - Activities
 * - Child Workflows
 * - Timers (created with the {@link sleep} function)
 * - {@link Trigger}s
 *
 * @example
 *
 * ```ts
 * await CancellationScope.cancellable(async () => {
 *   const promise = someActivity();
 *   CancellationScope.current().cancel(); // Cancels the activity
 *   await promise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * });
 * ```
 *
 * @example
 *
 * ```ts
 * const scope = new CancellationScope();
 * const promise = scope.run(someActivity);
 * scope.cancel(); // Cancels the activity
 * await promise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * ```
 */
class CancellationScope {
    constructor(options) {
        _CancellationScope_cancelRequested.set(this, false);
        this.timeout = options?.timeout;
        this.cancellable = options?.cancellable ?? true;
        this.cancelRequested = new Promise((_, reject) => {
            // Typescript does not understand that the Promise executor runs synchronously
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = (err) => {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, true, "f");
                reject(err);
            };
        });
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested);
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested.catch(() => undefined));
        if (options?.parent !== NO_PARENT) {
            this.parent = options?.parent || CancellationScope.current();
            __classPrivateFieldSet(this, _CancellationScope_cancelRequested, __classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f"), "f");
            this.parent.cancelRequested.catch((err) => {
                this.reject(err);
            });
        }
    }
    get consideredCancelled() {
        return __classPrivateFieldGet(this, _CancellationScope_cancelRequested, "f") && this.cancellable;
    }
    /**
     * Activate the scope as current and run  `fn`
     *
     * Any timers, Activities, Triggers and CancellationScopes created in the body of `fn`
     * automatically link their cancellation to this scope.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return exports.storage.run(this, this.runInContext.bind(this, fn));
    }
    /**
     * Method that runs a function in AsyncLocalStorage context.
     *
     * Could have been written as anonymous function, made into a method for improved stack traces.
     */
    async runInContext(fn) {
        if (this.timeout) {
            (0, stack_helpers_1.untrackPromise)(sleep(this.timeout).then(() => this.cancel(), () => {
                // scope was already cancelled, ignore
            }));
        }
        return await fn();
    }
    /**
     * Request to cancel the scope and linked children
     */
    cancel() {
        this.reject(new common_1.CancelledFailure('Cancellation scope cancelled'));
    }
    /**
     * Get the current "active" scope
     */
    static current() {
        // Using globals directly instead of a helper function to avoid circular import
        return exports.storage.getStore() ?? globalThis.__TEMPORAL__.activator.rootScope;
    }
    /** Alias to `new CancellationScope({ cancellable: true }).run(fn)` */
    static cancellable(fn) {
        return new this({ cancellable: true }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: false }).run(fn)` */
    static nonCancellable(fn) {
        return new this({ cancellable: false }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: true, timeout }).run(fn)` */
    static withTimeout(timeout, fn) {
        return new this({ cancellable: true, timeout }).run(fn);
    }
}
exports.CancellationScope = CancellationScope;
_CancellationScope_cancelRequested = new WeakMap();
/**
 * This is exported so it can be disposed in the worker interface
 */
exports.storage = new exports.AsyncLocalStorage();
class RootCancellationScope extends CancellationScope {
    constructor() {
        super({ cancellable: true, parent: NO_PARENT });
    }
    cancel() {
        this.reject(new common_1.CancelledFailure('Workflow cancelled'));
    }
}
exports.RootCancellationScope = RootCancellationScope;
/** This function is here to avoid a circular dependency between this module and workflow.ts */
let sleep = (_) => {
    throw new common_1.IllegalStateError('Workflow has not been properly initialized');
};
function registerSleepImplementation(fn) {
    sleep = fn;
}
exports.registerSleepImplementation = registerSleepImplementation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/errors.js":
/*!*********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/errors.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCancellation = exports.DeterminismViolationError = exports.WorkflowError = void 0;
/**
 * Base class for all workflow errors
 */
class WorkflowError extends Error {
    constructor() {
        super(...arguments);
        this.name = 'WorkflowError';
    }
}
exports.WorkflowError = WorkflowError;
/**
 * Thrown in workflow when it tries to do something that non-deterministic such as construct a WeakMap()
 */
class DeterminismViolationError extends WorkflowError {
    constructor() {
        super(...arguments);
        this.name = 'DeterminismViolationError';
    }
}
exports.DeterminismViolationError = DeterminismViolationError;
function looksLikeError(err) {
    return typeof err === 'object' && err != null && Object.prototype.hasOwnProperty.call(err, 'name');
}
/**
 * Returns whether provided `err` is caused by cancellation
 */
function isCancellation(err) {
    if (!looksLikeError(err))
        return false;
    return (err.name === 'CancelledFailure' ||
        ((err.name === 'ActivityFailure' || err.name === 'ChildWorkflowFailure') &&
            looksLikeError(err.cause) &&
            err.cause.name === 'CancelledFailure'));
}
exports.isCancellation = isCancellation;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/index.js":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/index.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This library provides tools required for authoring workflows.
 *
 * ## Usage
 * See the {@link https://docs.temporal.io/typescript/hello-world#workflows | tutorial} for writing your first workflow.
 *
 * ### Timers
 *
 * The recommended way of scheduling timers is by using the {@link sleep} function. We've replaced `setTimeout` and
 * `clearTimeout` with deterministic versions so these are also usable but have a limitation that they don't play well
 * with {@link https://docs.temporal.io/typescript/cancellation-scopes | cancellation scopes}.
 *
 * <!--SNIPSTART typescript-sleep-workflow-->
 * <!--SNIPEND-->
 *
 * ### Activities
 *
 * To schedule Activities, use {@link proxyActivities} to obtain an Activity function and call.
 *
 * <!--SNIPSTART typescript-schedule-activity-workflow-->
 * <!--SNIPEND-->
 *
 * ### Signals and Queries
 *
 * To add signal handlers to a Workflow, add a signals property to the exported `workflow` object. Signal handlers can
 * return either `void` or `Promise<void>`, you may schedule activities and timers from a signal handler.
 *
 * To add query handlers to a Workflow, add a queries property to the exported `workflow` object. Query handlers must
 * **not** mutate any variables or generate any commands (like Activities or Timers), they run synchronously and thus
 * **must** return a `Promise`.
 *
 * #### Implementation
 *
 * <!--SNIPSTART typescript-workflow-signal-implementation-->
 * <!--SNIPEND-->
 *
 * ### More
 *
 * - [Deterministic built-ins](https://docs.temporal.io/typescript/determinism#sources-of-non-determinism)
 * - [Cancellation and scopes](https://docs.temporal.io/typescript/cancellation-scopes)
 *   - {@link CancellationScope}
 *   - {@link Trigger}
 * - [Sinks](https://docs.temporal.io/application-development/observability/?lang=ts#logging)
 *   - {@link Sinks}
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = exports.ParentClosePolicy = exports.ContinueAsNew = exports.ChildWorkflowCancellationType = exports.CancellationScope = exports.AsyncLocalStorage = exports.TimeoutFailure = exports.TerminatedFailure = exports.TemporalFailure = exports.ServerFailure = exports.rootCause = exports.defaultPayloadConverter = exports.ChildWorkflowFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ActivityFailure = exports.ActivityCancellationType = void 0;
var common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
Object.defineProperty(exports, "ActivityCancellationType", ({ enumerable: true, get: function () { return common_1.ActivityCancellationType; } }));
Object.defineProperty(exports, "ActivityFailure", ({ enumerable: true, get: function () { return common_1.ActivityFailure; } }));
Object.defineProperty(exports, "ApplicationFailure", ({ enumerable: true, get: function () { return common_1.ApplicationFailure; } }));
Object.defineProperty(exports, "CancelledFailure", ({ enumerable: true, get: function () { return common_1.CancelledFailure; } }));
Object.defineProperty(exports, "ChildWorkflowFailure", ({ enumerable: true, get: function () { return common_1.ChildWorkflowFailure; } }));
Object.defineProperty(exports, "defaultPayloadConverter", ({ enumerable: true, get: function () { return common_1.defaultPayloadConverter; } }));
Object.defineProperty(exports, "rootCause", ({ enumerable: true, get: function () { return common_1.rootCause; } }));
Object.defineProperty(exports, "ServerFailure", ({ enumerable: true, get: function () { return common_1.ServerFailure; } }));
Object.defineProperty(exports, "TemporalFailure", ({ enumerable: true, get: function () { return common_1.TemporalFailure; } }));
Object.defineProperty(exports, "TerminatedFailure", ({ enumerable: true, get: function () { return common_1.TerminatedFailure; } }));
Object.defineProperty(exports, "TimeoutFailure", ({ enumerable: true, get: function () { return common_1.TimeoutFailure; } }));
__exportStar(__webpack_require__(/*! @temporalio/common/lib/errors */ "./node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-handle */ "./node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-options */ "./node_modules/@temporalio/common/lib/workflow-options.js"), exports);
var cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
Object.defineProperty(exports, "AsyncLocalStorage", ({ enumerable: true, get: function () { return cancellation_scope_1.AsyncLocalStorage; } }));
Object.defineProperty(exports, "CancellationScope", ({ enumerable: true, get: function () { return cancellation_scope_1.CancellationScope; } }));
__exportStar(__webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./interceptors */ "./node_modules/@temporalio/workflow/lib/interceptors.js"), exports);
var interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
Object.defineProperty(exports, "ChildWorkflowCancellationType", ({ enumerable: true, get: function () { return interfaces_1.ChildWorkflowCancellationType; } }));
Object.defineProperty(exports, "ContinueAsNew", ({ enumerable: true, get: function () { return interfaces_1.ContinueAsNew; } }));
Object.defineProperty(exports, "ParentClosePolicy", ({ enumerable: true, get: function () { return interfaces_1.ParentClosePolicy; } }));
var trigger_1 = __webpack_require__(/*! ./trigger */ "./node_modules/@temporalio/workflow/lib/trigger.js");
Object.defineProperty(exports, "Trigger", ({ enumerable: true, get: function () { return trigger_1.Trigger; } }));
__exportStar(__webpack_require__(/*! ./workflow */ "./node_modules/@temporalio/workflow/lib/workflow.js"), exports);


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interceptors.js":
/*!***************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interceptors.js ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Type definitions and generic helpers for interceptors.
 *
 * The Workflow specific interceptors are defined here.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/interfaces.js":
/*!*************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/interfaces.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParentClosePolicy = exports.ChildWorkflowCancellationType = exports.ContinueAsNew = void 0;
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Not an actual error, used by the Workflow runtime to abort execution when {@link continueAsNew} is called
 */
class ContinueAsNew extends Error {
    constructor(command) {
        super('Workflow continued as new');
        this.command = command;
        this.name = 'ContinueAsNew';
    }
}
exports.ContinueAsNew = ContinueAsNew;
/**
 * Specifies:
 * - whether cancellation requests are sent to the Child
 * - whether and when a {@link CanceledFailure} is thrown from {@link executeChild} or
 *   {@link ChildWorkflowHandle.result}
 *
 * @default {@link ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED}
 */
var ChildWorkflowCancellationType;
(function (ChildWorkflowCancellationType) {
    /**
     * Don't send a cancellation request to the Child.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["ABANDON"] = 0] = "ABANDON";
    /**
     * Send a cancellation request to the Child. Immediately throw the error.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["TRY_CANCEL"] = 1] = "TRY_CANCEL";
    /**
     * Send a cancellation request to the Child. The Child may respect cancellation, in which case an error will be thrown
     * when cancellation has completed, and {@link isCancellation}(error) will be true. On the other hand, the Child may
     * ignore the cancellation request, in which case an error might be thrown with a different cause, or the Child may
     * complete successfully.
     *
     * @default
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_COMPLETED"] = 2] = "WAIT_CANCELLATION_COMPLETED";
    /**
     * Send a cancellation request to the Child. Throw the error once the Server receives the Child cancellation request.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_REQUESTED"] = 3] = "WAIT_CANCELLATION_REQUESTED";
})(ChildWorkflowCancellationType = exports.ChildWorkflowCancellationType || (exports.ChildWorkflowCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * How a Child Workflow reacts to the Parent Workflow reaching a Closed state.
 *
 * @see {@link https://docs.temporal.io/concepts/what-is-a-parent-close-policy/ | Parent Close Policy}
 */
var ParentClosePolicy;
(function (ParentClosePolicy) {
    /**
     * If a `ParentClosePolicy` is set to this, or is not set at all, the server default value will be used.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_UNSPECIFIED"] = 0] = "PARENT_CLOSE_POLICY_UNSPECIFIED";
    /**
     * When the Parent is Closed, the Child is Terminated.
     *
     * @default
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_TERMINATE"] = 1] = "PARENT_CLOSE_POLICY_TERMINATE";
    /**
     * When the Parent is Closed, nothing is done to the Child.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_ABANDON"] = 2] = "PARENT_CLOSE_POLICY_ABANDON";
    /**
     * When the Parent is Closed, the Child is Cancelled.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_REQUEST_CANCEL"] = 3] = "PARENT_CLOSE_POLICY_REQUEST_CANCEL";
})(ParentClosePolicy = exports.ParentClosePolicy || (exports.ParentClosePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/internals.js":
/*!************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/internals.js ***!
  \************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getActivator = exports.Activator = exports.LATEST_INTERNAL_PATCH_NUMBER = exports.LocalActivityDoBackoff = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "./node_modules/@temporalio/common/lib/type-helpers.js");
const alea_1 = __webpack_require__(/*! ./alea */ "./node_modules/@temporalio/workflow/lib/alea.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
const pkg_1 = __importDefault(__webpack_require__(/*! ./pkg */ "./node_modules/@temporalio/workflow/lib/pkg.js"));
var StartChildWorkflowExecutionFailedCause;
(function (StartChildWorkflowExecutionFailedCause) {
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED"] = 0] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED";
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS"] = 1] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS";
})(StartChildWorkflowExecutionFailedCause || (StartChildWorkflowExecutionFailedCause = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * A class that acts as a marker for this special result type
 */
class LocalActivityDoBackoff {
    constructor(backoff) {
        this.backoff = backoff;
        this.name = 'LocalActivityDoBackoff';
    }
}
exports.LocalActivityDoBackoff = LocalActivityDoBackoff;
/**
 * SDK Internal Patches are created by the SDK to avoid breaking history when behaviour
 * of existing API need to be modified. This is the patch number supported by the current
 * version of the SDK.
 *
 * History:
 * 1: Fix `condition(..., 0)` is not the same as `condition(..., undefined)`
 */
exports.LATEST_INTERNAL_PATCH_NUMBER = 1;
/**
 * Keeps all of the Workflow runtime state like pending completions for activities and timers.
 *
 * Implements handlers for all workflow activation jobs.
 */
class Activator {
    constructor({ info, now, showStackTraceSources, sourceMap, randomnessSeed, patches, }) {
        /**
         * Map of task sequence to a Completion
         */
        this.completions = {
            timer: new Map(),
            activity: new Map(),
            childWorkflowStart: new Map(),
            childWorkflowComplete: new Map(),
            signalWorkflow: new Map(),
            cancelWorkflow: new Map(),
        };
        /**
         * Holds buffered signal calls until a handler is registered
         */
        this.bufferedSignals = new Map();
        /**
         * Holds buffered query calls until a handler is registered.
         *
         * **IMPORTANT** queries are only buffered until workflow is started.
         * This is required because async interceptors might block workflow function invocation
         * which delays query handler registration.
         */
        this.bufferedQueries = Array();
        /**
         * Mapping of signal name to handler
         */
        this.signalHandlers = new Map();
        this.promiseStackStore = {
            promiseToStack: new Map(),
            childToParent: new Map(),
        };
        this.rootScope = new cancellation_scope_1.RootCancellationScope();
        /**
         * Mapping of query name to handler
         */
        this.queryHandlers = new Map([
            [
                '__stack_trace',
                () => {
                    return this.getStackTraces()
                        .map((s) => s.formatted)
                        .join('\n\n');
                },
            ],
            [
                '__enhanced_stack_trace',
                () => {
                    const { sourceMap } = this;
                    const sdk = { name: 'typescript', version: pkg_1.default.version };
                    const stacks = this.getStackTraces().map(({ structured: locations }) => ({ locations }));
                    const sources = {};
                    if (this.showStackTraceSources) {
                        for (const { locations } of stacks) {
                            for (const { filePath } of locations) {
                                if (!filePath)
                                    continue;
                                const content = sourceMap?.sourcesContent?.[sourceMap?.sources.indexOf(filePath)];
                                if (!content)
                                    continue;
                                sources[filePath] = [
                                    {
                                        content,
                                        lineOffset: 0,
                                    },
                                ];
                            }
                        }
                    }
                    return { sdk, stacks, sources };
                },
            ],
        ]);
        /**
         * Loaded in {@link initRuntime}
         */
        this.interceptors = { inbound: [], outbound: [], internals: [] };
        /**
         * Buffer that stores all generated commands, reset after each activation
         */
        this.commands = [];
        /**
         * Stores all {@link condition}s that haven't been unblocked yet
         */
        this.blockedConditions = new Map();
        /**
         * Is this Workflow completed?
         *
         * A Workflow will be considered completed if it generates a command that the
         * system considers as a final Workflow command (e.g.
         * completeWorkflowExecution or failWorkflowExecution).
         */
        this.completed = false;
        /**
         * Was this Workflow cancelled?
         */
        this.cancelled = false;
        /**
         * This is tracked to allow buffering queries until a workflow function is called.
         * TODO(bergundy): I don't think this makes sense since queries run last in an activation and must be responded to in
         * the same activation.
         */
        this.workflowFunctionWasCalled = false;
        /**
         * The next (incremental) sequence to assign when generating completable commands
         */
        this.nextSeqs = {
            timer: 1,
            activity: 1,
            childWorkflow: 1,
            signalWorkflow: 1,
            cancelWorkflow: 1,
            condition: 1,
            // Used internally to keep track of active stack traces
            stack: 1,
        };
        this.payloadConverter = common_1.defaultPayloadConverter;
        this.failureConverter = common_1.defaultFailureConverter;
        /**
         * Patches we know the status of for this workflow, as in {@link patched}
         */
        this.knownPresentPatches = new Set();
        /**
         * Patches we sent to core {@link patched}
         */
        this.sentPatches = new Set();
        /**
         * SDK Internal Patches are created by the SDK to avoid breaking history when behaviour
         * of existing API need to be modified.
         */
        this.internalPatchNumber = 0;
        this.sinkCalls = Array();
        this.info = info;
        this.now = now;
        this.showStackTraceSources = showStackTraceSources;
        this.sourceMap = sourceMap;
        this.random = (0, alea_1.alea)(randomnessSeed);
        if (info.unsafe.isReplaying) {
            for (const patch of patches) {
                this.knownPresentPatches.add(patch);
            }
        }
    }
    getStackTraces() {
        const { childToParent, promiseToStack } = this.promiseStackStore;
        const internalNodes = [...childToParent.values()].reduce((acc, curr) => {
            for (const p of curr) {
                acc.add(p);
            }
            return acc;
        }, new Set());
        const stacks = new Map();
        for (const child of childToParent.keys()) {
            if (!internalNodes.has(child)) {
                const stack = promiseToStack.get(child);
                if (!stack || !stack.formatted)
                    continue;
                stacks.set(stack.formatted, stack);
            }
        }
        // Not 100% sure where this comes from, just filter it out
        stacks.delete('    at Promise.then (<anonymous>)');
        stacks.delete('    at Promise.then (<anonymous>)\n');
        return [...stacks].map(([_, stack]) => stack);
    }
    getAndResetSinkCalls() {
        const { sinkCalls } = this;
        this.sinkCalls = [];
        return sinkCalls;
    }
    /**
     * Buffer a Workflow command to be collected at the end of the current activation.
     *
     * Prevents commands from being added after Workflow completion.
     */
    pushCommand(cmd, complete = false) {
        // Only query responses may be sent after completion
        if (this.completed && !cmd.respondToQuery)
            return;
        this.commands.push(cmd);
        if (complete) {
            this.completed = true;
        }
    }
    getAndResetCommands() {
        const commands = this.commands;
        this.commands = [];
        return commands;
    }
    async startWorkflowNextHandler({ args }) {
        const { workflow } = this;
        if (workflow === undefined) {
            throw new common_1.IllegalStateError('Workflow uninitialized');
        }
        let promise;
        try {
            promise = workflow(...args);
        }
        finally {
            // Guarantee this runs even if there was an exception when invoking the Workflow function
            // Otherwise this Workflow will now be queryable.
            this.workflowFunctionWasCalled = true;
            // Empty the buffer
            const buffer = this.bufferedQueries.splice(0);
            for (const activation of buffer) {
                this.queryWorkflow(activation);
            }
        }
        return await promise;
    }
    startWorkflow(activation) {
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'execute', this.startWorkflowNextHandler.bind(this));
        (0, stack_helpers_1.untrackPromise)(execute({
            headers: activation.headers ?? {},
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
        }).then(this.completeWorkflow.bind(this), this.handleWorkflowFailure.bind(this)));
    }
    cancelWorkflow(_activation) {
        this.cancelled = true;
        this.rootScope.cancel();
    }
    fireTimer(activation) {
        // Timers are a special case where their completion might not be in Workflow state,
        // this is due to immediate timer cancellation that doesn't go wait for Core.
        const completion = this.maybeConsumeCompletion('timer', getSeq(activation));
        completion?.resolve(undefined);
    }
    resolveActivity(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveActivity activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('activity', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.backoff) {
            reject(new LocalActivityDoBackoff(activation.result.backoff));
        }
    }
    resolveChildWorkflowExecutionStart(activation) {
        const { resolve, reject } = this.consumeCompletion('childWorkflowStart', getSeq(activation));
        if (activation.succeeded) {
            resolve(activation.succeeded.runId);
        }
        else if (activation.failed) {
            if (activation.failed.cause !==
                StartChildWorkflowExecutionFailedCause.START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS) {
                throw new common_1.IllegalStateError('Got unknown StartChildWorkflowExecutionFailedCause');
            }
            if (!(activation.seq && activation.failed.workflowId && activation.failed.workflowType)) {
                throw new TypeError('Missing attributes in activation job');
            }
            reject(new common_1.WorkflowExecutionAlreadyStartedError('Workflow execution already started', activation.failed.workflowId, activation.failed.workflowType));
        }
        else if (activation.cancelled) {
            if (!activation.cancelled.failure) {
                throw new TypeError('Got no failure in cancelled variant');
            }
            reject(this.failureToError(activation.cancelled.failure));
        }
        else {
            throw new TypeError('Got ResolveChildWorkflowExecutionStart with no status');
        }
    }
    resolveChildWorkflowExecution(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveChildWorkflowExecution activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('childWorkflowComplete', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got failed result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got cancelled result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
    }
    // Intentionally not made function async so this handler doesn't show up in the stack trace
    queryWorkflowNextHandler({ queryName, args }) {
        const fn = this.queryHandlers.get(queryName);
        if (fn === undefined) {
            const knownQueryTypes = [...this.queryHandlers.keys()].join(' ');
            // Fail the query
            return Promise.reject(new ReferenceError(`Workflow did not register a handler for ${queryName}. Registered queries: [${knownQueryTypes}]`));
        }
        try {
            const ret = fn(...args);
            if (ret instanceof Promise) {
                return Promise.reject(new errors_1.DeterminismViolationError('Query handlers should not return a Promise'));
            }
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    queryWorkflow(activation) {
        if (!this.workflowFunctionWasCalled) {
            this.bufferedQueries.push(activation);
            return;
        }
        const { queryType, queryId, headers } = activation;
        if (!(queryType && queryId)) {
            throw new TypeError('Missing query activation attributes');
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleQuery', this.queryWorkflowNextHandler.bind(this));
        execute({
            queryName: queryType,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
            queryId,
            headers: headers ?? {},
        }).then((result) => this.completeQuery(queryId, result), (reason) => this.failQuery(queryId, reason));
    }
    async signalWorkflowNextHandler({ signalName, args }) {
        const fn = this.signalHandlers.get(signalName);
        if (fn === undefined) {
            throw new common_1.IllegalStateError(`No registered signal handler for signal ${signalName}`);
        }
        return await fn(...args);
    }
    signalWorkflow(activation) {
        const { signalName, headers } = activation;
        if (!signalName) {
            throw new TypeError('Missing activation signalName');
        }
        const fn = this.signalHandlers.get(signalName);
        if (fn === undefined) {
            let buffer = this.bufferedSignals.get(signalName);
            if (buffer === undefined) {
                buffer = [];
                this.bufferedSignals.set(signalName, buffer);
            }
            buffer.push(activation);
            return;
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleSignal', this.signalWorkflowNextHandler.bind(this));
        execute({
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            signalName,
            headers: headers ?? {},
        }).catch(this.handleWorkflowFailure.bind(this));
    }
    resolveSignalExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('signalWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    resolveRequestCancelExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('cancelWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    updateRandomSeed(activation) {
        if (!activation.randomnessSeed) {
            throw new TypeError('Expected activation with randomnessSeed attribute');
        }
        this.random = (0, alea_1.alea)(activation.randomnessSeed.toBytes());
    }
    notifyHasPatch(activation) {
        if (!activation.patchId) {
            throw new TypeError('Notify has patch missing patch name');
        }
        if (activation.patchId.startsWith('__sdk_internal_patch_number:')) {
            const internalPatchNumber = parseInt(activation.patchId.substring('__sdk_internal_patch_number:'.length));
            if (internalPatchNumber > exports.LATEST_INTERNAL_PATCH_NUMBER)
                throw new common_1.IllegalStateError(`Unsupported internal patch number: ${internalPatchNumber} > ${exports.LATEST_INTERNAL_PATCH_NUMBER}`);
            if (this.internalPatchNumber < internalPatchNumber)
                this.internalPatchNumber = internalPatchNumber;
        }
        else {
            this.knownPresentPatches.add(activation.patchId);
        }
    }
    checkInternalPatchAtLeast(minimumPatchNumber) {
        if (this.internalPatchNumber >= minimumPatchNumber)
            return true;
        if (!this.info.unsafe.isReplaying) {
            this.internalPatchNumber = minimumPatchNumber;
            this.pushCommand({
                setPatchMarker: { patchId: `__sdk_internal_patch_number:${exports.LATEST_INTERNAL_PATCH_NUMBER}`, deprecated: false },
            });
            return true;
        }
        return false;
    }
    removeFromCache() {
        throw new common_1.IllegalStateError('removeFromCache activation job should not reach workflow');
    }
    /**
     * Transforms failures into a command to be sent to the server.
     * Used to handle any failure emitted by the Workflow.
     */
    async handleWorkflowFailure(error) {
        if (this.cancelled && (0, errors_1.isCancellation)(error)) {
            this.pushCommand({ cancelWorkflowExecution: {} }, true);
        }
        else if (error instanceof interfaces_1.ContinueAsNew) {
            this.pushCommand({ continueAsNewWorkflowExecution: error.command }, true);
        }
        else {
            if (!(error instanceof common_1.TemporalFailure)) {
                // This results in an unhandled rejection which will fail the activation
                // preventing it from completing.
                throw error;
            }
            this.pushCommand({
                failWorkflowExecution: {
                    failure: this.errorToFailure(error),
                },
            }, true);
        }
    }
    completeQuery(queryId, result) {
        this.pushCommand({
            respondToQuery: { queryId, succeeded: { response: this.payloadConverter.toPayload(result) } },
        });
    }
    failQuery(queryId, error) {
        this.pushCommand({
            respondToQuery: {
                queryId,
                failed: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    /** Consume a completion if it exists in Workflow state */
    maybeConsumeCompletion(type, taskSeq) {
        const completion = this.completions[type].get(taskSeq);
        if (completion !== undefined) {
            this.completions[type].delete(taskSeq);
        }
        return completion;
    }
    /** Consume a completion if it exists in Workflow state, throws if it doesn't */
    consumeCompletion(type, taskSeq) {
        const completion = this.maybeConsumeCompletion(type, taskSeq);
        if (completion === undefined) {
            throw new common_1.IllegalStateError(`No completion for taskSeq ${taskSeq}`);
        }
        return completion;
    }
    completeWorkflow(result) {
        this.pushCommand({
            completeWorkflowExecution: {
                result: this.payloadConverter.toPayload(result),
            },
        }, true);
    }
    errorToFailure(err) {
        return this.failureConverter.errorToFailure(err, this.payloadConverter);
    }
    failureToError(failure) {
        return this.failureConverter.failureToError(failure, this.payloadConverter);
    }
}
exports.Activator = Activator;
function getActivator() {
    const activator = globalThis.__TEMPORAL__?.activator;
    if (activator === undefined) {
        throw new common_1.IllegalStateError('Workflow uninitialized');
    }
    return activator;
}
exports.getActivator = getActivator;
function getSeq(activation) {
    const seq = activation.seq;
    if (seq === undefined || seq === null) {
        throw new TypeError(`Got activation with no seq attribute`);
    }
    return seq;
}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/pkg.js":
/*!******************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/pkg.js ***!
  \******************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// ../package.json is outside of the TS project rootDir which causes TS to complain about this import.
// We do not want to change the rootDir because it messes up the output structure.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = __importDefault(__webpack_require__(/*! ../package.json */ "./node_modules/@temporalio/workflow/package.json"));
exports["default"] = package_json_1.default;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/stack-helpers.js":
/*!****************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/stack-helpers.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.untrackPromise = void 0;
/**
 * Helper function to remove a promise from being tracked for stack trace query purposes
 */
function untrackPromise(promise) {
    const store = globalThis.__TEMPORAL__?.activator?.promiseStackStore;
    if (!store)
        return;
    store.childToParent.delete(promise);
    store.promiseToStack.delete(promise);
}
exports.untrackPromise = untrackPromise;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/trigger.js":
/*!**********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/trigger.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = void 0;
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
/**
 * A `PromiseLike` helper which exposes its `resolve` and `reject` methods.
 *
 * Trigger is CancellationScope-aware: it is linked to the current scope on
 * construction and throws when that scope is cancelled.
 *
 * Useful for e.g. waiting for unblocking a Workflow from a Signal.
 *
 * @example
 * <!--SNIPSTART typescript-trigger-workflow-->
 * <!--SNIPEND-->
 */
class Trigger {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            const scope = cancellation_scope_1.CancellationScope.current();
            if (scope.consideredCancelled || scope.cancellable) {
                (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.resolve = resolve;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = reject;
        });
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.promise.catch(() => undefined));
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
}
exports.Trigger = Trigger;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/worker-interface.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/worker-interface.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dispose = exports.showUnblockConditions = exports.tryUnblockConditions = exports.getAndResetSinkCalls = exports.concludeActivation = exports.activate = exports.initRuntime = exports.overrideGlobals = void 0;
/**
 * Exported functions for the Worker to interact with the Workflow isolate
 *
 * @module
 */
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "./node_modules/@temporalio/workflow/lib/errors.js");
const internals_1 = __webpack_require__(/*! ./internals */ "./node_modules/@temporalio/workflow/lib/internals.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
function overrideGlobals() {
    // Mock any weak reference because GC is non-deterministic and the effect is observable from the Workflow.
    // WeakRef is implemented in V8 8.4 which is embedded in node >=14.6.0.
    // Workflow developer will get a meaningful exception if they try to use these.
    global.WeakRef = function () {
        throw new errors_1.DeterminismViolationError('WeakRef cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.FinalizationRegistry = function () {
        throw new errors_1.DeterminismViolationError('FinalizationRegistry cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.Date = function (...args) {
        if (args.length > 0) {
            return new OriginalDate(...args);
        }
        return new OriginalDate((0, internals_1.getActivator)().now);
    };
    global.Date.now = function () {
        return (0, internals_1.getActivator)().now;
    };
    global.Date.parse = OriginalDate.parse.bind(OriginalDate);
    global.Date.UTC = OriginalDate.UTC.bind(OriginalDate);
    global.Date.prototype = OriginalDate.prototype;
    /**
     * @param ms sleep duration -  number of milliseconds. If given a negative number, value will be set to 1.
     */
    global.setTimeout = function (cb, ms, ...args) {
        const activator = (0, internals_1.getActivator)();
        ms = Math.max(1, ms);
        const seq = activator.nextSeqs.timer++;
        // Create a Promise for AsyncLocalStorage to be able to track this completion using promise hooks.
        new Promise((resolve, reject) => {
            activator.completions.timer.set(seq, { resolve, reject });
            activator.pushCommand({
                startTimer: {
                    seq,
                    startToFireTimeout: (0, time_1.msToTs)(ms),
                },
            });
        }).then(() => cb(...args), () => undefined /* ignore cancellation */);
        return seq;
    };
    global.clearTimeout = function (handle) {
        const activator = (0, internals_1.getActivator)();
        activator.nextSeqs.timer++;
        activator.completions.timer.delete(handle);
        activator.pushCommand({
            cancelTimer: {
                seq: handle,
            },
        });
    };
    // activator.random is mutable, don't hardcode its reference
    Math.random = () => (0, internals_1.getActivator)().random();
}
exports.overrideGlobals = overrideGlobals;
/**
 * Initialize the isolate runtime.
 *
 * Sets required internal state and instantiates the workflow and interceptors.
 */
function initRuntime(options) {
    const { info } = options;
    info.unsafe.now = OriginalDate.now;
    const activator = new internals_1.Activator(options);
    // There's on activator per workflow instance, set it globally on the context.
    // We do this before importing any user code so user code can statically reference @temporalio/workflow functions
    // as well as Date and Math.random.
    global.__TEMPORAL__.activator = activator;
    // webpack alias to payloadConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customPayloadConverter = (__webpack_require__(/*! __temporal_custom_payload_converter */ "?2065").payloadConverter);
    // The `payloadConverter` export is validated in the Worker
    if (customPayloadConverter != null) {
        activator.payloadConverter = customPayloadConverter;
    }
    // webpack alias to failureConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customFailureConverter = (__webpack_require__(/*! __temporal_custom_failure_converter */ "?31ff").failureConverter);
    // The `failureConverter` export is validated in the Worker
    if (customFailureConverter != null) {
        activator.failureConverter = customFailureConverter;
    }
    const { importWorkflows, importInterceptors } = global.__TEMPORAL__;
    if (importWorkflows === undefined || importInterceptors === undefined) {
        throw new common_1.IllegalStateError('Workflow bundle did not register import hooks');
    }
    const interceptors = importInterceptors();
    for (const mod of interceptors) {
        const factory = mod.interceptors;
        if (factory !== undefined) {
            if (typeof factory !== 'function') {
                throw new TypeError(`interceptors must be a function, got: ${factory}`);
            }
            const interceptors = factory();
            activator.interceptors.inbound.push(...(interceptors.inbound ?? []));
            activator.interceptors.outbound.push(...(interceptors.outbound ?? []));
            activator.interceptors.internals.push(...(interceptors.internals ?? []));
        }
    }
    const mod = importWorkflows();
    const workflow = mod[info.workflowType];
    if (typeof workflow !== 'function') {
        throw new TypeError(`'${info.workflowType}' is not a function`);
    }
    activator.workflow = workflow;
}
exports.initRuntime = initRuntime;
/**
 * Run a chunk of activation jobs
 * @returns a boolean indicating whether job was processed or ignored
 */
function activate(activation, batchIndex) {
    const activator = (0, internals_1.getActivator)();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'activate', ({ activation, batchIndex }) => {
        if (batchIndex === 0) {
            if (!activation.jobs) {
                throw new TypeError('Got activation with no jobs');
            }
            if (activation.timestamp != null) {
                // timestamp will not be updated for activation that contain only queries
                activator.now = (0, time_1.tsToMs)(activation.timestamp);
            }
            if (activation.historyLength == null) {
                throw new TypeError('Got activation with no historyLength');
            }
            activator.info.unsafe.isReplaying = activation.isReplaying ?? false;
            activator.info.historyLength = activation.historyLength;
        }
        // Cast from the interface to the class which has the `variant` attribute.
        // This is safe because we know that activation is a proto class.
        const jobs = activation.jobs;
        for (const job of jobs) {
            if (job.variant === undefined) {
                throw new TypeError('Expected job.variant to be defined');
            }
            const variant = job[job.variant];
            if (!variant) {
                throw new TypeError(`Expected job.${job.variant} to be set`);
            }
            // The only job that can be executed on a completed workflow is a query.
            // We might get other jobs after completion for instance when a single
            // activation contains multiple jobs and the first one completes the workflow.
            if (activator.completed && job.variant !== 'queryWorkflow') {
                return;
            }
            activator[job.variant](variant /* TS can't infer this type */);
            if (showUnblockConditions(job)) {
                tryUnblockConditions();
            }
        }
    });
    intercept({
        activation,
        batchIndex,
    });
}
exports.activate = activate;
/**
 * Conclude a single activation.
 * Should be called after processing all activation jobs and queued microtasks.
 *
 * Activation failures are handled in the main Node.js isolate.
 */
function concludeActivation() {
    const activator = (0, internals_1.getActivator)();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'concludeActivation', (input) => input);
    const { info } = activator;
    const { commands } = intercept({ commands: activator.getAndResetCommands() });
    return {
        runId: info.runId,
        successful: { commands },
    };
}
exports.concludeActivation = concludeActivation;
function getAndResetSinkCalls() {
    return (0, internals_1.getActivator)().getAndResetSinkCalls();
}
exports.getAndResetSinkCalls = getAndResetSinkCalls;
/**
 * Loop through all blocked conditions, evaluate and unblock if possible.
 *
 * @returns number of unblocked conditions.
 */
function tryUnblockConditions() {
    let numUnblocked = 0;
    for (;;) {
        const prevUnblocked = numUnblocked;
        for (const [seq, cond] of (0, internals_1.getActivator)().blockedConditions.entries()) {
            if (cond.fn()) {
                cond.resolve();
                numUnblocked++;
                // It is safe to delete elements during map iteration
                (0, internals_1.getActivator)().blockedConditions.delete(seq);
            }
        }
        if (prevUnblocked === numUnblocked) {
            break;
        }
    }
    return numUnblocked;
}
exports.tryUnblockConditions = tryUnblockConditions;
/**
 * Predicate used to prevent triggering conditions for non-query and non-patch jobs.
 */
function showUnblockConditions(job) {
    return !job.queryWorkflow && !job.notifyHasPatch;
}
exports.showUnblockConditions = showUnblockConditions;
function dispose() {
    const dispose = (0, interceptors_1.composeInterceptors)((0, internals_1.getActivator)().interceptors.internals, 'dispose', async () => {
        cancellation_scope_1.storage.disable();
    });
    dispose({});
}
exports.dispose = dispose;


/***/ }),

/***/ "./node_modules/@temporalio/workflow/lib/workflow.js":
/*!***********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/lib/workflow.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.enhancedStackTraceQuery = exports.stackTraceQuery = exports.upsertSearchAttributes = exports.setHandler = exports.defineQuery = exports.defineSignal = exports.condition = exports.deprecatePatch = exports.patched = exports.uuid4 = exports.continueAsNew = exports.makeContinueAsNewFunc = exports.proxySinks = exports.inWorkflowContext = exports.workflowInfo = exports.executeChild = exports.startChild = exports.getExternalWorkflowHandle = exports.proxyLocalActivities = exports.proxyActivities = exports.NotAnActivityMethod = exports.scheduleLocalActivity = exports.scheduleActivity = exports.sleep = exports.addDefaultWorkflowOptions = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "./node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "./node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "./node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "./node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "./node_modules/@temporalio/workflow/lib/interfaces.js");
const internals_1 = __webpack_require__(/*! ./internals */ "./node_modules/@temporalio/workflow/lib/internals.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "./node_modules/@temporalio/workflow/lib/stack-helpers.js");
// Avoid a circular dependency
(0, cancellation_scope_1.registerSleepImplementation)(sleep);
/**
 * Adds default values to `workflowId` and `workflowIdReusePolicy` to given workflow options.
 */
function addDefaultWorkflowOptions(opts) {
    const { args, workflowId, ...rest } = opts;
    return {
        workflowId: workflowId ?? uuid4(),
        args: args ?? [],
        cancellationType: interfaces_1.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
        ...rest,
    };
}
exports.addDefaultWorkflowOptions = addDefaultWorkflowOptions;
/**
 * Push a startTimer command into state accumulator and register completion
 */
function timerNextHandler(input) {
    const activator = (0, internals_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                if (!activator.completions.timer.delete(input.seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    cancelTimer: {
                        seq: input.seq,
                    },
                });
                reject(err);
            }));
        }
        activator.pushCommand({
            startTimer: {
                seq: input.seq,
                startToFireTimeout: (0, time_1.msToTs)(input.durationMs),
            },
        });
        activator.completions.timer.set(input.seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Asynchronous sleep.
 *
 * Schedules a timer on the Temporal service.
 *
 * @param ms sleep duration - number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}.
 * If given a negative number or 0, value will be set to 1.
 */
function sleep(ms) {
    const activator = (0, internals_1.getActivator)();
    const seq = activator.nextSeqs.timer++;
    const durationMs = Math.max(1, (0, time_1.msToNumber)(ms));
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startTimer', timerNextHandler);
    return execute({
        durationMs,
        seq,
    });
}
exports.sleep = sleep;
function validateActivityOptions(options) {
    if (options.scheduleToCloseTimeout === undefined && options.startToCloseTimeout === undefined) {
        throw new TypeError('Required either scheduleToCloseTimeout or startToCloseTimeout');
    }
}
// Use same validation we use for normal activities
const validateLocalActivityOptions = validateActivityOptions;
/**
 * Hooks up activity promise to current cancellation scope and completion callbacks.
 *
 * Returns `false` if the current scope is already cancelled.
 */
/**
 * Push a scheduleActivity command into activator accumulator and register completion
 */
function scheduleActivityNextHandler({ options, args, headers, seq, activityType }) {
    const activator = (0, internals_1.getActivator)();
    validateActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleActivity: {
                seq,
                activityId: options.activityId ?? `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info?.taskQueue,
                heartbeatTimeout: (0, time_1.msOptionalToTs)(options.heartbeatTimeout),
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                headers,
                cancellationType: options.cancellationType,
                doNotEagerlyExecute: !(options.allowEagerDispatch ?? true),
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Push a scheduleActivity command into state accumulator and register completion
 */
async function scheduleLocalActivityNextHandler({ options, args, headers, seq, activityType, attempt, originalScheduleTime, }) {
    const activator = (0, internals_1.getActivator)();
    validateLocalActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelLocalActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleLocalActivity: {
                seq,
                attempt,
                originalScheduleTime,
                // Intentionally not exposing activityId as an option
                activityId: `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                localRetryThreshold: (0, time_1.msOptionalToTs)(options.localRetryThreshold),
                headers,
                cancellationType: options.cancellationType,
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
function scheduleActivity(activityType, args, options) {
    const activator = (0, internals_1.getActivator)();
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    const seq = activator.nextSeqs.activity++;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleActivity', scheduleActivityNextHandler);
    return execute({
        activityType,
        headers: {},
        options,
        args,
        seq,
    });
}
exports.scheduleActivity = scheduleActivity;
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
async function scheduleLocalActivity(activityType, args, options) {
    const activator = (0, internals_1.getActivator)();
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    let attempt = 1;
    let originalScheduleTime = undefined;
    for (;;) {
        const seq = activator.nextSeqs.activity++;
        const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleLocalActivity', scheduleLocalActivityNextHandler);
        try {
            return (await execute({
                activityType,
                headers: {},
                options,
                args,
                seq,
                attempt,
                originalScheduleTime,
            }));
        }
        catch (err) {
            if (err instanceof internals_1.LocalActivityDoBackoff) {
                await sleep((0, time_1.tsToMs)(err.backoff.backoffDuration));
                if (typeof err.backoff.attempt !== 'number') {
                    throw new TypeError('Invalid backoff attempt type');
                }
                attempt = err.backoff.attempt;
                originalScheduleTime = err.backoff.originalScheduleTime ?? undefined;
            }
            else {
                throw err;
            }
        }
    }
}
exports.scheduleLocalActivity = scheduleLocalActivity;
function startChildWorkflowExecutionNextHandler({ options, headers, workflowType, seq, }) {
    const activator = (0, internals_1.getActivator)();
    const workflowId = options.workflowId ?? uuid4();
    const startPromise = new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                const complete = !activator.completions.childWorkflowComplete.has(seq);
                if (!complete) {
                    activator.pushCommand({
                        cancelChildWorkflowExecution: { childWorkflowSeq: seq },
                    });
                }
                // Nothing to cancel otherwise
            }));
        }
        activator.pushCommand({
            startChildWorkflowExecution: {
                seq,
                workflowId,
                workflowType,
                input: (0, common_1.toPayloads)(activator.payloadConverter, ...options.args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info?.taskQueue,
                workflowExecutionTimeout: (0, time_1.msOptionalToTs)(options.workflowExecutionTimeout),
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                namespace: workflowInfo().namespace,
                headers,
                cancellationType: options.cancellationType,
                workflowIdReusePolicy: options.workflowIdReusePolicy,
                parentClosePolicy: options.parentClosePolicy,
                cronSchedule: options.cronSchedule,
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
            },
        });
        activator.completions.childWorkflowStart.set(seq, {
            resolve,
            reject,
        });
    });
    // We construct a Promise for the completion of the child Workflow before we know
    // if the Workflow code will await it to capture the result in case it does.
    const completePromise = new Promise((resolve, reject) => {
        // Chain start Promise rejection to the complete Promise.
        (0, stack_helpers_1.untrackPromise)(startPromise.catch(reject));
        activator.completions.childWorkflowComplete.set(seq, {
            resolve,
            reject,
        });
    });
    (0, stack_helpers_1.untrackPromise)(startPromise);
    (0, stack_helpers_1.untrackPromise)(completePromise);
    // Prevent unhandled rejection because the completion might not be awaited
    (0, stack_helpers_1.untrackPromise)(completePromise.catch(() => undefined));
    const ret = new Promise((resolve) => resolve([startPromise, completePromise]));
    (0, stack_helpers_1.untrackPromise)(ret);
    return ret;
}
function signalWorkflowNextHandler({ seq, signalName, args, target, headers }) {
    const activator = (0, internals_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.signalWorkflow.has(seq)) {
                    return;
                }
                activator.pushCommand({ cancelSignalWorkflow: { seq } });
            }));
        }
        activator.pushCommand({
            signalExternalWorkflowExecution: {
                seq,
                args: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                signalName,
                ...(target.type === 'external'
                    ? {
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            ...target.workflowExecution,
                        },
                    }
                    : {
                        childWorkflowId: target.childWorkflowId,
                    }),
            },
        });
        activator.completions.signalWorkflow.set(seq, { resolve, reject });
    });
}
/**
 * Symbol used in the return type of proxy methods to mark that an attribute on the source type is not a method.
 *
 * @see {@link ActivityInterfaceFor}
 * @see {@link proxyActivities}
 * @see {@link proxyLocalActivities}
 */
exports.NotAnActivityMethod = Symbol.for('__TEMPORAL_NOT_AN_ACTIVITY_METHOD');
/**
 * Configure Activity functions with given {@link ActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy} for
 *         which each attribute is a callable Activity function
 *
 * @example
 * ```ts
 * import { proxyActivities } from '@temporalio/workflow';
 * import * as activities from '../activities';
 *
 * // Setup Activities from module exports
 * const { httpGet, otherActivity } = proxyActivities<typeof activities>({
 *   startToCloseTimeout: '30 minutes',
 * });
 *
 * // Setup Activities from an explicit interface (e.g. when defined by another SDK)
 * interface JavaActivities {
 *   httpGetFromJava(url: string): Promise<string>
 *   someOtherJavaActivity(arg1: number, arg2: string): Promise<string>;
 * }
 *
 * const {
 *   httpGetFromJava,
 *   someOtherJavaActivity
 * } = proxyActivities<JavaActivities>({
 *   taskQueue: 'java-worker-taskQueue',
 *   startToCloseTimeout: '5m',
 * });
 *
 * export function execute(): Promise<void> {
 *   const response = await httpGet('http://example.com');
 *   // ...
 * }
 * ```
 */
function proxyActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function activityProxyFunction(...args) {
                return scheduleActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyActivities = proxyActivities;
/**
 * Configure Local Activity functions with given {@link LocalActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy}
 *         for which each attribute is a callable Activity function
 *
 * @experimental
 *
 * @see {@link proxyActivities} for examples
 */
function proxyLocalActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateLocalActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function localActivityProxyFunction(...args) {
                return scheduleLocalActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyLocalActivities = proxyLocalActivities;
// TODO: deprecate this patch after "enough" time has passed
const EXTERNAL_WF_CANCEL_PATCH = '__temporal_internal_connect_external_handle_cancel_to_scope';
/**
 * Returns a client-side handle that can be used to signal and cancel an existing Workflow execution.
 * It takes a Workflow ID and optional run ID.
 */
function getExternalWorkflowHandle(workflowId, runId) {
    const activator = (0, internals_1.getActivator)();
    return {
        workflowId,
        runId,
        cancel() {
            return new Promise((resolve, reject) => {
                // Connect this cancel operation to the current cancellation scope.
                // This is behavior was introduced after v0.22.0 and is incompatible
                // with histories generated with previous SDK versions and thus requires
                // patching.
                //
                // We try to delay patching as much as possible to avoid polluting
                // histories unless strictly required.
                const scope = cancellation_scope_1.CancellationScope.current();
                if (scope.cancellable) {
                    (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                        if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                            reject(err);
                        }
                    }));
                }
                if (scope.consideredCancelled) {
                    if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                        return;
                    }
                }
                const seq = activator.nextSeqs.cancelWorkflow++;
                activator.pushCommand({
                    requestCancelExternalWorkflowExecution: {
                        seq,
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            workflowId,
                            runId,
                        },
                    },
                });
                activator.completions.cancelWorkflow.set(seq, { resolve, reject });
            });
        },
        signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'external',
                    workflowExecution: { workflowId, runId },
                },
                headers: {},
            });
        },
    };
}
exports.getExternalWorkflowHandle = getExternalWorkflowHandle;
async function startChild(workflowTypeOrFunc, options) {
    const activator = (0, internals_1.getActivator)();
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = typeof workflowTypeOrFunc === 'string' ? workflowTypeOrFunc : workflowTypeOrFunc.name;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const [started, completed] = await execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    const firstExecutionRunId = await started;
    return {
        workflowId: optionsWithDefaults.workflowId,
        firstExecutionRunId,
        async result() {
            return (await completed);
        },
        async signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'child',
                    childWorkflowId: optionsWithDefaults.workflowId,
                },
                headers: {},
            });
        },
    };
}
exports.startChild = startChild;
async function executeChild(workflowTypeOrFunc, options) {
    const activator = (0, internals_1.getActivator)();
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = typeof workflowTypeOrFunc === 'string' ? workflowTypeOrFunc : workflowTypeOrFunc.name;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const execPromise = execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    (0, stack_helpers_1.untrackPromise)(execPromise);
    const completedPromise = execPromise.then(([_started, completed]) => completed);
    (0, stack_helpers_1.untrackPromise)(completedPromise);
    return completedPromise;
}
exports.executeChild = executeChild;
/**
 * Get information about the current Workflow.
 *
 * ⚠️ We recommend calling `workflowInfo()` whenever accessing {@link WorkflowInfo} fields. Some WorkflowInfo fields
 * change during the lifetime of an Execution—like {@link WorkflowInfo.historyLength} and
 * {@link WorkflowInfo.searchAttributes}—and some may be changeable in the future—like {@link WorkflowInfo.taskQueue}.
 *
 * ```ts
 * // GOOD
 * function myWorkflow() {
 *   doSomething(workflowInfo().searchAttributes)
 *   ...
 *   doSomethingElse(workflowInfo().searchAttributes)
 * }
 * ```
 *
 * ```ts
 * // BAD
 * function myWorkflow() {
 *   const attributes = workflowInfo().searchAttributes
 *   doSomething(attributes)
 *   ...
 *   doSomethingElse(attributes)
 * }
 */
function workflowInfo() {
    return (0, internals_1.getActivator)().info;
}
exports.workflowInfo = workflowInfo;
/**
 * Returns whether or not code is executing in workflow context
 */
function inWorkflowContext() {
    try {
        (0, internals_1.getActivator)();
        return true;
    }
    catch (err) {
        // Use string comparison in case multiple versions of @temporalio/common are
        // installed in which case an instanceof check would fail.
        if (err.name === 'IllegalStateError') {
            return false;
        }
        else {
            throw err;
        }
    }
}
exports.inWorkflowContext = inWorkflowContext;
/**
 * Get a reference to Sinks for exporting data out of the Workflow.
 *
 * These Sinks **must** be registered with the Worker in order for this
 * mechanism to work.
 *
 * @example
 * ```ts
 * import { proxySinks, Sinks } from '@temporalio/workflow';
 *
 * interface MySinks extends Sinks {
 *   logger: {
 *     info(message: string): void;
 *     error(message: string): void;
 *   };
 * }
 *
 * const { logger } = proxySinks<MyDependencies>();
 * logger.info('setting up');
 *
 * export function myWorkflow() {
 *   return {
 *     async execute() {
 *       logger.info('hey ho');
 *       logger.error('lets go');
 *     }
 *   };
 * }
 * ```
 */
function proxySinks() {
    return new Proxy({}, {
        get(_, ifaceName) {
            return new Proxy({}, {
                get(_, fnName) {
                    return (...args) => {
                        const activator = (0, internals_1.getActivator)();
                        activator.sinkCalls.push({
                            ifaceName: ifaceName,
                            fnName: fnName,
                            args,
                        });
                    };
                },
            });
        },
    });
}
exports.proxySinks = proxySinks;
/**
 * Returns a function `f` that will cause the current Workflow to ContinueAsNew when called.
 *
 * `f` takes the same arguments as the Workflow function supplied to typeparam `F`.
 *
 * Once `f` is called, Workflow Execution immediately completes.
 */
function makeContinueAsNewFunc(options) {
    const activator = (0, internals_1.getActivator)();
    const info = workflowInfo();
    const { workflowType, taskQueue, ...rest } = options ?? {};
    const requiredOptions = {
        workflowType: workflowType ?? info.workflowType,
        taskQueue: taskQueue ?? info.taskQueue,
        ...rest,
    };
    return (...args) => {
        const fn = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'continueAsNew', async (input) => {
            const { headers, args, options } = input;
            throw new interfaces_1.ContinueAsNew({
                workflowType: options.workflowType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                taskQueue: options.taskQueue,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
            });
        });
        return fn({
            args,
            headers: {},
            options: requiredOptions,
        });
    };
}
exports.makeContinueAsNewFunc = makeContinueAsNewFunc;
/**
 * {@link https://docs.temporal.io/concepts/what-is-continue-as-new/ | Continues-As-New} the current Workflow Execution
 * with default options.
 *
 * Shorthand for `makeContinueAsNewFunc<F>()(...args)`. (See: {@link makeContinueAsNewFunc}.)
 *
 * @example
 *
 *```ts
 *import { continueAsNew } from '@temporalio/workflow';
 *
 *export async function myWorkflow(n: number): Promise<void> {
 *  // ... Workflow logic
 *  await continueAsNew<typeof myWorkflow>(n + 1);
 *}
 *```
 */
function continueAsNew(...args) {
    return makeContinueAsNewFunc()(...args);
}
exports.continueAsNew = continueAsNew;
/**
 * Generate an RFC compliant V4 uuid.
 * Uses the workflow's deterministic PRNG making it safe for use within a workflow.
 * This function is cryptographically insecure.
 * See the {@link https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid | stackoverflow discussion}.
 */
function uuid4() {
    // Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const ho = (n, p) => n.toString(16).padStart(p, '0');
    // Create a view backed by a 16-byte buffer
    const view = new DataView(new ArrayBuffer(16));
    // Fill buffer with random values
    view.setUint32(0, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(4, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(8, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(12, (Math.random() * 0x100000000) >>> 0);
    // Patch the 6th byte to reflect a version 4 UUID
    view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40);
    // Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80);
    // Compile the canonical textual form from the array data
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`;
}
exports.uuid4 = uuid4;
/**
 * Patch or upgrade workflow code by checking or stating that this workflow has a certain patch.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * If the workflow is replaying an existing history, then this function returns true if that
 * history was produced by a worker which also had a `patched` call with the same `patchId`.
 * If the history was produced by a worker *without* such a call, then it will return false.
 *
 * If the workflow is not currently replaying, then this call *always* returns true.
 *
 * Your workflow code should run the "new" code if this returns true, if it returns false, you
 * should run the "old" code. By doing this, you can maintain determinism.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function patched(patchId) {
    return patchInternal(patchId, false);
}
exports.patched = patched;
/**
 * Indicate that a patch is being phased out.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * Workflows with this call may be deployed alongside workflows with a {@link patched} call, but
 * they must *not* be deployed while any workers still exist running old code without a
 * {@link patched} call, or any runs with histories produced by such workers exist. If either kind
 * of worker encounters a history produced by the other, their behavior is undefined.
 *
 * Once all live workflow runs have been produced by workers with this call, you can deploy workers
 * which are free of either kind of patch call for this ID. Workers with and without this call
 * may coexist, as long as they are both running the "new" code.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function deprecatePatch(patchId) {
    patchInternal(patchId, true);
}
exports.deprecatePatch = deprecatePatch;
function patchInternal(patchId, deprecated) {
    const activator = (0, internals_1.getActivator)();
    // Patch operation does not support interception at the moment, if it did,
    // this would be the place to start the interception chain
    if (activator.workflow === undefined) {
        throw new common_1.IllegalStateError('Patches cannot be used before Workflow starts');
    }
    const usePatch = !activator.info.unsafe.isReplaying || activator.knownPresentPatches.has(patchId);
    // Avoid sending commands for patches core already knows about.
    // This optimization enables development of automatic patching tools.
    if (usePatch && !activator.sentPatches.has(patchId)) {
        activator.pushCommand({
            setPatchMarker: { patchId, deprecated },
        });
        activator.sentPatches.add(patchId);
    }
    return usePatch;
}
async function condition(fn, timeout) {
    // Prior to 1.5.0, `condition(fn, 0)` was treated as equivalent to `condition(fn, undefined)`
    if (timeout === 0 && !(0, internals_1.getActivator)().checkInternalPatchAtLeast(1)) {
        return conditionInner(fn);
    }
    if (typeof timeout === 'number' || typeof timeout === 'string') {
        return cancellation_scope_1.CancellationScope.cancellable(async () => {
            try {
                return await Promise.race([sleep(timeout).then(() => false), conditionInner(fn).then(() => true)]);
            }
            finally {
                cancellation_scope_1.CancellationScope.current().cancel();
            }
        });
    }
    return conditionInner(fn);
}
exports.condition = condition;
function conditionInner(fn) {
    const activator = (0, internals_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        const seq = activator.nextSeqs.condition++;
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                activator.blockedConditions.delete(seq);
                reject(err);
            }));
        }
        // Eager evaluation
        if (fn()) {
            resolve();
            return;
        }
        activator.blockedConditions.set(seq, { fn, resolve });
    });
}
/**
 * Define a signal method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to signal Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineSignal(name) {
    return {
        type: 'signal',
        name,
    };
}
exports.defineSignal = defineSignal;
/**
 * Define a query method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to query Workflows using a {@link WorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineQuery(name) {
    return {
        type: 'query',
        name,
    };
}
exports.defineQuery = defineQuery;
/**
 * Set a handler function for a Workflow query or signal.
 *
 * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.
 *
 * @param def a {@link SignalDefinition} or {@link QueryDefinition} as returned by {@link defineSignal} or {@link defineQuery} respectively.
 * @param handler a compatible handler function for the given definition or `undefined` to unset the handler.
 */
function setHandler(def, handler) {
    const activator = (0, internals_1.getActivator)();
    if (def.type === 'signal') {
        activator.signalHandlers.set(def.name, handler);
        const bufferedSignals = activator.bufferedSignals.get(def.name);
        if (bufferedSignals !== undefined && handler !== undefined) {
            activator.bufferedSignals.delete(def.name);
            for (const signal of bufferedSignals) {
                activator.signalWorkflow(signal);
            }
        }
    }
    else if (def.type === 'query') {
        activator.queryHandlers.set(def.name, handler);
    }
    else {
        throw new TypeError(`Invalid definition type: ${def.type}`);
    }
}
exports.setHandler = setHandler;
/**
 * Updates this Workflow's Search Attributes by merging the provided `searchAttributes` with the existing Search
 * Attributes, `workflowInfo().searchAttributes`.
 *
 * For example, this Workflow code:
 *
 * ```ts
 * upsertSearchAttributes({
 *   CustomIntField: [1, 2, 3],
 *   CustomBoolField: [true]
 * });
 * upsertSearchAttributes({
 *   CustomIntField: [42],
 *   CustomKeywordField: ['durable code', 'is great']
 * });
 * ```
 *
 * would result in the Workflow having these Search Attributes:
 *
 * ```ts
 * {
 *   CustomIntField: [42],
 *   CustomBoolField: [true],
 *   CustomKeywordField: ['durable code', 'is great']
 * }
 * ```
 *
 * @param searchAttributes The Record to merge. Use a value of `[]` to clear a Search Attribute.
 */
function upsertSearchAttributes(searchAttributes) {
    const activator = (0, internals_1.getActivator)();
    const mergedSearchAttributes = { ...activator.info.searchAttributes, ...searchAttributes };
    if (!mergedSearchAttributes) {
        throw new Error('searchAttributes must be a non-null SearchAttributes');
    }
    activator.pushCommand({
        upsertWorkflowSearchAttributes: {
            searchAttributes: (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, searchAttributes),
        },
    });
    activator.info.searchAttributes = mergedSearchAttributes;
}
exports.upsertSearchAttributes = upsertSearchAttributes;
exports.stackTraceQuery = defineQuery('__stack_trace');
exports.enhancedStackTraceQuery = defineQuery('__enhanced_stack_trace');


/***/ }),

/***/ "./node_modules/ms/index.js":
/*!**********************************!*\
  !*** ./node_modules/ms/index.js ***!
  \**********************************/
/***/ ((module) => {

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var w = d * 7;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'weeks':
    case 'week':
    case 'w':
      return n * w;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (msAbs >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (msAbs >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (msAbs >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  var msAbs = Math.abs(ms);
  if (msAbs >= d) {
    return plural(ms, msAbs, d, 'day');
  }
  if (msAbs >= h) {
    return plural(ms, msAbs, h, 'hour');
  }
  if (msAbs >= m) {
    return plural(ms, msAbs, m, 'minute');
  }
  if (msAbs >= s) {
    return plural(ms, msAbs, s, 'second');
  }
  return ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, msAbs, n, name) {
  var isPlural = msAbs >= n * 1.5;
  return Math.round(ms / n) + ' ' + name + (isPlural ? 's' : '');
}


/***/ }),

/***/ "./src/workflows.ts":
/*!**************************!*\
  !*** ./src/workflows.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "priceAction": () => (/* binding */ priceAction)
/* harmony export */ });
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @temporalio/workflow */ "./node_modules/@temporalio/workflow/lib/index.js");
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__);

const { is_market_open , get_current_price , get_surrounding_key_levels , get_position_setup , getOptionsSelection , waitToSignalOpenPosition , checkIfPositionFilled , getOptionSymbol , waitToSignalCutPosition , waitToSignalClosePosition , getLoginCredentials , getUserPrinciples  } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
    startToCloseTimeout: 28800000
});
async function priceAction(premarketData) {
    if (premarketData === undefined || premarketData === null) {
        return 'No Opportunities';
    }
    const budget = premarketData.budget;
    const clientId = premarketData.client_id;
    const accountId = premarketData.account_id;
    const keyLevels = premarketData.keyLevels;
    const demandZones = premarketData.demandZones;
    const supplyZones = premarketData.supplyZones;
    const symbol = premarketData.symbol;
    let token = {
        access_token: null,
        refresh_token: null,
        access_token_expires_at: null,
        refresh_token_expires_at: null,
        logged_in: null,
        access_token_expires_at_date: null,
        refresh_token_expires_at_date: null
    };
    let gettingUserPrinciples = {
        userPrinciples: null,
        params: null
    };
    const marketOpen = await is_market_open();
    if (marketOpen) {
        while(gettingUserPrinciples.params === null){
            token = await getLoginCredentials(clientId);
            gettingUserPrinciples = await getUserPrinciples(token.access_token);
        }
        let params = gettingUserPrinciples.params;
        let adminConfig = {
            "service": "ADMIN",
            "command": "LOGIN",
            "requestid": "0",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "credential": params,
                "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
                "version": "1.0",
                "qoslevel": "0"
            }
        };
        let quoteConfig = {
            "service": "QUOTE",
            "requestid": "1",
            "command": "SUBS",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "keys": premarketData.symbol,
                "fields": "0,1,2,3,4,5"
            }
        };
        let bookConfig = {
            "service": "NASDAQ_BOOK",
            "requestid": "3",
            "command": "SUBS",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "keys": premarketData.symbol,
                "fields": "0,1,2,3"
            }
        };
        let timeSaleConfig = {
            "service": "TIMESALE_EQUITY",
            "requestid": "4",
            "command": "SUBS",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "keys": premarketData.symbol,
                "fields": "0,1,2,3"
            }
        };
        let loginRequest = {
            "requests": [
                adminConfig, 
            ]
        };
        let marketRequest = {
            "requests": [
                quoteConfig, 
            ]
        };
        let bookRequest = {
            "requests": [
                bookConfig, 
            ]
        };
        let timeSalesRequest = {
            "requests": [
                timeSaleConfig, 
            ]
        };
        let wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
        const currentPrice = await get_current_price(wsUri, loginRequest, marketRequest, demandZones, supplyZones);
        const surroundingKeyLevels = await get_surrounding_key_levels(currentPrice.closePrice, keyLevels);
        const positionSetup = await get_position_setup(surroundingKeyLevels, currentPrice.demandZone, currentPrice.supplyZone);
        const optionSelection = await getOptionsSelection(positionSetup, symbol, token.access_token);
        token = {
            access_token: null,
            refresh_token: null,
            access_token_expires_at: null,
            refresh_token_expires_at: null,
            logged_in: null,
            access_token_expires_at_date: null,
            refresh_token_expires_at_date: null
        };
        gettingUserPrinciples = {
            userPrinciples: null,
            params: null
        };
        while(gettingUserPrinciples.params === null){
            token = await getLoginCredentials(clientId);
            gettingUserPrinciples = await getUserPrinciples(token.access_token);
        }
        params = gettingUserPrinciples.params;
        adminConfig = {
            "service": "ADMIN",
            "command": "LOGIN",
            "requestid": "0",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "credential": params,
                "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
                "version": "1.0",
                "qoslevel": "0"
            }
        };
        quoteConfig = {
            "service": "QUOTE",
            "requestid": "1",
            "command": "SUBS",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "keys": premarketData.symbol,
                "fields": "0,1,2,3,4,5"
            }
        };
        bookConfig = {
            "service": "NASDAQ_BOOK",
            "requestid": "3",
            "command": "SUBS",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "keys": premarketData.symbol,
                "fields": "0,1,2,3"
            }
        };
        timeSaleConfig = {
            "service": "TIMESALE_EQUITY",
            "requestid": "4",
            "command": "SUBS",
            "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
            "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
            "parameters": {
                "keys": premarketData.symbol,
                "fields": "0,1,2,3"
            }
        };
        loginRequest = {
            "requests": [
                adminConfig, 
            ]
        };
        marketRequest = {
            "requests": [
                quoteConfig, 
            ]
        };
        bookRequest = {
            "requests": [
                bookConfig, 
            ]
        };
        timeSalesRequest = {
            "requests": [
                timeSaleConfig, 
            ]
        };
        wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
        const signalOpenPosition = await waitToSignalOpenPosition(wsUri, loginRequest, bookRequest, timeSalesRequest, positionSetup, optionSelection, budget, accountId, token.access_token);
        token = {
            access_token: null,
            refresh_token: null,
            access_token_expires_at: null,
            refresh_token_expires_at: null,
            logged_in: null,
            access_token_expires_at_date: null,
            refresh_token_expires_at_date: null
        };
        gettingUserPrinciples = {
            userPrinciples: null,
            params: null
        };
        if (signalOpenPosition.position) {
            const quantity = await checkIfPositionFilled(signalOpenPosition.position, accountId, token.access_token);
            const optionSymbol = await getOptionSymbol(signalOpenPosition.position, accountId, token.access_token);
            while(gettingUserPrinciples.params === null){
                token = await getLoginCredentials(clientId);
                gettingUserPrinciples = await getUserPrinciples(token.access_token);
            }
            params = gettingUserPrinciples.params;
            adminConfig = {
                "service": "ADMIN",
                "command": "LOGIN",
                "requestid": "0",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "credential": params,
                    "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
                    "version": "1.0",
                    "qoslevel": "0"
                }
            };
            quoteConfig = {
                "service": "QUOTE",
                "requestid": "1",
                "command": "SUBS",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "keys": premarketData.symbol,
                    "fields": "0,1,2,3,4,5"
                }
            };
            bookConfig = {
                "service": "NASDAQ_BOOK",
                "requestid": "3",
                "command": "SUBS",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "keys": premarketData.symbol,
                    "fields": "0,1,2,3"
                }
            };
            timeSaleConfig = {
                "service": "TIMESALE_EQUITY",
                "requestid": "4",
                "command": "SUBS",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "keys": premarketData.symbol,
                    "fields": "0,1,2,3"
                }
            };
            loginRequest = {
                "requests": [
                    adminConfig, 
                ]
            };
            marketRequest = {
                "requests": [
                    quoteConfig, 
                ]
            };
            bookRequest = {
                "requests": [
                    bookConfig, 
                ]
            };
            timeSalesRequest = {
                "requests": [
                    timeSaleConfig, 
                ]
            };
            wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
            const cutFilled = await waitToSignalCutPosition(wsUri, loginRequest, bookRequest, timeSalesRequest, optionSymbol, quantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);
            const remainingQuantity = quantity - cutFilled;
            token = {
                access_token: null,
                refresh_token: null,
                access_token_expires_at: null,
                refresh_token_expires_at: null,
                logged_in: null,
                access_token_expires_at_date: null,
                refresh_token_expires_at_date: null
            };
            gettingUserPrinciples = {
                userPrinciples: null,
                params: null
            };
            while(gettingUserPrinciples.params === null){
                token = await getLoginCredentials(clientId);
                gettingUserPrinciples = await getUserPrinciples(token.access_token);
            }
            params = gettingUserPrinciples.params;
            adminConfig = {
                "service": "ADMIN",
                "command": "LOGIN",
                "requestid": "0",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "credential": params,
                    "token": gettingUserPrinciples.userPrinciples.streamerInfo.token,
                    "version": "1.0",
                    "qoslevel": "0"
                }
            };
            quoteConfig = {
                "service": "QUOTE",
                "requestid": "1",
                "command": "SUBS",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "keys": premarketData.symbol,
                    "fields": "0,1,2,3,4,5"
                }
            };
            bookConfig = {
                "service": "NASDAQ_BOOK",
                "requestid": "3",
                "command": "SUBS",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "keys": premarketData.symbol,
                    "fields": "0,1,2,3"
                }
            };
            timeSaleConfig = {
                "service": "TIMESALE_EQUITY",
                "requestid": "4",
                "command": "SUBS",
                "account": gettingUserPrinciples.userPrinciples.accounts[0].accountId,
                "source": gettingUserPrinciples.userPrinciples.streamerInfo.appId,
                "parameters": {
                    "keys": premarketData.symbol,
                    "fields": "0,1,2,3"
                }
            };
            loginRequest = {
                "requests": [
                    adminConfig, 
                ]
            };
            marketRequest = {
                "requests": [
                    quoteConfig, 
                ]
            };
            bookRequest = {
                "requests": [
                    bookConfig, 
                ]
            };
            timeSalesRequest = {
                "requests": [
                    timeSaleConfig, 
                ]
            };
            wsUri = `wss://${gettingUserPrinciples.userPrinciples.streamerInfo.streamerSocketUrl}/ws`;
            const signalClosePosition = await waitToSignalClosePosition(wsUri, loginRequest, bookRequest, timeSalesRequest, optionSymbol, remainingQuantity, signalOpenPosition.demandOrSupply, positionSetup, accountId, token.access_token);
            return signalClosePosition.orderId;
        } else {
            return 'NOGOODPOSITIONS';
        }
    } else {
        return 'MARKETCLOSED';
    }
}


/***/ }),

/***/ "?31ff":
/*!*****************************************************!*\
  !*** __temporal_custom_failure_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?2065":
/*!*****************************************************!*\
  !*** __temporal_custom_payload_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "./node_modules/@temporalio/common/node_modules/long/umd/index.js":
/*!************************************************************************!*\
  !*** ./node_modules/@temporalio/common/node_modules/long/umd/index.js ***!
  \************************************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// GENERATED FILE. DO NOT EDIT.
var Long = (function(exports) {
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;
  
  /**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  // WebAssembly optimizations to do native i64 multiplication and divide
  var wasm = null;
  
  try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
  } catch (e) {// no wasm support :(
  }
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
   *  See the from* functions below for more convenient ways of constructing Longs.
   * @exports Long
   * @class A Long class for representing a 64 bit two's-complement integer value.
   * @param {number} low The low (signed) 32 bits of the long
   * @param {number} high The high (signed) 32 bits of the long
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @constructor
   */
  
  
  function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     */
  
    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     */
  
    this.unsigned = !!unsigned;
  } // The internal representation of a long is the two given signed, 32-bit values.
  // We use 32-bit pieces because these are the size of integers on which
  // Javascript performs bit-operations.  For operations like addition and
  // multiplication, we split each number into 16 bit pieces, which can easily be
  // multiplied within Javascript's floating-point representation without overflow
  // or change in sign.
  //
  // In the algorithms below, we frequently reduce the negative case to the
  // positive case by negating the input(s) and then post-processing the result.
  // Note that we must ALWAYS check specially whether those values are MIN_VALUE
  // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
  // a positive number, it overflows back into a negative).  Not handling this
  // case would often result in infinite recursion.
  //
  // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
  // methods on which they depend.
  
  /**
   * An indicator used to reliably determine if an object is a Long or not.
   * @type {boolean}
   * @const
   * @private
   */
  
  
  Long.prototype.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", {
    value: true
  });
  /**
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   * @inner
   */
  
  function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  }
  /**
   * @function
   * @param {*} value number
   * @returns {number}
   * @inner
   */
  
  
  function ctz32(value) {
    var c = Math.clz32(value & -value);
    return value ? 31 - c : c;
  }
  /**
   * Tests if the specified object is a Long.
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   */
  
  
  Long.isLong = isLong;
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @inner
   */
  
  var INT_CACHE = {};
  /**
   * A cache of the Long representations of small unsigned integer values.
   * @type {!Object}
   * @inner
   */
  
  var UINT_CACHE = {};
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
  
    if (unsigned) {
      value >>>= 0;
  
      if (cache = 0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, 0, true);
      if (cache) UINT_CACHE[value] = obj;
      return obj;
    } else {
      value |= 0;
  
      if (cache = -128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, value < 0 ? -1 : 0, false);
      if (cache) INT_CACHE[value] = obj;
      return obj;
    }
  }
  /**
   * Returns a Long representing the given 32 bit integer value.
   * @function
   * @param {number} value The 32 bit integer in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromInt = fromInt;
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromNumber(value, unsigned) {
    if (isNaN(value)) return unsigned ? UZERO : ZERO;
  
    if (unsigned) {
      if (value < 0) return UZERO;
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
    } else {
      if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
      if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
    }
  
    if (value < 0) return fromNumber(-value, unsigned).neg();
    return fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
  }
  /**
   * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
   * @function
   * @param {number} value The number in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromNumber = fromNumber;
  /**
   * @param {number} lowBits
   * @param {number} highBits
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  }
  /**
   * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
   *  assumed to use 32 bits.
   * @function
   * @param {number} lowBits The low 32 bits
   * @param {number} highBits The high 32 bits
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromBits = fromBits;
  /**
   * @function
   * @param {number} base
   * @param {number} exponent
   * @returns {number}
   * @inner
   */
  
  var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
  
  /**
   * @param {string} str
   * @param {(boolean|number)=} unsigned
   * @param {number=} radix
   * @returns {!Long}
   * @inner
   */
  
  function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('empty string');
  
    if (typeof unsigned === 'number') {
      // For goog.math.long compatibility
      radix = unsigned;
      unsigned = false;
    } else {
      unsigned = !!unsigned;
    }
  
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return unsigned ? UZERO : ZERO;
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    var p;
    if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen');else if (p === 0) {
      return fromString(str.substring(1), unsigned, radix).neg();
    } // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
  
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i),
          value = parseInt(str.substring(i, i + size), radix);
  
      if (size < 8) {
        var power = fromNumber(pow_dbl(radix, size));
        result = result.mul(power).add(fromNumber(value));
      } else {
        result = result.mul(radixToPower);
        result = result.add(fromNumber(value));
      }
    }
  
    result.unsigned = unsigned;
    return result;
  }
  /**
   * Returns a Long representation of the given string, written using the specified radix.
   * @function
   * @param {string} str The textual representation of the Long
   * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
   * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromString = fromString;
  /**
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromValue(val, unsigned) {
    if (typeof val === 'number') return fromNumber(val, unsigned);
    if (typeof val === 'string') return fromString(val, unsigned); // Throws for non-objects, converts non-instanceof Long:
  
    return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
  }
  /**
   * Converts the specified value to a Long using the appropriate from* function for its type.
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long}
   */
  
  
  Long.fromValue = fromValue; // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
  // no runtime penalty for these.
  
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_16_DBL = 1 << 16;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_24_DBL = 1 << 24;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  /**
   * @type {!Long}
   * @const
   * @inner
   */
  
  var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
  /**
   * @type {!Long}
   * @inner
   */
  
  var ZERO = fromInt(0);
  /**
   * Signed zero.
   * @type {!Long}
   */
  
  Long.ZERO = ZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UZERO = fromInt(0, true);
  /**
   * Unsigned zero.
   * @type {!Long}
   */
  
  Long.UZERO = UZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var ONE = fromInt(1);
  /**
   * Signed one.
   * @type {!Long}
   */
  
  Long.ONE = ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UONE = fromInt(1, true);
  /**
   * Unsigned one.
   * @type {!Long}
   */
  
  Long.UONE = UONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var NEG_ONE = fromInt(-1);
  /**
   * Signed negative one.
   * @type {!Long}
   */
  
  Long.NEG_ONE = NEG_ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
  /**
   * Maximum signed value.
   * @type {!Long}
   */
  
  Long.MAX_VALUE = MAX_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
  /**
   * Maximum unsigned value.
   * @type {!Long}
   */
  
  Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);
  /**
   * Minimum signed value.
   * @type {!Long}
   */
  
  Long.MIN_VALUE = MIN_VALUE;
  /**
   * @alias Long.prototype
   * @inner
   */
  
  var LongPrototype = Long.prototype;
  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @this {!Long}
   * @returns {number}
   */
  
  LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  /**
   * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.toNumber = function toNumber() {
    if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  /**
   * Converts the Long to a string written in the specified radix.
   * @this {!Long}
   * @param {number=} radix Radix (2-36), defaults to 10
   * @returns {string}
   * @override
   * @throws {RangeError} If `radix` is out of range
   */
  
  
  LongPrototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    if (this.isZero()) return '0';
  
    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.eq(MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = fromNumber(radix),
            div = this.div(radixLong),
            rem1 = div.mul(radixLong).sub(this);
        return div.toString(radix) + rem1.toInt().toString(radix);
      } else return '-' + this.neg().toString(radix);
    } // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
  
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
    var result = '';
  
    while (true) {
      var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;else {
        while (digits.length < 6) digits = '0' + digits;
  
        result = '' + digits + result;
      }
    }
  };
  /**
   * Gets the high 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed high bits
   */
  
  
  LongPrototype.getHighBits = function getHighBits() {
    return this.high;
  };
  /**
   * Gets the high 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned high bits
   */
  
  
  LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  /**
   * Gets the low 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed low bits
   */
  
  
  LongPrototype.getLowBits = function getLowBits() {
    return this.low;
  };
  /**
   * Gets the low 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned low bits
   */
  
  
  LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  /**
   * Gets the number of bits needed to represent the absolute value of this Long.
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
      return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;
  
    for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
  
    return this.high != 0 ? bit + 33 : bit + 1;
  };
  /**
   * Tests if this Long's value equals zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  /**
   * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
   * @returns {boolean}
   */
  
  
  LongPrototype.eqz = LongPrototype.isZero;
  /**
   * Tests if this Long's value is negative.
   * @this {!Long}
   * @returns {boolean}
   */
  
  LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  /**
   * Tests if this Long's value is positive or zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  /**
   * Tests if this Long's value is odd.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  /**
   * Tests if this Long's value is even.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  /**
   * Tests if this Long's value equals the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.equals = function equals(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  };
  /**
   * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.eq = LongPrototype.equals;
  /**
   * Tests if this Long's value differs from the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(
    /* validates */
    other);
  };
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.neq = LongPrototype.notEquals;
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ne = LongPrototype.notEquals;
  /**
   * Tests if this Long's value is less than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThan = function lessThan(other) {
    return this.comp(
    /* validates */
    other) < 0;
  };
  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lt = LongPrototype.lessThan;
  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) <= 0;
  };
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lte = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.le = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is greater than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(
    /* validates */
    other) > 0;
  };
  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gt = LongPrototype.greaterThan;
  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) >= 0;
  };
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gte = LongPrototype.greaterThanOrEqual;
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ge = LongPrototype.greaterThanOrEqual;
  /**
   * Compares this Long's value with the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  LongPrototype.compare = function compare(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.eq(other)) return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1; // At this point the sign bits are the same
  
    if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1; // Both are positive if at least one is unsigned
  
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  /**
   * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  
  LongPrototype.comp = LongPrototype.compare;
  /**
   * Negates this Long's value.
   * @this {!Long}
   * @returns {!Long} Negated Long
   */
  
  LongPrototype.negate = function negate() {
    if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
    return this.not().add(ONE);
  };
  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   */
  
  
  LongPrototype.neg = LongPrototype.negate;
  /**
   * Returns the sum of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   */
  
  LongPrototype.add = function add(addend) {
    if (!isLong(addend)) addend = fromValue(addend); // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the difference of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.subtract = function subtract(subtrahend) {
    if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
  };
  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.sub = LongPrototype.subtract;
  /**
   * Returns the product of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  LongPrototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return this;
    if (!isLong(multiplier)) multiplier = fromValue(multiplier); // use wasm support if present
  
    if (wasm) {
      var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
    if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  
    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());else return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg(); // If both longs are small, use float multiplication
  
  
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24)) return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned); // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  
  LongPrototype.mul = LongPrototype.multiply;
  /**
   * Returns this Long divided by the specified. The result is signed if this Long is signed or
   *  unsigned if this Long is unsigned.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  LongPrototype.divide = function divide(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor);
    if (divisor.isZero()) throw Error('division by zero'); // use wasm support if present
  
    if (wasm) {
      // guard against signed division overflow: the largest
      // negative number / -1 would be 1 larger than the largest
      // positive number, due to two's complement.
      if (!this.unsigned && this.high === -0x80000000 && divisor.low === -1 && divisor.high === -1) {
        // be consistent with non-wasm code path
        return this;
      }
  
      var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (this.isZero()) return this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
  
    if (!this.unsigned) {
      // This section is only relevant for signed longs and is derived from the
      // closure library as a whole.
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
        else if (divisor.eq(MIN_VALUE)) return ONE;else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shr(1);
          approx = halfThis.div(divisor).shl(1);
  
          if (approx.eq(ZERO)) {
            return divisor.isNegative() ? ONE : NEG_ONE;
          } else {
            rem = this.sub(divisor.mul(approx));
            res = approx.add(rem.div(divisor));
            return res;
          }
        }
      } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
  
      if (this.isNegative()) {
        if (divisor.isNegative()) return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
      } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
  
      res = ZERO;
    } else {
      // The algorithm below has not been made for unsigned longs. It's therefore
      // required to take special care of the MSB prior to running it.
      if (!divisor.unsigned) divisor = divisor.toUnsigned();
      if (divisor.gt(this)) return UZERO;
      if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
        return UONE;
      res = UZERO;
    } // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
  
  
    rem = this;
  
    while (rem.gte(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber())); // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
  
      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      approxRes = fromNumber(approx),
          approxRem = approxRes.mul(divisor);
  
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta;
        approxRes = fromNumber(approx, this.unsigned);
        approxRem = approxRes.mul(divisor);
      } // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
  
  
      if (approxRes.isZero()) approxRes = ONE;
      res = res.add(approxRes);
      rem = rem.sub(approxRem);
    }
  
    return res;
  };
  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  
  LongPrototype.div = LongPrototype.divide;
  /**
   * Returns this Long modulo the specified.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor); // use wasm support if present
  
    if (wasm) {
      var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    return this.sub(this.div(divisor).mul(divisor));
  };
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  
  LongPrototype.mod = LongPrototype.modulo;
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.rem = LongPrototype.modulo;
  /**
   * Returns the bitwise NOT of this Long.
   * @this {!Long}
   * @returns {!Long}
   */
  
  LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
  };
  /**
   * Returns count leading zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.countLeadingZeros = function countLeadingZeros() {
    return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
  };
  /**
   * Returns count leading zeros. This is an alias of {@link Long#countLeadingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.clz = LongPrototype.countLeadingZeros;
  /**
   * Returns count trailing zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  LongPrototype.countTrailingZeros = function countTrailingZeros() {
    return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
  };
  /**
   * Returns count trailing zeros. This is an alias of {@link Long#countTrailingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.ctz = LongPrototype.countTrailingZeros;
  /**
   * Returns the bitwise AND of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  LongPrototype.and = function and(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  /**
   * Returns the bitwise OR of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.or = function or(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.xor = function xor(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shl = LongPrototype.shiftLeft;
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
  };
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shr = LongPrototype.shiftRight;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >>> numBits, this.unsigned);
    if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
    return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
  };
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shru = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits rotated to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateLeft = function rotateLeft(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.low << numBits | this.high >>> b, this.high << numBits | this.low >>> b, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.high << numBits | this.low >>> b, this.low << numBits | this.high >>> b, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the left by the given amount. This is an alias of {@link Long#rotateLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotl = LongPrototype.rotateLeft;
  /**
   * Returns this Long with bits rotated to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateRight = function rotateRight(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.high << b | this.low >>> numBits, this.low << b | this.high >>> numBits, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.low << b | this.high >>> numBits, this.high << b | this.low >>> numBits, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the right by the given amount. This is an alias of {@link Long#rotateRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotr = LongPrototype.rotateRight;
  /**
   * Converts this Long to signed.
   * @this {!Long}
   * @returns {!Long} Signed long
   */
  
  LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned) return this;
    return fromBits(this.low, this.high, false);
  };
  /**
   * Converts this Long to unsigned.
   * @this {!Long}
   * @returns {!Long} Unsigned long
   */
  
  
  LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this;
    return fromBits(this.low, this.high, true);
  };
  /**
   * Converts this Long to its byte representation.
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @this {!Long}
   * @returns {!Array.<number>} Byte representation
   */
  
  
  LongPrototype.toBytes = function toBytes(le) {
    return le ? this.toBytesLE() : this.toBytesBE();
  };
  /**
   * Converts this Long to its little endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Little endian byte representation
   */
  
  
  LongPrototype.toBytesLE = function toBytesLE() {
    var hi = this.high,
        lo = this.low;
    return [lo & 0xff, lo >>> 8 & 0xff, lo >>> 16 & 0xff, lo >>> 24, hi & 0xff, hi >>> 8 & 0xff, hi >>> 16 & 0xff, hi >>> 24];
  };
  /**
   * Converts this Long to its big endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Big endian byte representation
   */
  
  
  LongPrototype.toBytesBE = function toBytesBE() {
    var hi = this.high,
        lo = this.low;
    return [hi >>> 24, hi >>> 16 & 0xff, hi >>> 8 & 0xff, hi & 0xff, lo >>> 24, lo >>> 16 & 0xff, lo >>> 8 & 0xff, lo & 0xff];
  };
  /**
   * Creates a Long from its byte representation.
   * @param {!Array.<number>} bytes Byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytes = function fromBytes(bytes, unsigned, le) {
    return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
  };
  /**
   * Creates a Long from its little endian byte representation.
   * @param {!Array.<number>} bytes Little endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
    return new Long(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
  };
  /**
   * Creates a Long from its big endian byte representation.
   * @param {!Array.<number>} bytes Big endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
    return new Long(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
  };
  
  var _default = Long;
  exports.default = _default;
  return "default" in exports ? exports.default : exports;
})({});
if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() { return Long; }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
else {}


/***/ }),

/***/ "./node_modules/@temporalio/workflow/package.json":
/*!********************************************************!*\
  !*** ./node_modules/@temporalio/workflow/package.json ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"name":"@temporalio/workflow","version":"1.5.2","description":"Temporal.io SDK Workflow sub-package","keywords":["temporal","workflow","isolate"],"homepage":"https://github.com/temporalio/sdk-typescript/tree/main/packages/workflow","bugs":{"url":"https://github.com/temporalio/sdk-typescript/issues"},"license":"MIT","author":"Temporal Technologies Inc. <sdk@temporal.io>","main":"lib/index.js","types":"lib/index.d.ts","scripts":{},"dependencies":{"@temporalio/common":"^1.5.2","@temporalio/proto":"^1.5.2"},"devDependencies":{"source-map":"^0.7.4"},"publishConfig":{"access":"public"},"files":["src","lib"],"gitHead":"d32adfd8537661c3740767ca1a3862392ca702e2"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!****************************************************!*\
  !*** ./src/workflows-autogenerated-entrypoint.cjs ***!
  \****************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "./node_modules/@temporalio/workflow/lib/worker-interface.js");

api.overrideGlobals();

exports.api = api;

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/workflows.ts */ "./src/workflows.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    __webpack_require__(/* webpackMode: "eager" */ /*! ./node_modules/@temporalio/worker/lib/workflow-log-interceptor.js */ "./node_modules/@temporalio/worker/lib/workflow-log-interceptor.js")
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLTZkNmViMGIyNzIzZDE1NGZlZTliLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEhBQThDO0FBRTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3QixHQUF4QixnQ0FBd0IsS0FBeEIsZ0NBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNiN0YsbUpBQWdGO0FBRWhGLG1KQUFnRjtBQThEaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM5RUYsNEdBYW9CO0FBQ3BCLDJIQUE2RDtBQUM3RCxtSkFBMkc7QUFFM0c7O0dBRUc7QUFDSCxNQUFNLHFCQUFxQixHQUFHO0lBQzVCLHlCQUF5QjtJQUN6Qix1RkFBdUY7SUFDdkYsMEJBQTBCO0lBQzFCLGtHQUFrRztJQUNsRyx1Q0FBdUM7SUFDdkMsMkRBQTJEO0NBQzVELENBQUM7QUFFRjs7R0FFRztBQUNILFNBQWdCLGdCQUFnQixDQUFDLEtBQWM7SUFDN0MsTUFBTSxLQUFLLEdBQUcsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sR0FBRyxHQUFHLEtBQUssRUFBVSxDQUFDO0lBQzVCLFFBQVEsRUFBRSxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUNsQyxLQUFLLE1BQU0sT0FBTyxJQUFJ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QVksQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQywwQ0FBMEM7YUFDdkU7WUFDRCxNQUFNLElBQUksWUFBWSxDQUNwQixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUNmLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDZixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUNmLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDZixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUNmLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFDZixZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQ2YsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUNoQixZQUFZLENBQUMsRUFBRSxDQUFDLEVBQ2hCLFlBQVksQ0FBQyxFQUFFLENBQUMsRUFDaEIsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUNqQixD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QUFDbkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxzQkFBc0IsK0NBQStDO0FBQ2xGLGFBQWEsVUFBVTtBQUN2QixlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EsOEJBQThCO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Es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QUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNMQSxZQUFZLG1CQUFPLENBQUMsaUhBQThDOztBQUVsRTs7QUFFQSxXQUFXOztBQUVYLHVCQUF1QjtBQUN2QixTQUFTLG1CQUFPLDRCQUE0Qiw4Q0FBZ0Y7QUFDNUg7O0FBRUEsMEJBQTBCO0FBQzFCO0FBQ0EsSUFBSSxtQkFBTyw0QkFBNEIsNElBQWtJO0FBQ3pLO0FBQ0EiLCJzb3VyY2VzIjpbIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFxjb21tb25cXHNyY1xcYWN0aXZpdHktb3B0aW9ucy50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFxjb21tb25cXHNyY1xcY29udmVydGVyXFxkYXRhLWNvbnZlcnRlci50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFxjb21tb25cXHNyY1xcY29udmVydGVyXFxmYWlsdXJlLWNvbnZlcnRlci50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFxjb21tb25cXHNyY1xcY29udmVydGVyXFxwYXlsb2FkLWNvZGVjLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXGNvbW1vblxcc3JjXFxjb252ZXJ0ZXJcXHBheWxvYWQtY29udmVydGVyLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXGNvbW1vblxcc3JjXFxjb252ZXJ0ZXJcXHR5cGVzLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXGNvbW1vblxcc3JjXFxkZXByZWNhdGVkLXRpbWUudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcY29tbW9uXFxzcmNcXGVuY29kaW5nLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXGNvbW1vblxcc3JjXFxlcnJvcnMudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcY29tbW9uXFxzcmNcXGZhaWx1cmUudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcY29tbW9uXFxzcmNcXGluZGV4LnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXGNvbW1vblxcc3JjXFxpbnRlcmNlcHRvcnMudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcY29tbW9uXFxzcmNcXGludGVyZmFjZXMudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcY29tbW9uXFxzcmNcXHJldHJ5LXBvbGljeS50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFxjb21tb25cXHNyY1xcdGltZS50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFxjb21tb25cXHNyY1xcdHlwZS1oZWxwZXJzLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXGNvbW1vblxcc3JjXFx3b3JrZmxvdy1oYW5kbGUudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcY29tbW9uXFxzcmNcXHdvcmtmbG93LW9wdGlvbnMudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcd29ya2VyXFxzcmNcXHdvcmtmbG93LWxvZy1pbnRlcmNlcHRvci50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFx3b3JrZmxvd1xcc3JjXFxhbGVhLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXHdvcmtmbG93XFxzcmNcXGNhbmNlbGxhdGlvbi1zY29wZS50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFx3b3JrZmxvd1xcc3JjXFxlcnJvcnMudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcd29ya2Zsb3dcXHNyY1xcaW5kZXgudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcd29ya2Zsb3dcXHNyY1xcaW50ZXJjZXB0b3JzLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXHdvcmtmbG93XFxzcmNcXGludGVyZmFjZXMudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcd29ya2Zsb3dcXHNyY1xcaW50ZXJuYWxzLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXHdvcmtmbG93XFxzcmNcXHBrZy50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFx3b3JrZmxvd1xcc3JjXFxzdGFjay1oZWxwZXJzLnRzIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXHdvcmtmbG93XFxzcmNcXHRyaWdnZXIudHMiLCJEOlxcQnVzaW5lc3NcXE15IFBvcnRmb2xpb1xcUHJvamVjdHNcXFRpY2tyXFxUaWNrci13b3JrZmxvd1xcbm9kZV9tb2R1bGVzXFxAdGVtcG9yYWxpb1xcd29ya2Zsb3dcXHNyY1xcd29ya2VyLWludGVyZmFjZS50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFx3b3JrZmxvd1xcc3JjXFx3b3JrZmxvdy50cyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXG1zXFxpbmRleC5qcyIsIkQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxzcmNcXHdvcmtmbG93cy50cyIsImlnbm9yZWR8RDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXHdvcmtmbG93XFxsaWJ8X190ZW1wb3JhbF9jdXN0b21fZmFpbHVyZV9jb252ZXJ0ZXIiLCJpZ25vcmVkfEQ6XFxCdXNpbmVzc1xcTXkgUG9ydGZvbGlvXFxQcm9qZWN0c1xcVGlja3JcXFRpY2tyLXdvcmtmbG93XFxub2RlX21vZHVsZXNcXEB0ZW1wb3JhbGlvXFx3b3JrZmxvd1xcbGlifF9fdGVtcG9yYWxfY3VzdG9tX3BheWxvYWRfY29udmVydGVyIiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXG5vZGVfbW9kdWxlc1xcQHRlbXBvcmFsaW9cXGNvbW1vblxcbm9kZV9tb2R1bGVzXFxsb25nXFx1bWRcXGluZGV4LmpzIiwid2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiRDpcXEJ1c2luZXNzXFxNeSBQb3J0Zm9saW9cXFByb2plY3RzXFxUaWNrclxcVGlja3Itd29ya2Zsb3dcXHNyY1xcd29ya2Zsb3dzLWF1dG9nZW5lcmF0ZWQtZW50cnlwb2ludC5janMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgUmV0cnlQb2xpY3kgfSBmcm9tICcuL3JldHJ5LXBvbGljeSc7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZVxuZXhwb3J0IGVudW0gQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlIHtcbiAgVFJZX0NBTkNFTCA9IDAsXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCA9IDEsXG4gIEFCQU5ET04gPSAyLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsIGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlPigpO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHJlbW90ZSBhY3Rpdml0eSBpbnZvY2F0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlPcHRpb25zIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXIgdG8gdXNlIGZvciB0cmFja2luZyB0aGUgYWN0aXZpdHkgaW4gV29ya2Zsb3cgaGlzdG9yeS5cbiAgICogVGhlIGBhY3Rpdml0eUlkYCBjYW4gYmUgYWNjZXNzZWQgYnkgdGhlIGFjdGl2aXR5IGZ1bmN0aW9uLlxuICAgKiBEb2VzIG5vdCBuZWVkIHRvIGJlIHVuaXF1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYW4gaW5jcmVtZW50YWwgc2VxdWVuY2UgbnVtYmVyXG4gICAqL1xuICBhY3Rpdml0eUlkPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIG5hbWUuXG4gICAqXG4gICAqIEBkZWZhdWx0IGN1cnJlbnQgd29ya2VyIHRhc2sgcXVldWVcbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcblxuICAvKipcbiAgICogSGVhcnRiZWF0IGludGVydmFsLiBBY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCBiZWZvcmUgdGhpcyBpbnRlcnZhbCBwYXNzZXMgYWZ0ZXIgYSBsYXN0IGhlYXJ0YmVhdCBvciBhY3Rpdml0eSBzdGFydC5cbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBoZWFydGJlYXRUaW1lb3V0Pzogc3RyaW5nIHwgbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBSZXRyeVBvbGljeSB0aGF0IGRlZmluZSBob3cgYWN0aXZpdHkgaXMgcmV0cmllZCBpbiBjYXNlIG9mIGZhaWx1cmUuIElmIHRoaXMgaXMgbm90IHNldCwgdGhlbiB0aGUgc2VydmVyLWRlZmluZWQgZGVmYXVsdCBhY3Rpdml0eSByZXRyeSBwb2xpY3kgd2lsbCBiZSB1c2VkLiBUbyBlbnN1cmUgemVybyByZXRyaWVzLCBzZXQgbWF4aW11bSBhdHRlbXB0cyB0byAxLlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogTWF4aW11bSB0aW1lIG9mIGEgc2luZ2xlIEFjdGl2aXR5IGV4ZWN1dGlvbiBhdHRlbXB0LiBOb3RlIHRoYXQgdGhlIFRlbXBvcmFsIFNlcnZlciBkb2Vzbid0IGRldGVjdCBXb3JrZXIgcHJvY2Vzc1xuICAgKiBmYWlsdXJlcyBkaXJlY3RseS4gSXQgcmVsaWVzIG9uIHRoaXMgdGltZW91dCB0byBkZXRlY3QgdGhhdCBhbiBBY3Rpdml0eSB0aGF0IGRpZG4ndCBjb21wbGV0ZSBvbiB0aW1lLiBTbyB0aGlzXG4gICAqIHRpbWVvdXQgc2hvdWxkIGJlIGFzIHNob3J0IGFzIHRoZSBsb25nZXN0IHBvc3NpYmxlIGV4ZWN1dGlvbiBvZiB0aGUgQWN0aXZpdHkgYm9keS4gUG90ZW50aWFsbHkgbG9uZyBydW5uaW5nXG4gICAqIEFjdGl2aXRpZXMgbXVzdCBzcGVjaWZ5IHtAbGluayBoZWFydGJlYXRUaW1lb3V0fSBhbmQgY2FsbCB7QGxpbmsgYWN0aXZpdHkuQ29udGV4dC5oZWFydGJlYXR9IHBlcmlvZGljYWxseSBmb3JcbiAgICogdGltZWx5IGZhaWx1cmUgZGV0ZWN0aW9uLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKlxuICAgKiBAZGVmYXVsdCBgc2NoZWR1bGVUb0Nsb3NlVGltZW91dGAgb3IgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc3RhcnRUb0Nsb3NlVGltZW91dD86IHN0cmluZyB8IG51bWJlcjtcblxuICAvKipcbiAgICogVGltZSB0aGF0IHRoZSBBY3Rpdml0eSBUYXNrIGNhbiBzdGF5IGluIHRoZSBUYXNrIFF1ZXVlIGJlZm9yZSBpdCBpcyBwaWNrZWQgdXAgYnkgYSBXb3JrZXIuIERvIG5vdCBzcGVjaWZ5IHRoaXMgdGltZW91dCB1bmxlc3MgdXNpbmcgaG9zdCBzcGVjaWZpYyBUYXNrIFF1ZXVlcyBmb3IgQWN0aXZpdHkgVGFza3MgYXJlIGJlaW5nIHVzZWQgZm9yIHJvdXRpbmcuXG4gICAqIGBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0YCBpcyBhbHdheXMgbm9uLXJldHJ5YWJsZS4gUmV0cnlpbmcgYWZ0ZXIgdGhpcyB0aW1lb3V0IGRvZXNuJ3QgbWFrZSBzZW5zZSBhcyBpdCB3b3VsZCBqdXN0IHB1dCB0aGUgQWN0aXZpdHkgVGFzayBiYWNrIGludG8gdGhlIHNhbWUgVGFzayBRdWV1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIG9yIHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ/OiBzdHJpbmcgfCBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRvdGFsIHRpbWUgdGhhdCBhIHdvcmtmbG93IGlzIHdpbGxpbmcgdG8gd2FpdCBmb3IgQWN0aXZpdHkgdG8gY29tcGxldGUuXG4gICAqIGBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0YCBsaW1pdHMgdGhlIHRvdGFsIHRpbWUgb2YgYW4gQWN0aXZpdHkncyBleGVjdXRpb24gaW5jbHVkaW5nIHJldHJpZXMgKHVzZSB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gdG8gbGltaXQgdGhlIHRpbWUgb2YgYSBzaW5nbGUgYXR0ZW1wdCkuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ/OiBzdHJpbmcgfCBudW1iZXI7XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCB0aGUgU0RLIGRvZXMgd2hlbiB0aGUgQWN0aXZpdHkgaXMgY2FuY2VsbGVkLlxuICAgKiAtIGBUUllfQ0FOQ0VMYCAtIEluaXRpYXRlIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKiAtIGBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURgIC0gV2FpdCBmb3IgYWN0aXZpdHkgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCBhY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCB0byByZWNlaXZlIGFcbiAgICogICBjYW5jZWxsYXRpb24gbm90aWZpY2F0aW9uLiBUaGlzIGNhbiBibG9jayB0aGUgY2FuY2VsbGF0aW9uIGZvciBhIGxvbmcgdGltZSBpZiBhY3Rpdml0eSBkb2Vzbid0XG4gICAqICAgaGVhcnRiZWF0IG9yIGNob29zZXMgdG8gaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICogLSBgQUJBTkRPTmAgLSBEbyBub3QgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgdGhlIGFjdGl2aXR5IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU7XG5cbiAgLyoqXG4gICAqIEVhZ2VyIGRpc3BhdGNoIGlzIGFuIG9wdGltaXphdGlvbiB0aGF0IGltcHJvdmVzIHRoZSB0aHJvdWdocHV0IGFuZCBsb2FkIG9uIHRoZSBzZXJ2ZXIgZm9yIHNjaGVkdWxpbmcgQWN0aXZpdGllcy5cbiAgICogV2hlbiB1c2VkLCB0aGUgc2VydmVyIHdpbGwgaGFuZCBvdXQgQWN0aXZpdHkgdGFza3MgYmFjayB0byB0aGUgV29ya2VyIHdoZW4gaXQgY29tcGxldGVzIGEgV29ya2Zsb3cgdGFzay5cbiAgICogSXQgaXMgYXZhaWxhYmxlIGZyb20gc2VydmVyIHZlcnNpb24gMS4xNyBiZWhpbmQgdGhlIGBzeXN0ZW0uZW5hYmxlQWN0aXZpdHlFYWdlckV4ZWN1dGlvbmAgZmVhdHVyZSBmbGFnLlxuICAgKlxuICAgKiBFYWdlciBkaXNwYXRjaCB3aWxsIG9ubHkgYmUgdXNlZCBpZiBgYWxsb3dFYWdlckRpc3BhdGNoYCBpcyBlbmFibGVkICh0aGUgZGVmYXVsdCkgYW5kIHtAbGluayB0YXNrUXVldWV9IGlzIGVpdGhlclxuICAgKiBvbWl0dGVkIG9yIHRoZSBzYW1lIGFzIHRoZSBjdXJyZW50IFdvcmtmbG93LlxuICAgKlxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBhbGxvd0VhZ2VyRGlzcGF0Y2g/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGxvY2FsIGFjdGl2aXR5IGludm9jYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbEFjdGl2aXR5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBSZXRyeVBvbGljeSB0aGF0IGRlZmluZXMgaG93IGFuIGFjdGl2aXR5IGlzIHJldHJpZWQgaW4gY2FzZSBvZiBmYWlsdXJlLiBJZiB0aGlzIGlzIG5vdCBzZXQsIHRoZW4gdGhlIFNESy1kZWZpbmVkIGRlZmF1bHQgYWN0aXZpdHkgcmV0cnkgcG9saWN5IHdpbGwgYmUgdXNlZC5cbiAgICogTm90ZSB0aGF0IGxvY2FsIGFjdGl2aXRpZXMgYXJlIGFsd2F5cyBleGVjdXRlZCBhdCBsZWFzdCBvbmNlLCBldmVuIGlmIG1heGltdW0gYXR0ZW1wdHMgaXMgc2V0IHRvIDEgZHVlIHRvIFdvcmtmbG93IHRhc2sgcmV0cmllcy5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gdGltZSB0aGUgbG9jYWwgYWN0aXZpdHkgaXMgYWxsb3dlZCB0byBleGVjdXRlIGFmdGVyIHRoZSB0YXNrIGlzIGRpc3BhdGNoZWQuIFRoaXNcbiAgICogdGltZW91dCBpcyBhbHdheXMgcmV0cnlhYmxlLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKiBJZiBzZXQsIHRoaXMgbXVzdCBiZSA8PSB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0sIG90aGVyd2lzZSwgaXQgd2lsbCBiZSBjbGFtcGVkIGRvd24uXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc3RhcnRUb0Nsb3NlVGltZW91dD86IHN0cmluZyB8IG51bWJlcjtcblxuICAvKipcbiAgICogTGltaXRzIHRpbWUgdGhlIGxvY2FsIGFjdGl2aXR5IGNhbiBpZGxlIGludGVybmFsbHkgYmVmb3JlIGJlaW5nIGV4ZWN1dGVkLiBUaGF0IGNhbiBoYXBwZW4gaWZcbiAgICogdGhlIHdvcmtlciBpcyBjdXJyZW50bHkgYXQgbWF4IGNvbmN1cnJlbnQgbG9jYWwgYWN0aXZpdHkgZXhlY3V0aW9ucy4gVGhpcyB0aW1lb3V0IGlzIGFsd2F5c1xuICAgKiBub24gcmV0cnlhYmxlIGFzIGFsbCBhIHJldHJ5IHdvdWxkIGFjaGlldmUgaXMgdG8gcHV0IGl0IGJhY2sgaW50byB0aGUgc2FtZSBxdWV1ZS4gRGVmYXVsdHNcbiAgICogdG8ge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlmIG5vdCBzcGVjaWZpZWQgYW5kIHRoYXQgaXMgc2V0LiBNdXN0IGJlIDw9XG4gICAqIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSB3aGVuIHNldCwgb3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGNsYW1wZWQgZG93bi5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dD86IHN0cmluZyB8IG51bWJlcjtcblxuICAvKipcbiAgICogSW5kaWNhdGVzIGhvdyBsb25nIHRoZSBjYWxsZXIgaXMgd2lsbGluZyB0byB3YWl0IGZvciBsb2NhbCBhY3Rpdml0eSBjb21wbGV0aW9uLiBMaW1pdHMgaG93XG4gICAqIGxvbmcgcmV0cmllcyB3aWxsIGJlIGF0dGVtcHRlZC4gV2hlbiBub3Qgc3BlY2lmaWVkIGRlZmF1bHRzIHRvIHRoZSB3b3JrZmxvdyBleGVjdXRpb25cbiAgICogdGltZW91dCAod2hpY2ggbWF5IGJlIHVuc2V0KS5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dD86IHN0cmluZyB8IG51bWJlcjtcblxuICAvKipcbiAgICogSWYgdGhlIGFjdGl2aXR5IGlzIHJldHJ5aW5nIGFuZCBiYWNrb2ZmIHdvdWxkIGV4Y2VlZCB0aGlzIHZhbHVlLCBhIHNlcnZlciBzaWRlIHRpbWVyIHdpbGwgYmUgc2NoZWR1bGVkIGZvciB0aGUgbmV4dCBhdHRlbXB0LlxuICAgKiBPdGhlcndpc2UsIGJhY2tvZmYgd2lsbCBoYXBwZW4gaW50ZXJuYWxseSBpbiB0aGUgU0RLLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxIG1pbnV0ZVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICoqL1xuICBsb2NhbFJldHJ5VGhyZXNob2xkPzogc3RyaW5nIHwgbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoYXQgdGhlIFNESyBkb2VzIHdoZW4gdGhlIEFjdGl2aXR5IGlzIGNhbmNlbGxlZC5cbiAgICogLSBgVFJZX0NBTkNFTGAgLSBJbml0aWF0ZSBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICogLSBgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEYCAtIFdhaXQgZm9yIGFjdGl2aXR5IGNhbmNlbGxhdGlvbiBjb21wbGV0aW9uLiBOb3RlIHRoYXQgYWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgdG8gcmVjZWl2ZSBhXG4gICAqICAgY2FuY2VsbGF0aW9uIG5vdGlmaWNhdGlvbi4gVGhpcyBjYW4gYmxvY2sgdGhlIGNhbmNlbGxhdGlvbiBmb3IgYSBsb25nIHRpbWUgaWYgYWN0aXZpdHkgZG9lc24ndFxuICAgKiAgIGhlYXJ0YmVhdCBvciBjaG9vc2VzIHRvIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqIC0gYEFCQU5ET05gIC0gRG8gbm90IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIHRoZSBhY3Rpdml0eSBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU7XG59XG4iLCJpbXBvcnQgeyBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlciwgRmFpbHVyZUNvbnZlcnRlciB9IGZyb20gJy4vZmFpbHVyZS1jb252ZXJ0ZXInO1xuaW1wb3J0IHsgUGF5bG9hZENvZGVjIH0gZnJvbSAnLi9wYXlsb2FkLWNvZGVjJztcbmltcG9ydCB7IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLCBQYXlsb2FkQ29udmVydGVyIH0gZnJvbSAnLi9wYXlsb2FkLWNvbnZlcnRlcic7XG5cbi8qKlxuICogV2hlbiB5b3VyIGRhdGEgKGFyZ3VtZW50cyBhbmQgcmV0dXJuIHZhbHVlcykgaXMgc2VudCBvdmVyIHRoZSB3aXJlIGFuZCBzdG9yZWQgYnkgVGVtcG9yYWwgU2VydmVyLCBpdCBpcyBlbmNvZGVkIGluXG4gKiBiaW5hcnkgaW4gYSB7QGxpbmsgUGF5bG9hZH0gUHJvdG9idWYgbWVzc2FnZS5cbiAqXG4gKiBUaGUgZGVmYXVsdCBgRGF0YUNvbnZlcnRlcmAgc3VwcG9ydHMgYHVuZGVmaW5lZGAsIGBVaW50OEFycmF5YCwgYW5kIEpTT04gc2VyaWFsaXphYmxlcyAoc28gaWZcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSNkZXNjcmlwdGlvbiB8IGBKU09OLnN0cmluZ2lmeSh5b3VyQXJnT3JSZXR2YWwpYH1cbiAqIHdvcmtzLCB0aGUgZGVmYXVsdCBkYXRhIGNvbnZlcnRlciB3aWxsIHdvcmspLiBQcm90b2J1ZnMgYXJlIHN1cHBvcnRlZCB2aWFcbiAqIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kYXRhLWNvbnZlcnRlcnMjcHJvdG9idWZzIHwgdGhpcyBBUEl9LlxuICpcbiAqIFVzZSBhIGN1c3RvbSBgRGF0YUNvbnZlcnRlcmAgdG8gY29udHJvbCB0aGUgY29udGVudHMgb2YgeW91ciB7QGxpbmsgUGF5bG9hZH1zLiBDb21tb24gcmVhc29ucyBmb3IgdXNpbmcgYSBjdXN0b21cbiAqIGBEYXRhQ29udmVydGVyYCBhcmU6XG4gKiAtIENvbnZlcnRpbmcgdmFsdWVzIHRoYXQgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIGRlZmF1bHQgYERhdGFDb252ZXJ0ZXJgIChmb3IgZXhhbXBsZSwgYEpTT04uc3RyaW5naWZ5KClgIGRvZXNuJ3RcbiAqICAgaGFuZGxlIGBCaWdJbnRgcywgc28gaWYgeW91IHdhbnQgdG8gcmV0dXJuIGB7IHRvdGFsOiAxMDAwbiB9YCBmcm9tIGEgV29ya2Zsb3csIFNpZ25hbCwgb3IgQWN0aXZpdHksIHlvdSBuZWVkIHlvdXJcbiAqICAgb3duIGBEYXRhQ29udmVydGVyYCkuXG4gKiAtIEVuY3J5cHRpbmcgdmFsdWVzIHRoYXQgbWF5IGNvbnRhaW4gcHJpdmF0ZSBpbmZvcm1hdGlvbiB0aGF0IHlvdSBkb24ndCB3YW50IHN0b3JlZCBpbiBwbGFpbnRleHQgaW4gVGVtcG9yYWwgU2VydmVyJ3NcbiAqICAgZGF0YWJhc2UuXG4gKiAtIENvbXByZXNzaW5nIHZhbHVlcyB0byByZWR1Y2UgZGlzayBvciBuZXR3b3JrIHVzYWdlLlxuICpcbiAqIFRvIHVzZSB5b3VyIGN1c3RvbSBgRGF0YUNvbnZlcnRlcmAsIHByb3ZpZGUgaXQgdG8gdGhlIHtAbGluayBXb3JrZmxvd0NsaWVudH0sIHtAbGluayBXb3JrZXJ9LCBhbmRcbiAqIHtAbGluayBidW5kbGVXb3JrZmxvd0NvZGV9IChpZiB5b3UgdXNlIGl0KTpcbiAqIC0gYG5ldyBXb3JrZmxvd0NsaWVudCh7IC4uLiwgZGF0YUNvbnZlcnRlciB9KWBcbiAqIC0gYFdvcmtlci5jcmVhdGUoeyAuLi4sIGRhdGFDb252ZXJ0ZXIgfSlgXG4gKiAtIGBidW5kbGVXb3JrZmxvd0NvZGUoeyAuLi4sIHBheWxvYWRDb252ZXJ0ZXJQYXRoIH0pYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERhdGFDb252ZXJ0ZXIge1xuICAvKipcbiAgICogUGF0aCBvZiBhIGZpbGUgdGhhdCBoYXMgYSBgcGF5bG9hZENvbnZlcnRlcmAgbmFtZWQgZXhwb3J0LlxuICAgKiBgcGF5bG9hZENvbnZlcnRlcmAgc2hvdWxkIGJlIGFuIG9iamVjdCB0aGF0IGltcGxlbWVudHMge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKiBJZiBubyBwYXRoIGlzIHByb3ZpZGVkLCB7QGxpbmsgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJ9IGlzIHVzZWQuXG4gICAqL1xuICBwYXlsb2FkQ29udmVydGVyUGF0aD86IHN0cmluZztcblxuICAvKipcbiAgICogUGF0aCBvZiBhIGZpbGUgdGhhdCBoYXMgYSBgZmFpbHVyZUNvbnZlcnRlcmAgbmFtZWQgZXhwb3J0LlxuICAgKiBgZmFpbHVyZUNvbnZlcnRlcmAgc2hvdWxkIGJlIGFuIG9iamVjdCB0aGF0IGltcGxlbWVudHMge0BsaW5rIEZhaWx1cmVDb252ZXJ0ZXJ9LlxuICAgKiBJZiBubyBwYXRoIGlzIHByb3ZpZGVkLCB7QGxpbmsgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGlzIHVzZWQuXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIGZhaWx1cmVDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZENvZGVjfSBpbnN0YW5jZXMuXG4gICAqXG4gICAqIFBheWxvYWRzIGFyZSBlbmNvZGVkIGluIHRoZSBvcmRlciBvZiB0aGUgYXJyYXkgYW5kIGRlY29kZWQgaW4gdGhlIG9wcG9zaXRlIG9yZGVyLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYVxuICAgKiBjb21wcmVzc2lvbiBjb2RlYyBhbmQgYW4gZW5jcnlwdGlvbiBjb2RlYywgdGhlbiB5b3Ugd2FudCBkYXRhIHRvIGJlIGVuY29kZWQgd2l0aCB0aGUgY29tcHJlc3Npb24gY29kZWMgZmlyc3QsIHNvXG4gICAqIHlvdSdkIGRvIGBwYXlsb2FkQ29kZWNzOiBbY29tcHJlc3Npb25Db2RlYywgZW5jcnlwdGlvbkNvZGVjXWAuXG4gICAqL1xuICBwYXlsb2FkQ29kZWNzPzogUGF5bG9hZENvZGVjW107XG59XG5cbi8qKlxuICogQSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0gdGhhdCBoYXMgYmVlbiBsb2FkZWQgdmlhIHtAbGluayBsb2FkRGF0YUNvbnZlcnRlcn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVkRGF0YUNvbnZlcnRlciB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXI7XG4gIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXI7XG4gIHBheWxvYWRDb2RlY3M6IFBheWxvYWRDb2RlY1tdO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBGYWlsdXJlQ29udmVydGVyfSB1c2VkIGJ5IHRoZSBTREsuXG4gKlxuICogRXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcmUgc2VyaXphbGl6ZWQgYXMgcGxhaW4gdGV4dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gbmV3IERlZmF1bHRGYWlsdXJlQ29udmVydGVyKCk7XG5cbi8qKlxuICogQSBcImxvYWRlZFwiIGRhdGEgY29udmVydGVyIHRoYXQgdXNlcyB0aGUgZGVmYXVsdCBzZXQgb2YgZmFpbHVyZSBhbmQgcGF5bG9hZCBjb252ZXJ0ZXJzLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdERhdGFDb252ZXJ0ZXI6IExvYWRlZERhdGFDb252ZXJ0ZXIgPSB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBmYWlsdXJlQ29udmVydGVyOiBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgcGF5bG9hZENvZGVjczogW10sXG59O1xuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBGQUlMVVJFX1NPVVJDRSxcbiAgUHJvdG9GYWlsdXJlLFxuICBSZXRyeVN0YXRlLFxuICBTZXJ2ZXJGYWlsdXJlLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFRlcm1pbmF0ZWRGYWlsdXJlLFxuICBUaW1lb3V0RmFpbHVyZSxcbiAgVGltZW91dFR5cGUsXG59IGZyb20gJy4uL2ZhaWx1cmUnO1xuaW1wb3J0IHsgaGFzT3duUHJvcGVydGllcywgaXNSZWNvcmQgfSBmcm9tICcuLi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgYXJyYXlGcm9tUGF5bG9hZHMsIGZyb21QYXlsb2Fkc0F0SW5kZXgsIFBheWxvYWRDb252ZXJ0ZXIsIHRvUGF5bG9hZHMgfSBmcm9tICcuL3BheWxvYWQtY29udmVydGVyJztcblxuLyoqXG4gKiBTdGFjayB0cmFjZXMgd2lsbCBiZSBjdXRvZmYgd2hlbiBvbiBvZiB0aGVzZSBwYXR0ZXJucyBpcyBtYXRjaGVkXG4gKi9cbmNvbnN0IENVVE9GRl9TVEFDS19QQVRURVJOUyA9IFtcbiAgLyoqIEFjdGl2aXR5IGV4ZWN1dGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2aXR5XFwuZXhlY3V0ZSBcXCguKltcXFxcL113b3JrZXJbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9dYWN0aXZpdHlcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgYWN0aXZhdGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2YXRvclxcLlxcUytOZXh0SGFuZGxlciBcXCguKltcXFxcL113b3JrZmxvd1tcXFxcL10oPzpzcmN8bGliKVtcXFxcL11pbnRlcm5hbHNcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgcnVuIGFueXRoaW5nIGluIGNvbnRleHQgKi9cbiAgL1xccythdCBTY3JpcHRcXC5ydW5JbkNvbnRleHQgXFwoKD86bm9kZTp2bXx2bVxcLmpzKTpcXGQrOlxcZCtcXCkvLFxuXTtcblxuLyoqXG4gKiBDdXRzIG91dCB0aGUgZnJhbWV3b3JrIHBhcnQgb2YgYSBzdGFjayB0cmFjZSwgbGVhdmluZyBvbmx5IHVzZXIgY29kZSBlbnRyaWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjdXRvZmZTdGFja1RyYWNlKHN0YWNrPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXMgPSAoc3RhY2sgPz8gJycpLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGFjYyA9IEFycmF5PHN0cmluZz4oKTtcbiAgbGluZUxvb3A6IGZvciAoY29uc3QgbGluZSBvZiBsaW5lcykge1xuICAgIGZvciAoY29uc3QgcGF0dGVybiBvZiBDVVRPRkZfU1RBQ0tfUEFUVEVSTlMpIHtcbiAgICAgIGlmIChwYXR0ZXJuLnRlc3QobGluZSkpIGJyZWFrIGxpbmVMb29wO1xuICAgIH1cbiAgICBhY2MucHVzaChsaW5lKTtcbiAgfVxuICByZXR1cm4gYWNjLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIEEgYEZhaWx1cmVDb252ZXJ0ZXJgIGlzIHJlc3BvbnNpYmxlIGZvciBjb252ZXJ0aW5nIGZyb20gcHJvdG8gYEZhaWx1cmVgIGluc3RhbmNlcyB0byBKUyBgRXJyb3JzYCBhbmQgYmFjay5cbiAqXG4gKiBXZSByZWNvbW1lbmRlZCB1c2luZyB0aGUge0BsaW5rIERlZmF1bHRGYWlsdXJlQ29udmVydGVyfSBpbnN0ZWFkIG9mIGN1c3RvbWl6aW5nIHRoZSBkZWZhdWx0IGltcGxlbWVudGF0aW9uIGluIG9yZGVyXG4gKiB0byBtYWludGFpbiBjcm9zcy1sYW5ndWFnZSBGYWlsdXJlIHNlcmlhbGl6YXRpb24gY29tcGF0aWJpbGl0eS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmFpbHVyZUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIGNhdWdodCBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZS5cbiAgICovXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0LlxuICAgKi9cbiAgZmFpbHVyZVRvRXJyb3IoZXJyOiBQcm90b0ZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBFcnJvcjtcbn1cblxuLyoqXG4gKiBUaGUgXCJzaGFwZVwiIG9mIHRoZSBhdHRyaWJ1dGVzIHNldCBhcyB0aGUge0BsaW5rIFByb3RvRmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlc30gcGF5bG9hZCBpbiBjYXNlXG4gKiB7QGxpbmsgRGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcy5lbmNvZGVDb21tb25BdHRyaWJ1dGVzfSBpcyBzZXQgdG8gYHRydWVgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXMge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHN0YWNrX3RyYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIHtAbGluayBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gY29uc3RydWN0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW5jb2RlIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgKGZvciBlbmNyeXB0aW5nIHRoZXNlIGF0dHJpYnV0ZXMgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30pLlxuICAgKi9cbiAgZW5jb2RlQ29tbW9uQXR0cmlidXRlczogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZhdWx0LCBjcm9zcy1sYW5ndWFnZS1jb21wYXRpYmxlIEZhaWx1cmUgY29udmVydGVyLlxuICpcbiAqIEJ5IGRlZmF1bHQsIGl0IHdpbGwgbGVhdmUgZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcyBwbGFpbiB0ZXh0LiBJbiBvcmRlciB0byBlbmNyeXB0IHRoZW0sIHNldFxuICogYGVuY29kZUNvbW1vbkF0dHJpYnV0ZXNgIHRvIGB0cnVlYCBpbiB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBhbmQgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30gdGhhdCBjYW4gZW5jcnlwdCAvXG4gKiBkZWNyeXB0IFBheWxvYWRzIGluIHlvdXIge0BsaW5rIFdvcmtlck9wdGlvbnMuZGF0YUNvbnZlcnRlciB8IFdvcmtlcn0gYW5kXG4gKiB7QGxpbmsgQ2xpZW50T3B0aW9ucy5kYXRhQ29udmVydGVyIHwgQ2xpZW50IG9wdGlvbnN9LlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRGYWlsdXJlQ29udmVydGVyIGltcGxlbWVudHMgRmFpbHVyZUNvbnZlcnRlciB7XG4gIHB1YmxpYyByZWFkb25seSBvcHRpb25zOiBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnM7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IFBhcnRpYWw8RGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zPikge1xuICAgIGNvbnN0IHsgZW5jb2RlQ29tbW9uQXR0cmlidXRlcyB9ID0gb3B0aW9ucyA/PyB7fTtcbiAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICBlbmNvZGVDb21tb25BdHRyaWJ1dGVzOiBlbmNvZGVDb21tb25BdHRyaWJ1dGVzID8/IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QuXG4gICAqXG4gICAqIERvZXMgbm90IHNldCBjb21tb24gcHJvcGVydGllcywgdGhhdCBpcyBkb25lIGluIHtAbGluayBmYWlsdXJlVG9FcnJvcn0uXG4gICAqL1xuICBmYWlsdXJlVG9FcnJvcklubmVyKGZhaWx1cmU6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZSB7XG4gICAgaWYgKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby50eXBlLFxuICAgICAgICBCb29sZWFuKGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby5ub25SZXRyeWFibGUpLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLmFwcGxpY2F0aW9uRmFpbHVyZUluZm8uZGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuc2VydmVyRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgU2VydmVyRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgQm9vbGVhbihmYWlsdXJlLnNlcnZlckZhaWx1cmVJbmZvLm5vblJldHJ5YWJsZSksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGltZW91dEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZyb21QYXlsb2Fkc0F0SW5kZXgocGF5bG9hZENvbnZlcnRlciwgMCwgZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8ubGFzdEhlYXJ0YmVhdERldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgZmFpbHVyZS50aW1lb3V0RmFpbHVyZUluZm8udGltZW91dFR5cGUgPz8gVGltZW91dFR5cGUuVElNRU9VVF9UWVBFX1VOU1BFQ0lGSUVEXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS50ZXJtaW5hdGVkRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgVGVybWluYXRlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5jYW5jZWxlZEZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IENhbmNlbGxlZEZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUuY2FuY2VsZWRGYWlsdXJlSW5mby5kZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5yZXNldFdvcmtmbG93RmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25GYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICAnUmVzZXRXb3JrZmxvdycsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBhcnJheUZyb21QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBmYWlsdXJlLnJlc2V0V29ya2Zsb3dGYWlsdXJlSW5mby5sYXN0SGVhcnRiZWF0RGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvKSB7XG4gICAgICBjb25zdCB7IG5hbWVzcGFjZSwgd29ya2Zsb3dUeXBlLCB3b3JrZmxvd0V4ZWN1dGlvbiwgcmV0cnlTdGF0ZSB9ID0gZmFpbHVyZS5jaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm87XG4gICAgICBpZiAoISh3b3JrZmxvd1R5cGU/Lm5hbWUgJiYgd29ya2Zsb3dFeGVjdXRpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBvbiBjaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUoXG4gICAgICAgIG5hbWVzcGFjZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIHdvcmtmbG93RXhlY3V0aW9uLFxuICAgICAgICB3b3JrZmxvd1R5cGUubmFtZSxcbiAgICAgICAgcmV0cnlTdGF0ZSA/PyBSZXRyeVN0YXRlLlJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVELFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mbykge1xuICAgICAgaWYgKCFmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlUeXBlPy5uYW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZpdHlUeXBlPy5uYW1lIG9uIGFjdGl2aXR5RmFpbHVyZUluZm8nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQWN0aXZpdHlGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uYWN0aXZpdHlUeXBlLm5hbWUsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eUlkID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLnJldHJ5U3RhdGUgPz8gUmV0cnlTdGF0ZS5SRVRSWV9TVEFURV9VTlNQRUNJRklFRCxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmlkZW50aXR5ID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVGVtcG9yYWxGYWlsdXJlKFxuICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgKTtcbiAgfVxuXG4gIGZhaWx1cmVUb0Vycm9yKGZhaWx1cmU6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IEVycm9yIHtcbiAgICBpZiAoZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cnMgPSBwYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkPERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXM+KGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMpO1xuICAgICAgLy8gRG9uJ3QgYXBwbHkgZW5jb2RlZEF0dHJpYnV0ZXMgdW5sZXNzIHRoZXkgY29uZm9ybSB0byBhbiBleHBlY3RlZCBzY2hlbWFcbiAgICAgIGlmICh0eXBlb2YgYXR0cnMgPT09ICdvYmplY3QnICYmIGF0dHJzICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tfdHJhY2UgfSA9IGF0dHJzO1xuICAgICAgICAvLyBBdm9pZCBtdXRhdGluZyB0aGUgYXJndW1lbnRcbiAgICAgICAgZmFpbHVyZSA9IHsgLi4uZmFpbHVyZSB9O1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZmFpbHVyZS5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHN0YWNrX3RyYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGZhaWx1cmUuc3RhY2tUcmFjZSA9IHN0YWNrX3RyYWNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVyciA9IHRoaXMuZmFpbHVyZVRvRXJyb3JJbm5lcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBlcnIuc3RhY2sgPSBmYWlsdXJlLnN0YWNrVHJhY2UgPz8gJyc7XG4gICAgZXJyLmZhaWx1cmUgPSBmYWlsdXJlO1xuICAgIHJldHVybiBlcnI7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSB0aGlzLmVycm9yVG9GYWlsdXJlSW5uZXIoZXJyLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuY29kZUNvbW1vbkF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tUcmFjZSB9ID0gZmFpbHVyZTtcbiAgICAgIGZhaWx1cmUubWVzc2FnZSA9ICdFbmNvZGVkIGZhaWx1cmUnO1xuICAgICAgZmFpbHVyZS5zdGFja1RyYWNlID0gJyc7XG4gICAgICBmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzID0gcGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQoeyBtZXNzYWdlLCBzdGFja190cmFjZTogc3RhY2tUcmFjZSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZUlubmVyKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgICAgaWYgKGVyci5mYWlsdXJlKSByZXR1cm4gZXJyLmZhaWx1cmU7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICAgIH07XG5cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBY3Rpdml0eUZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFjdGl2aXR5RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIGFjdGl2aXR5VHlwZTogeyBuYW1lOiBlcnIuYWN0aXZpdHlUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDaGlsZFdvcmtmbG93RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICAuLi5lcnIsXG4gICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjogZXJyLmV4ZWN1dGlvbixcbiAgICAgICAgICAgIHdvcmtmbG93VHlwZTogeyBuYW1lOiBlcnIud29ya2Zsb3dUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBcHBsaWNhdGlvbkZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFwcGxpY2F0aW9uRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHR5cGU6IGVyci50eXBlLFxuICAgICAgICAgICAgbm9uUmV0cnlhYmxlOiBlcnIubm9uUmV0cnlhYmxlLFxuICAgICAgICAgICAgZGV0YWlsczpcbiAgICAgICAgICAgICAgZXJyLmRldGFpbHMgJiYgZXJyLmRldGFpbHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIC4uLmVyci5kZXRhaWxzKSB9XG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjYW5jZWxlZEZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICBkZXRhaWxzOlxuICAgICAgICAgICAgICBlcnIuZGV0YWlscyAmJiBlcnIuZGV0YWlscy5sZW5ndGhcbiAgICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgLi4uZXJyLmRldGFpbHMpIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRpbWVvdXRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICB0aW1lb3V0RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHRpbWVvdXRUeXBlOiBlcnIudGltZW91dFR5cGUsXG4gICAgICAgICAgICBsYXN0SGVhcnRiZWF0RGV0YWlsczogZXJyLmxhc3RIZWFydGJlYXREZXRhaWxzXG4gICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBlcnIubGFzdEhlYXJ0YmVhdERldGFpbHMpIH1cbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUZXJtaW5hdGVkRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgdGVybWluYXRlZEZhaWx1cmVJbmZvOiB7fSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBTZXJ2ZXJGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBzZXJ2ZXJGYWlsdXJlSW5mbzogeyBub25SZXRyeWFibGU6IGVyci5ub25SZXRyeWFibGUgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIEp1c3QgYSBUZW1wb3JhbEZhaWx1cmVcbiAgICAgIHJldHVybiBiYXNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICBzb3VyY2U6IEZBSUxVUkVfU09VUkNFLFxuICAgIH07XG5cbiAgICBpZiAoaXNSZWNvcmQoZXJyKSAmJiBoYXNPd25Qcm9wZXJ0aWVzKGVyciwgWydtZXNzYWdlJywgJ3N0YWNrJ10pKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5iYXNlLFxuICAgICAgICBtZXNzYWdlOiBTdHJpbmcoZXJyLm1lc3NhZ2UpID8/ICcnLFxuICAgICAgICBzdGFja1RyYWNlOiBjdXRvZmZTdGFja1RyYWNlKFN0cmluZyhlcnIuc3RhY2spKSxcbiAgICAgICAgY2F1c2U6IHRoaXMub3B0aW9uYWxFcnJvclRvT3B0aW9uYWxGYWlsdXJlKGVyci5jYXVzZSwgcGF5bG9hZENvbnZlcnRlciksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHJlY29tbWVuZGF0aW9uID0gYCBbQSBub24tRXJyb3IgdmFsdWUgd2FzIHRocm93biBmcm9tIHlvdXIgY29kZS4gV2UgcmVjb21tZW5kIHRocm93aW5nIEVycm9yIG9iamVjdHMgc28gdGhhdCB3ZSBjYW4gcHJvdmlkZSBhIHN0YWNrIHRyYWNlXWA7XG5cbiAgICBpZiAodHlwZW9mIGVyciA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB7IC4uLmJhc2UsIG1lc3NhZ2U6IGVyciArIHJlY29tbWVuZGF0aW9uIH07XG4gICAgfVxuICAgIGlmICh0eXBlb2YgZXJyID09PSAnb2JqZWN0Jykge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnJztcbiAgICAgIHRyeSB7XG4gICAgICAgIG1lc3NhZ2UgPSBKU09OLnN0cmluZ2lmeShlcnIpO1xuICAgICAgfSBjYXRjaCAoX2Vycikge1xuICAgICAgICBtZXNzYWdlID0gU3RyaW5nKGVycik7XG4gICAgICB9XG4gICAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBtZXNzYWdlICsgcmVjb21tZW5kYXRpb24gfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBTdHJpbmcoZXJyKSArIHJlY29tbWVuZGF0aW9uIH07XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydHMgYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UgdG8gYSBKUyBFcnJvciBvYmplY3QgaWYgZGVmaW5lZCBvciByZXR1cm5zIHVuZGVmaW5lZC5cbiAgICovXG4gIG9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihcbiAgICBmYWlsdXJlOiBQcm90b0ZhaWx1cmUgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXJcbiAgKTogRXJyb3IgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKSA6IHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhbiBlcnJvciB0byBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSBpZiBkZWZpbmVkIG9yIHJldHVybnMgdW5kZWZpbmVkXG4gICAqL1xuICBvcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyOiB1bmtub3duLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogUHJvdG9GYWlsdXJlIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gZXJyID8gdGhpcy5lcnJvclRvRmFpbHVyZShlcnIsIHBheWxvYWRDb252ZXJ0ZXIpIDogdW5kZWZpbmVkO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi4vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogYFBheWxvYWRDb2RlY2AgaXMgYW4gb3B0aW9uYWwgc3RlcCB0aGF0IGhhcHBlbnMgYmV0d2VlbiB0aGUgd2lyZSBhbmQgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyfTpcbiAqXG4gKiBUZW1wb3JhbCBTZXJ2ZXIgPC0tPiBXaXJlIDwtLT4gYFBheWxvYWRDb2RlY2AgPC0tPiBgUGF5bG9hZENvbnZlcnRlcmAgPC0tPiBVc2VyIGNvZGVcbiAqXG4gKiBJbXBsZW1lbnQgdGhpcyB0byB0cmFuc2Zvcm0gYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyB0by9mcm9tIHRoZSBmb3JtYXQgc2VudCBvdmVyIHRoZSB3aXJlIGFuZCBzdG9yZWQgYnkgVGVtcG9yYWwgU2VydmVyLlxuICogQ29tbW9uIHRyYW5zZm9ybWF0aW9ucyBhcmUgZW5jcnlwdGlvbiBhbmQgY29tcHJlc3Npb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvZGVjIHtcbiAgLyoqXG4gICAqIEVuY29kZSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIGZvciBzZW5kaW5nIG92ZXIgdGhlIHdpcmUuXG4gICAqIEBwYXJhbSBwYXlsb2FkcyBNYXkgaGF2ZSBsZW5ndGggMC5cbiAgICovXG4gIGVuY29kZShwYXlsb2FkczogUGF5bG9hZFtdKTogUHJvbWlzZTxQYXlsb2FkW10+O1xuXG4gIC8qKlxuICAgKiBEZWNvZGUgYW4gYXJyYXkgb2Yge0BsaW5rIFBheWxvYWR9cyByZWNlaXZlZCBmcm9tIHRoZSB3aXJlLlxuICAgKi9cbiAgZGVjb2RlKHBheWxvYWRzOiBQYXlsb2FkW10pOiBQcm9taXNlPFBheWxvYWRbXT47XG59XG4iLCJpbXBvcnQgeyBkZWNvZGUsIGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcbmltcG9ydCB7IElsbGVnYWxTdGF0ZUVycm9yLCBQYXlsb2FkQ29udmVydGVyRXJyb3IsIFZhbHVlRXJyb3IgfSBmcm9tICcuLi9lcnJvcnMnO1xuaW1wb3J0IHsgUGF5bG9hZCB9IGZyb20gJy4uL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgZW5jb2RpbmdLZXlzLCBlbmNvZGluZ1R5cGVzLCBNRVRBREFUQV9FTkNPRElOR19LRVkgfSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBVc2VkIGJ5IHRoZSBmcmFtZXdvcmsgdG8gc2VyaWFsaXplL2Rlc2VyaWFsaXplIGRhdGEgbGlrZSBwYXJhbWV0ZXJzIGFuZCByZXR1cm4gdmFsdWVzLlxuICpcbiAqIFRoaXMgaXMgY2FsbGVkIGluc2lkZSB0aGUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RldGVybWluaXNtIHwgV29ya2Zsb3cgaXNvbGF0ZX0uXG4gKiBUbyB3cml0ZSBhc3luYyBjb2RlIG9yIHVzZSBOb2RlIEFQSXMgKG9yIHVzZSBwYWNrYWdlcyB0aGF0IHVzZSBOb2RlIEFQSXMpLCB1c2UgYSB7QGxpbmsgUGF5bG9hZENvZGVjfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29udmVydGVyIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gYSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC4gRXhhbXBsZSB2YWx1ZXMgaW5jbHVkZSB0aGUgV29ya2Zsb3cgYXJncyBzZW50IGZyb20gdGhlIENsaWVudCBhbmQgdGhlIHZhbHVlcyByZXR1cm5lZCBieSBhIFdvcmtmbG93IG9yIEFjdGl2aXR5LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBTaG91bGQgdGhyb3cge0BsaW5rIFZhbHVlRXJyb3J9IGlmIHVuYWJsZSB0byBjb252ZXJ0LlxuICAgKi9cbiAgdG9QYXlsb2FkPFQ+KHZhbHVlOiBUKTogUGF5bG9hZDtcblxuICAvKipcbiAgICogQ29udmVydHMgYSB7QGxpbmsgUGF5bG9hZH0gYmFjayB0byBhIHZhbHVlLlxuICAgKi9cbiAgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQ7XG59XG5cbi8qKlxuICogSW1wbGVtZW50cyBjb252ZXJzaW9uIG9mIGEgbGlzdCBvZiB2YWx1ZXMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIHZhbHVlcyBKUyB2YWx1ZXMgdG8gY29udmVydCB0byBQYXlsb2Fkc1xuICogQHJldHVybiBsaXN0IG9mIHtAbGluayBQYXlsb2FkfXNcbiAqIEB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgdGhlIHZhbHVlIHBhc3NlZCBhcyBwYXJhbWV0ZXIgZmFpbGVkIGZvciBhbnlcbiAqICAgICByZWFzb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1BheWxvYWRzKGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgLi4udmFsdWVzOiB1bmtub3duW10pOiBQYXlsb2FkW10gfCB1bmRlZmluZWQge1xuICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cblxuICByZXR1cm4gdmFsdWVzLm1hcCgodmFsdWUpID0+IGNvbnZlcnRlci50b1BheWxvYWQodmFsdWUpKTtcbn1cblxuLyoqXG4gKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkfSBvbiBlYWNoIHZhbHVlIGluIHRoZSBtYXAuXG4gKlxuICogQHRocm93cyB7QGxpbmsgVmFsdWVFcnJvcn0gaWYgY29udmVyc2lvbiBvZiBhbnkgdmFsdWUgaW4gdGhlIG1hcCBmYWlsc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbWFwVG9QYXlsb2FkczxLIGV4dGVuZHMgc3RyaW5nPihjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIG1hcDogUmVjb3JkPEssIGFueT4pOiBSZWNvcmQ8SywgUGF5bG9hZD4ge1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcCkubWFwKChbaywgdl0pOiBbSywgUGF5bG9hZF0gPT4gW2sgYXMgSywgY29udmVydGVyLnRvUGF5bG9hZCh2KV0pXG4gICkgYXMgUmVjb3JkPEssIFBheWxvYWQ+O1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgY29udmVyc2lvbiBvZiBhbiBhcnJheSBvZiB2YWx1ZXMgb2YgZGlmZmVyZW50IHR5cGVzLiBVc2VmdWwgZm9yIGRlc2VyaWFsaXppbmdcbiAqIGFyZ3VtZW50cyBvZiBmdW5jdGlvbiBpbnZvY2F0aW9ucy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyXG4gKiBAcGFyYW0gaW5kZXggaW5kZXggb2YgdGhlIHZhbHVlIGluIHRoZSBwYXlsb2Fkc1xuICogQHBhcmFtIHBheWxvYWRzIHNlcmlhbGl6ZWQgdmFsdWUgdG8gY29udmVydCB0byBKUyB2YWx1ZXMuXG4gKiBAcmV0dXJuIGNvbnZlcnRlZCBKUyB2YWx1ZVxuICogQHRocm93cyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlckVycm9yfSBpZiBjb252ZXJzaW9uIG9mIHRoZSBkYXRhIHBhc3NlZCBhcyBwYXJhbWV0ZXIgZmFpbGVkIGZvciBhbnlcbiAqICAgICByZWFzb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUGF5bG9hZHNBdEluZGV4PFQ+KGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgaW5kZXg6IG51bWJlciwgcGF5bG9hZHM/OiBQYXlsb2FkW10gfCBudWxsKTogVCB7XG4gIC8vIFRvIG1ha2UgYWRkaW5nIGFyZ3VtZW50cyBhIGJhY2t3YXJkcyBjb21wYXRpYmxlIGNoYW5nZVxuICBpZiAocGF5bG9hZHMgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkcyA9PT0gbnVsbCB8fCBpbmRleCA+PSBwYXlsb2Fkcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueTtcbiAgfVxuICByZXR1cm4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWRzW2luZGV4XSk7XG59XG5cbi8qKlxuICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkfSBvbiBlYWNoIHZhbHVlIGluIHRoZSBhcnJheS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFycmF5RnJvbVBheWxvYWRzKGNvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciwgcGF5bG9hZHM/OiBQYXlsb2FkW10gfCBudWxsKTogdW5rbm93bltdIHtcbiAgaWYgKCFwYXlsb2Fkcykge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICByZXR1cm4gcGF5bG9hZHMubWFwKChwYXlsb2FkOiBQYXlsb2FkKSA9PiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFwRnJvbVBheWxvYWRzPEsgZXh0ZW5kcyBzdHJpbmc+KFxuICBjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsXG4gIG1hcD86IFJlY29yZDxLLCBQYXlsb2FkPiB8IG51bGwgfCB1bmRlZmluZWRcbik6IFJlY29yZDxLLCB1bmtub3duPiB8IHVuZGVmaW5lZCB8IG51bGwge1xuICBpZiAobWFwID09IG51bGwpIHJldHVybiBtYXA7XG4gIHJldHVybiBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgT2JqZWN0LmVudHJpZXMobWFwKS5tYXAoKFtrLCBwYXlsb2FkXSk6IFtLLCB1bmtub3duXSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkIGFzIFBheWxvYWQpO1xuICAgICAgcmV0dXJuIFtrIGFzIEssIHZhbHVlXTtcbiAgICB9KVxuICApIGFzIFJlY29yZDxLLCB1bmtub3duPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgdmFsdWUgdG8gYSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC4gRXhhbXBsZSB2YWx1ZXMgaW5jbHVkZSB0aGUgV29ya2Zsb3cgYXJncyBzZW50IGZyb20gdGhlIENsaWVudCBhbmQgdGhlIHZhbHVlcyByZXR1cm5lZCBieSBhIFdvcmtmbG93IG9yIEFjdGl2aXR5LlxuICAgKiBAcmV0dXJucyBUaGUge0BsaW5rIFBheWxvYWR9LCBvciBgdW5kZWZpbmVkYCBpZiB1bmFibGUgdG8gY29udmVydC5cbiAgICovXG4gIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEge0BsaW5rIFBheWxvYWR9IGJhY2sgdG8gYSB2YWx1ZS5cbiAgICovXG4gIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUO1xuXG4gIHJlYWRvbmx5IGVuY29kaW5nVHlwZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFRyaWVzIHRvIGNvbnZlcnQgdmFsdWVzIHRvIHtAbGluayBQYXlsb2FkfXMgdXNpbmcgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nfXMgcHJvdmlkZWQgdG8gdGhlIGNvbnN0cnVjdG9yLCBpbiB0aGUgb3JkZXIgcHJvdmlkZWQuXG4gKlxuICogQ29udmVydHMgUGF5bG9hZHMgdG8gdmFsdWVzIGJhc2VkIG9uIHRoZSBgUGF5bG9hZC5tZXRhZGF0YS5lbmNvZGluZ2AgZmllbGQsIHdoaWNoIG1hdGNoZXMgdGhlIHtAbGluayBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nLmVuY29kaW5nVHlwZX1cbiAqIG9mIHRoZSBjb252ZXJ0ZXIgdGhhdCBjcmVhdGVkIHRoZSBQYXlsb2FkLlxuICovXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlUGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXIge1xuICByZWFkb25seSBjb252ZXJ0ZXJzOiBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nW107XG4gIHJlYWRvbmx5IGNvbnZlcnRlckJ5RW5jb2Rpbmc6IE1hcDxzdHJpbmcsIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmc+ID0gbmV3IE1hcCgpO1xuXG4gIGNvbnN0cnVjdG9yKC4uLmNvbnZlcnRlcnM6IFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmdbXSkge1xuICAgIGlmIChjb252ZXJ0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IFBheWxvYWRDb252ZXJ0ZXJFcnJvcignTXVzdCBwcm92aWRlIGF0IGxlYXN0IG9uZSBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nJyk7XG4gICAgfVxuXG4gICAgdGhpcy5jb252ZXJ0ZXJzID0gY29udmVydGVycztcbiAgICBmb3IgKGNvbnN0IGNvbnZlcnRlciBvZiBjb252ZXJ0ZXJzKSB7XG4gICAgICB0aGlzLmNvbnZlcnRlckJ5RW5jb2Rpbmcuc2V0KGNvbnZlcnRlci5lbmNvZGluZ1R5cGUsIGNvbnZlcnRlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWVzIHRvIHJ1biBgLnRvUGF5bG9hZCh2YWx1ZSlgIG9uIGVhY2ggY29udmVydGVyIGluIHRoZSBvcmRlciBwcm92aWRlZCBhdCBjb25zdHJ1Y3Rpb24uXG4gICAqIFJldHVybnMgdGhlIGZpcnN0IHN1Y2Nlc3NmdWwgcmVzdWx0LCB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIHRoZXJlIGlzIG5vIGNvbnZlcnRlciB0aGF0IGNhbiBoYW5kbGUgdGhlIHZhbHVlLlxuICAgKi9cbiAgcHVibGljIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQge1xuICAgIGZvciAoY29uc3QgY29udmVydGVyIG9mIHRoaXMuY29udmVydGVycykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29udmVydGVyLnRvUGF5bG9hZCh2YWx1ZSk7XG4gICAgICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgVW5hYmxlIHRvIGNvbnZlcnQgJHt2YWx1ZX0gdG8gcGF5bG9hZGApO1xuICB9XG5cbiAgLyoqXG4gICAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZy5mcm9tUGF5bG9hZH0gYmFzZWQgb24gdGhlIGBlbmNvZGluZ2AgbWV0YWRhdGEgb2YgdGhlIHtAbGluayBQYXlsb2FkfS5cbiAgICovXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkLm1ldGFkYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignTWlzc2luZyBwYXlsb2FkIG1ldGFkYXRhJyk7XG4gICAgfVxuICAgIGNvbnN0IGVuY29kaW5nID0gZGVjb2RlKHBheWxvYWQubWV0YWRhdGFbTUVUQURBVEFfRU5DT0RJTkdfS0VZXSk7XG4gICAgY29uc3QgY29udmVydGVyID0gdGhpcy5jb252ZXJ0ZXJCeUVuY29kaW5nLmdldChlbmNvZGluZyk7XG4gICAgaWYgKGNvbnZlcnRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgVW5rbm93biBlbmNvZGluZzogJHtlbmNvZGluZ31gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2FkKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gSlMgdW5kZWZpbmVkIGFuZCBOVUxMIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIFVuZGVmaW5lZFBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTDtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihfY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIHJldHVybiB1bmRlZmluZWQgYXMgYW55OyAvLyBKdXN0IHJldHVybiB1bmRlZmluZWRcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIGJldHdlZW4gYmluYXJ5IGRhdGEgdHlwZXMgYW5kIFJBVyBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBCaW5hcnlQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVztcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19SQVcsXG4gICAgICB9LFxuICAgICAgZGF0YTogdmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihjb250ZW50OiBQYXlsb2FkKTogVCB7XG4gICAgcmV0dXJuIGNvbnRlbnQuZGF0YSBhcyBhbnk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIG5vbi11bmRlZmluZWQgdmFsdWVzIGFuZCBzZXJpYWxpemVkIEpTT04gUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgSnNvblBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nIHtcbiAgcHVibGljIGVuY29kaW5nVHlwZSA9IGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTjtcblxuICBwdWJsaWMgdG9QYXlsb2FkKHZhbHVlOiB1bmtub3duKTogUGF5bG9hZCB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgbGV0IGpzb247XG4gICAgdHJ5IHtcbiAgICAgIGpzb24gPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19KU09OLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IGVuY29kZShqc29uKSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KGNvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAoY29udGVudC5kYXRhID09PSB1bmRlZmluZWQgfHwgY29udGVudC5kYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignR290IHBheWxvYWQgd2l0aCBubyBkYXRhJyk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZShjb250ZW50LmRhdGEpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIFNlYXJjaCBBdHRyaWJ1dGUgdmFsdWVzIHVzaW5nIEpzb25QYXlsb2FkQ29udmVydGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlciB7XG4gIGpzb25Db252ZXJ0ZXIgPSBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKTtcbiAgdmFsaWROb25EYXRlVHlwZXMgPSBbJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbiddO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWVzOiB1bmtub3duKTogUGF5bG9hZCB7XG4gICAgaWYgKCEodmFsdWVzIGluc3RhbmNlb2YgQXJyYXkpKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgU2VhcmNoQXR0cmlidXRlIHZhbHVlIG11c3QgYmUgYW4gYXJyYXlgKTtcbiAgICB9XG5cbiAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGZpcnN0VmFsdWUgPSB2YWx1ZXNbMF07XG4gICAgICBjb25zdCBmaXJzdFR5cGUgPSB0eXBlb2YgZmlyc3RWYWx1ZTtcbiAgICAgIGlmIChmaXJzdFR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgaWR4IGluIHZhbHVlcykge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gdmFsdWVzW2lkeF07XG4gICAgICAgICAgaWYgKCEodmFsdWUgaW5zdGFuY2VvZiBEYXRlKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoXG4gICAgICAgICAgICAgIGBTZWFyY2hBdHRyaWJ1dGUgdmFsdWVzIG11c3QgYXJyYXlzIG9mIHN0cmluZ3MsIG51bWJlcnMsIGJvb2xlYW5zLCBvciBEYXRlcy4gVGhlIHZhbHVlICR7dmFsdWV9IGF0IGluZGV4ICR7aWR4fSBpcyBvZiB0eXBlICR7dHlwZW9mIHZhbHVlfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIXRoaXMudmFsaWROb25EYXRlVHlwZXMuaW5jbHVkZXMoZmlyc3RUeXBlKSkge1xuICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBTZWFyY2hBdHRyaWJ1dGUgYXJyYXkgdmFsdWVzIG11c3QgYmU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBEYXRlYCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IGlkeCBpbiB2YWx1ZXMpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlc1tpZHhdO1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IGZpcnN0VHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoXG4gICAgICAgICAgICAgIGBBbGwgU2VhcmNoQXR0cmlidXRlIGFycmF5IHZhbHVlcyBtdXN0IGJlIG9mIHRoZSBzYW1lIHR5cGUuIFRoZSBmaXJzdCB2YWx1ZSAke2ZpcnN0VmFsdWV9IG9mIHR5cGUgJHtmaXJzdFR5cGV9IGRvZXNuJ3QgbWF0Y2ggdmFsdWUgJHt2YWx1ZX0gb2YgdHlwZSAke3R5cGVvZiB2YWx1ZX0gYXQgaW5kZXggJHtpZHh9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBKU09OLnN0cmluZ2lmeSB0YWtlcyBjYXJlIG9mIGNvbnZlcnRpbmcgRGF0ZXMgdG8gSVNPIHN0cmluZ3NcbiAgICBjb25zdCByZXQgPSB0aGlzLmpzb25Db252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlcyk7XG4gICAgaWYgKHJldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ0NvdWxkIG5vdCBjb252ZXJ0IHNlYXJjaCBhdHRyaWJ1dGVzIHRvIHBheWxvYWRzJyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvKipcbiAgICogRGF0ZXRpbWUgU2VhcmNoIEF0dHJpYnV0ZSB2YWx1ZXMgYXJlIGNvbnZlcnRlZCB0byBgRGF0ZWBzXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cblxuICAgIGNvbnN0IHZhbHVlID0gdGhpcy5qc29uQ29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpO1xuICAgIGxldCBhcnJheVdyYXBwZWRWYWx1ZSA9IHZhbHVlIGluc3RhbmNlb2YgQXJyYXkgPyB2YWx1ZSA6IFt2YWx1ZV07XG5cbiAgICBjb25zdCBzZWFyY2hBdHRyaWJ1dGVUeXBlID0gZGVjb2RlKHBheWxvYWQubWV0YWRhdGEudHlwZSk7XG4gICAgaWYgKHNlYXJjaEF0dHJpYnV0ZVR5cGUgPT09ICdEYXRldGltZScpIHtcbiAgICAgIGFycmF5V3JhcHBlZFZhbHVlID0gYXJyYXlXcmFwcGVkVmFsdWUubWFwKChkYXRlU3RyaW5nKSA9PiBuZXcgRGF0ZShkYXRlU3RyaW5nKSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheVdyYXBwZWRWYWx1ZSBhcyB1bmtub3duIGFzIFQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgU2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcigpO1xuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgZXh0ZW5kcyBDb21wb3NpdGVQYXlsb2FkQ29udmVydGVyIHtcbiAgLy8gTWF0Y2ggdGhlIG9yZGVyIHVzZWQgaW4gb3RoZXIgU0RLcywgYnV0IGV4Y2x1ZGUgUHJvdG9idWYgY29udmVydGVycyBzbyB0aGF0IHRoZSBjb2RlLCBpbmNsdWRpbmdcbiAgLy8gYHByb3RvMy1qc29uLXNlcmlhbGl6ZXJgLCBkb2Vzbid0IHRha2Ugc3BhY2UgaW4gV29ya2Zsb3cgYnVuZGxlcyB0aGF0IGRvbid0IHVzZSBQcm90b2J1ZnMuIFRvIHVzZSBQcm90b2J1ZnMsIHVzZVxuICAvLyB7QGxpbmsgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJXaXRoUHJvdG9idWZzfS5cbiAgLy9cbiAgLy8gR28gU0RLOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9zZGstZ28vYmxvYi81ZTU2NDVmMGM1NTBkY2Y3MTdjMDk1YWUzMmM3NmE3MDg3ZDJlOTg1L2NvbnZlcnRlci9kZWZhdWx0X2RhdGFfY29udmVydGVyLmdvI0wyOFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihuZXcgVW5kZWZpbmVkUGF5bG9hZENvbnZlcnRlcigpLCBuZXcgQmluYXJ5UGF5bG9hZENvbnZlcnRlcigpLCBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0gdXNlZCBieSB0aGUgU0RLLiBTdXBwb3J0cyBgVWludDhBcnJheWAgYW5kIEpTT04gc2VyaWFsaXphYmxlcyAoc28gaWZcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSNkZXNjcmlwdGlvbiB8IGBKU09OLnN0cmluZ2lmeSh5b3VyQXJnT3JSZXR2YWwpYH1cbiAqIHdvcmtzLCB0aGUgZGVmYXVsdCBwYXlsb2FkIGNvbnZlcnRlciB3aWxsIHdvcmspLlxuICpcbiAqIFRvIGFsc28gc3VwcG9ydCBQcm90b2J1ZnMsIGNyZWF0ZSBhIGN1c3RvbSBwYXlsb2FkIGNvbnZlcnRlciB3aXRoIHtAbGluayBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcn06XG4gKlxuICogYGNvbnN0IG15Q29udmVydGVyID0gbmV3IERlZmF1bHRQYXlsb2FkQ29udmVydGVyKHsgcHJvdG9idWZSb290IH0pYFxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIoKTtcbiIsImltcG9ydCB7IGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcblxuZXhwb3J0IGNvbnN0IE1FVEFEQVRBX0VOQ09ESU5HX0tFWSA9ICdlbmNvZGluZyc7XG5leHBvcnQgY29uc3QgZW5jb2RpbmdUeXBlcyA9IHtcbiAgTUVUQURBVEFfRU5DT0RJTkdfTlVMTDogJ2JpbmFyeS9udWxsJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUkFXOiAnYmluYXJ5L3BsYWluJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfSlNPTjogJ2pzb24vcGxhaW4nLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiAnanNvbi9wcm90b2J1ZicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGOiAnYmluYXJ5L3Byb3RvYnVmJyxcbn0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBFbmNvZGluZ1R5cGUgPSB0eXBlb2YgZW5jb2RpbmdUeXBlc1trZXlvZiB0eXBlb2YgZW5jb2RpbmdUeXBlc107XG5cbmV4cG9ydCBjb25zdCBlbmNvZGluZ0tleXMgPSB7XG4gIE1FVEFEQVRBX0VOQ09ESU5HX05VTEw6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwpLFxuICBNRVRBREFUQV9FTkNPRElOR19SQVc6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1JBVyksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX0pTT046IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT04pLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiBlbmNvZGUoZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUY6IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGKSxcbn0gYXMgY29uc3Q7XG5cbmV4cG9ydCBjb25zdCBNRVRBREFUQV9NRVNTQUdFX1RZUEVfS0VZID0gJ21lc3NhZ2VUeXBlJztcbiIsImltcG9ydCAqIGFzIHRpbWUgZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IFRpbWVzdGFtcCB9IGZyb20gJy4vdGltZSc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUub3B0aW9uYWxUc1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvd1xuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgcmV0dXJuIHRpbWUudHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIHRpbWUubXNOdW1iZXJUb1RzKG1pbGxpcyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IHN0cmluZyB8IG51bWJlcik6IFRpbWVzdGFtcCB7XG4gIHJldHVybiB0aW1lLm1zVG9UcyhzdHIpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9UcyhzdHI6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb1RzKHN0cik7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb051bWJlcih2YWwpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc1RvTnVtYmVyKHZhbDogc3RyaW5nIHwgbnVtYmVyKTogbnVtYmVyIHtcbiAgcmV0dXJuIHRpbWUubXNUb051bWJlcih2YWwpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvRGF0ZSh0czogVGltZXN0YW1wKTogRGF0ZSB7XG4gIHJldHVybiB0aW1lLnRzVG9EYXRlKHRzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvRGF0ZSh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IERhdGUgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5vcHRpb25hbFRzVG9EYXRlKHRzKTtcbn1cbiIsIi8vIFBhc3RlZCB3aXRoIG1vZGlmaWNhdGlvbnMgZnJvbTogaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2Fub255Y28vRmFzdGVzdFNtYWxsZXN0VGV4dEVuY29kZXJEZWNvZGVyL21hc3Rlci9FbmNvZGVyRGVjb2RlclRvZ2V0aGVyLnNyYy5qc1xuLyogZXNsaW50IG5vLWZhbGx0aHJvdWdoOiAwICovXG5cbmNvbnN0IGZyb21DaGFyQ29kZSA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5jb25zdCBlbmNvZGVyUmVnZXhwID0gL1tcXHg4MC1cXHVEN2ZmXFx1REMwMC1cXHVGRkZGXXxbXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdPy9nO1xuY29uc3QgdG1wQnVmZmVyVTE2ID0gbmV3IFVpbnQxNkFycmF5KDMyKTtcblxuZXhwb3J0IGNsYXNzIFRleHREZWNvZGVyIHtcbiAgZGVjb2RlKGlucHV0QXJyYXlPckJ1ZmZlcjogVWludDhBcnJheSB8IEFycmF5QnVmZmVyIHwgU2hhcmVkQXJyYXlCdWZmZXIpOiBzdHJpbmcge1xuICAgIGNvbnN0IGlucHV0QXM4ID0gaW5wdXRBcnJheU9yQnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA/IGlucHV0QXJyYXlPckJ1ZmZlciA6IG5ldyBVaW50OEFycmF5KGlucHV0QXJyYXlPckJ1ZmZlcik7XG5cbiAgICBsZXQgcmVzdWx0aW5nU3RyaW5nID0gJycsXG4gICAgICB0bXBTdHIgPSAnJyxcbiAgICAgIGluZGV4ID0gMCxcbiAgICAgIG5leHRFbmQgPSAwLFxuICAgICAgY3AwID0gMCxcbiAgICAgIGNvZGVQb2ludCA9IDAsXG4gICAgICBtaW5CaXRzID0gMCxcbiAgICAgIGNwMSA9IDAsXG4gICAgICBwb3MgPSAwLFxuICAgICAgdG1wID0gLTE7XG4gICAgY29uc3QgbGVuID0gaW5wdXRBczgubGVuZ3RoIHwgMDtcbiAgICBjb25zdCBsZW5NaW51czMyID0gKGxlbiAtIDMyKSB8IDA7XG4gICAgLy8gTm90ZSB0aGF0IHRtcCByZXByZXNlbnRzIHRoZSAybmQgaGFsZiBvZiBhIHN1cnJvZ2F0ZSBwYWlyIGluY2FzZSBhIHN1cnJvZ2F0ZSBnZXRzIGRpdmlkZWQgYmV0d2VlbiBibG9ja3NcbiAgICBmb3IgKDsgaW5kZXggPCBsZW47ICkge1xuICAgICAgbmV4dEVuZCA9IGluZGV4IDw9IGxlbk1pbnVzMzIgPyAzMiA6IChsZW4gLSBpbmRleCkgfCAwO1xuICAgICAgZm9yICg7IHBvcyA8IG5leHRFbmQ7IGluZGV4ID0gKGluZGV4ICsgMSkgfCAwLCBwb3MgPSAocG9zICsgMSkgfCAwKSB7XG4gICAgICAgIGNwMCA9IGlucHV0QXM4W2luZGV4XSAmIDB4ZmY7XG4gICAgICAgIHN3aXRjaCAoY3AwID4+IDQpIHtcbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgaWYgKGNwMSA+PiA2ICE9PSAwYjEwIHx8IDBiMTExMTAxMTEgPCBjcDApIHtcbiAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggLSAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29kZVBvaW50ID0gKChjcDAgJiAwYjExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gNTsgLy8gMjAgZW5zdXJlcyBpdCBuZXZlciBwYXNzZXMgLT4gYWxsIGludmFsaWQgcmVwbGFjZW1lbnRzXG4gICAgICAgICAgICBjcDAgPSAweDEwMDsgLy8gIGtlZXAgdHJhY2sgb2YgdGggYml0IHNpemVcbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgY29kZVBvaW50IDw8PSA2O1xuICAgICAgICAgICAgY29kZVBvaW50IHw9ICgoY3AwICYgMGIxMTExKSA8PCA2KSB8IChjcDEgJiAwYjAwMTExMTExKTtcbiAgICAgICAgICAgIG1pbkJpdHMgPSBjcDEgPj4gNiA9PT0gMGIxMCA/IChtaW5CaXRzICsgNCkgfCAwIDogMjQ7IC8vIDI0IGVuc3VyZXMgaXQgbmV2ZXIgcGFzc2VzIC0+IGFsbCBpbnZhbGlkIHJlcGxhY2VtZW50c1xuICAgICAgICAgICAgY3AwID0gKGNwMCArIDB4MTAwKSAmIDB4MzAwOyAvLyBrZWVwIHRyYWNrIG9mIHRoIGJpdCBzaXplXG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICBjYXNlIDEyOlxuICAgICAgICAgICAgY3AxID0gaW5wdXRBczhbKGluZGV4ID0gKGluZGV4ICsgMSkgfCAwKV0gJiAweGZmO1xuICAgICAgICAgICAgY29kZVBvaW50IDw8PSA2O1xuICAgICAgICAgICAgY29kZVBvaW50IHw9ICgoY3AwICYgMGIxMTExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gKG1pbkJpdHMgKyA3KSB8IDA7XG5cbiAgICAgICAgICAgIC8vIE5vdywgcHJvY2VzcyB0aGUgY29kZSBwb2ludFxuICAgICAgICAgICAgaWYgKGluZGV4IDwgbGVuICYmIGNwMSA+PiA2ID09PSAwYjEwICYmIGNvZGVQb2ludCA+PiBtaW5CaXRzICYmIGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNwMCA9IGNvZGVQb2ludDtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gKGNvZGVQb2ludCAtIDB4MTAwMDApIHwgMDtcbiAgICAgICAgICAgICAgaWYgKDAgPD0gY29kZVBvaW50IC8qMHhmZmZmIDwgY29kZVBvaW50Ki8pIHtcbiAgICAgICAgICAgICAgICAvLyBCTVAgY29kZSBwb2ludFxuICAgICAgICAgICAgICAgIC8vbmV4dEVuZCA9IG5leHRFbmQgLSAxfDA7XG5cbiAgICAgICAgICAgICAgICB0bXAgPSAoKGNvZGVQb2ludCA+PiAxMCkgKyAweGQ4MDApIHwgMDsgLy8gaGlnaFN1cnJvZ2F0ZVxuICAgICAgICAgICAgICAgIGNwMCA9ICgoY29kZVBvaW50ICYgMHgzZmYpICsgMHhkYzAwKSB8IDA7IC8vIGxvd1N1cnJvZ2F0ZSAod2lsbCBiZSBpbnNlcnRlZCBsYXRlciBpbiB0aGUgc3dpdGNoLXN0YXRlbWVudClcblxuICAgICAgICAgICAgICAgIGlmIChwb3MgPCAzMSkge1xuICAgICAgICAgICAgICAgICAgLy8gbm90aWNlIDMxIGluc3RlYWQgb2YgMzJcbiAgICAgICAgICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gdG1wO1xuICAgICAgICAgICAgICAgICAgcG9zID0gKHBvcyArIDEpIHwgMDtcbiAgICAgICAgICAgICAgICAgIHRtcCA9IC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAvLyBlbHNlLCB3ZSBhcmUgYXQgdGhlIGVuZCBvZiB0aGUgaW5wdXRBczggYW5kIGxldCB0bXAwIGJlIGZpbGxlZCBpbiBsYXRlciBvblxuICAgICAgICAgICAgICAgICAgLy8gTk9URSB0aGF0IGNwMSBpcyBiZWluZyB1c2VkIGFzIGEgdGVtcG9yYXJ5IHZhcmlhYmxlIGZvciB0aGUgc3dhcHBpbmcgb2YgdG1wIHdpdGggY3AwXG4gICAgICAgICAgICAgICAgICBjcDEgPSB0bXA7XG4gICAgICAgICAgICAgICAgICB0bXAgPSBjcDA7XG4gICAgICAgICAgICAgICAgICBjcDAgPSBjcDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2UgbmV4dEVuZCA9IChuZXh0RW5kICsgMSkgfCAwOyAvLyBiZWNhdXNlIHdlIGFyZSBhZHZhbmNpbmcgaSB3aXRob3V0IGFkdmFuY2luZyBwb3NcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGludmFsaWQgY29kZSBwb2ludCBtZWFucyByZXBsYWNpbmcgdGhlIHdob2xlIHRoaW5nIHdpdGggbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgIGNwMCA+Pj0gODtcbiAgICAgICAgICAgICAgaW5kZXggPSAoaW5kZXggLSBjcDAgLSAxKSB8IDA7IC8vIHJlc2V0IGluZGV4ICBiYWNrIHRvIHdoYXQgaXQgd2FzIGJlZm9yZVxuICAgICAgICAgICAgICBjcDAgPSAweGZmZmQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZpbmFsbHksIHJlc2V0IHRoZSB2YXJpYWJsZXMgZm9yIHRoZSBuZXh0IGdvLWFyb3VuZFxuICAgICAgICAgICAgbWluQml0cyA9IDA7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSAwO1xuICAgICAgICAgICAgbmV4dEVuZCA9IGluZGV4IDw9IGxlbk1pbnVzMzIgPyAzMiA6IChsZW4gLSBpbmRleCkgfCAwO1xuICAgICAgICAgIC8qY2FzZSAxMTpcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgY2FzZSA5OlxuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgY29kZVBvaW50ID8gY29kZVBvaW50ID0gMCA6IGNwMCA9IDB4ZmZmZDsgLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgY2FzZSA2OlxuICAgICAgICBjYXNlIDU6XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICBjYXNlIDI6XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gY3AwO1xuICAgICAgICAgIGNvbnRpbnVlOyovXG4gICAgICAgICAgZGVmYXVsdDogLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IGNwMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgY2FzZSA4OlxuICAgICAgICB9XG4gICAgICAgIHRtcEJ1ZmZlclUxNltwb3NdID0gMHhmZmZkOyAvLyBmaWxsIHdpdGggaW52YWxpZCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcbiAgICAgIH1cbiAgICAgIHRtcFN0ciArPSBmcm9tQ2hhckNvZGUoXG4gICAgICAgIHRtcEJ1ZmZlclUxNlswXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzFdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzRdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzddLFxuICAgICAgICB0bXBCdWZmZXJVMTZbOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzExXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzEzXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzE5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIxXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIyXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzIzXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI1XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI2XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI4XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzI5XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzMwXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzMxXVxuICAgICAgKTtcbiAgICAgIGlmIChwb3MgPCAzMikgdG1wU3RyID0gdG1wU3RyLnNsaWNlKDAsIChwb3MgLSAzMikgfCAwKTsgLy8tKDMyLXBvcykpO1xuICAgICAgaWYgKGluZGV4IDwgbGVuKSB7XG4gICAgICAgIC8vZnJvbUNoYXJDb2RlLmFwcGx5KDAsIHRtcEJ1ZmZlclUxNiA6IFVpbnQ4QXJyYXkgPyAgdG1wQnVmZmVyVTE2LnN1YmFycmF5KDAscG9zKSA6IHRtcEJ1ZmZlclUxNi5zbGljZSgwLHBvcykpO1xuICAgICAgICB0bXBCdWZmZXJVMTZbMF0gPSB0bXA7XG4gICAgICAgIHBvcyA9IH50bXAgPj4+IDMxOyAvL3RtcCAhPT0gLTEgPyAxIDogMDtcbiAgICAgICAgdG1wID0gLTE7XG5cbiAgICAgICAgaWYgKHRtcFN0ci5sZW5ndGggPCByZXN1bHRpbmdTdHJpbmcubGVuZ3RoKSBjb250aW51ZTtcbiAgICAgIH0gZWxzZSBpZiAodG1wICE9PSAtMSkge1xuICAgICAgICB0bXBTdHIgKz0gZnJvbUNoYXJDb2RlKHRtcCk7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdGluZ1N0cmluZyArPSB0bXBTdHI7XG4gICAgICB0bXBTdHIgPSAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0aW5nU3RyaW5nO1xuICB9XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBlbmNvZGVyUmVwbGFjZXIobm9uQXNjaWlDaGFyczogc3RyaW5nKSB7XG4gIC8vIG1ha2UgdGhlIFVURiBzdHJpbmcgaW50byBhIGJpbmFyeSBVVEYtOCBlbmNvZGVkIHN0cmluZ1xuICBsZXQgcG9pbnQgPSBub25Bc2NpaUNoYXJzLmNoYXJDb2RlQXQoMCkgfCAwO1xuICBpZiAoMHhkODAwIDw9IHBvaW50KSB7XG4gICAgaWYgKHBvaW50IDw9IDB4ZGJmZikge1xuICAgICAgY29uc3QgbmV4dGNvZGUgPSBub25Bc2NpaUNoYXJzLmNoYXJDb2RlQXQoMSkgfCAwOyAvLyBkZWZhdWx0cyB0byAwIHdoZW4gTmFOLCBjYXVzaW5nIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG5cbiAgICAgIGlmICgweGRjMDAgPD0gbmV4dGNvZGUgJiYgbmV4dGNvZGUgPD0gMHhkZmZmKSB7XG4gICAgICAgIC8vcG9pbnQgPSAoKHBvaW50IC0gMHhEODAwKTw8MTApICsgbmV4dGNvZGUgLSAweERDMDAgKyAweDEwMDAwfDA7XG4gICAgICAgIHBvaW50ID0gKChwb2ludCA8PCAxMCkgKyBuZXh0Y29kZSAtIDB4MzVmZGMwMCkgfCAwO1xuICAgICAgICBpZiAocG9pbnQgPiAweGZmZmYpXG4gICAgICAgICAgcmV0dXJuIGZyb21DaGFyQ29kZShcbiAgICAgICAgICAgICgweDFlIC8qMGIxMTExMCovIDw8IDMpIHwgKHBvaW50ID4+IDE4KSxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDEyKSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gNikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqL1xuICAgICAgICAgICk7XG4gICAgICB9IGVsc2UgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4ZGZmZikge1xuICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICB9XG4gIH1cbiAgLyppZiAocG9pbnQgPD0gMHgwMDdmKSByZXR1cm4gbm9uQXNjaWlDaGFycztcbiAgZWxzZSAqLyBpZiAocG9pbnQgPD0gMHgwN2ZmKSB7XG4gICAgcmV0dXJuIGZyb21DaGFyQ29kZSgoMHg2IDw8IDUpIHwgKHBvaW50ID4+IDYpLCAoMHgyIDw8IDYpIHwgKHBvaW50ICYgMHgzZikpO1xuICB9IGVsc2VcbiAgICByZXR1cm4gZnJvbUNoYXJDb2RlKFxuICAgICAgKDB4ZSAvKjBiMTExMCovIDw8IDQpIHwgKHBvaW50ID4+IDEyKSxcbiAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi9cbiAgICApO1xufVxuXG5leHBvcnQgY2xhc3MgVGV4dEVuY29kZXIge1xuICBwdWJsaWMgZW5jb2RlKGlucHV0U3RyaW5nOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgICAvLyAweGMwID0+IDBiMTEwMDAwMDA7IDB4ZmYgPT4gMGIxMTExMTExMTsgMHhjMC0weGZmID0+IDBiMTF4eHh4eHhcbiAgICAvLyAweDgwID0+IDBiMTAwMDAwMDA7IDB4YmYgPT4gMGIxMDExMTExMTsgMHg4MC0weGJmID0+IDBiMTB4eHh4eHhcbiAgICBjb25zdCBlbmNvZGVkU3RyaW5nID0gaW5wdXRTdHJpbmcgPT09IHZvaWQgMCA/ICcnIDogJycgKyBpbnB1dFN0cmluZyxcbiAgICAgIGxlbiA9IGVuY29kZWRTdHJpbmcubGVuZ3RoIHwgMDtcbiAgICBsZXQgcmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkoKChsZW4gPDwgMSkgKyA4KSB8IDApO1xuICAgIGxldCB0bXBSZXN1bHQ6IFVpbnQ4QXJyYXk7XG4gICAgbGV0IGkgPSAwLFxuICAgICAgcG9zID0gMCxcbiAgICAgIHBvaW50ID0gMCxcbiAgICAgIG5leHRjb2RlID0gMDtcbiAgICBsZXQgdXBncmFkZWRlZEFycmF5U2l6ZSA9ICFVaW50OEFycmF5OyAvLyBub3JtYWwgYXJyYXlzIGFyZSBhdXRvLWV4cGFuZGluZ1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgPSAoaSArIDEpIHwgMCwgcG9zID0gKHBvcyArIDEpIHwgMCkge1xuICAgICAgcG9pbnQgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoaSkgfCAwO1xuICAgICAgaWYgKHBvaW50IDw9IDB4MDA3Zikge1xuICAgICAgICByZXN1bHRbcG9zXSA9IHBvaW50O1xuICAgICAgfSBlbHNlIGlmIChwb2ludCA8PSAweDA3ZmYpIHtcbiAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHg2IDw8IDUpIHwgKHBvaW50ID4+IDYpO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgPDwgNikgfCAocG9pbnQgJiAweDNmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpZGVuQ2hlY2s6IHtcbiAgICAgICAgICBpZiAoMHhkODAwIDw9IHBvaW50KSB7XG4gICAgICAgICAgICBpZiAocG9pbnQgPD0gMHhkYmZmKSB7XG4gICAgICAgICAgICAgIG5leHRjb2RlID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KChpID0gKGkgKyAxKSB8IDApKSB8IDA7IC8vIGRlZmF1bHRzIHRvIDAgd2hlbiBOYU4sIGNhdXNpbmcgbnVsbCByZXBsYWNlbWVudCBjaGFyYWN0ZXJcblxuICAgICAgICAgICAgICBpZiAoMHhkYzAwIDw9IG5leHRjb2RlICYmIG5leHRjb2RlIDw9IDB4ZGZmZikge1xuICAgICAgICAgICAgICAgIC8vcG9pbnQgPSAoKHBvaW50IC0gMHhEODAwKTw8MTApICsgbmV4dGNvZGUgLSAweERDMDAgKyAweDEwMDAwfDA7XG4gICAgICAgICAgICAgICAgcG9pbnQgPSAoKHBvaW50IDw8IDEwKSArIG5leHRjb2RlIC0gMHgzNWZkYzAwKSB8IDA7XG4gICAgICAgICAgICAgICAgaWYgKHBvaW50ID4gMHhmZmZmKSB7XG4gICAgICAgICAgICAgICAgICByZXN1bHRbcG9zXSA9ICgweDFlIC8qMGIxMTExMCovIDw8IDMpIHwgKHBvaW50ID4+IDE4KTtcbiAgICAgICAgICAgICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8ICgocG9pbnQgPj4gMTIpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhayB3aWRlbkNoZWNrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHBvaW50IDw9IDB4ZGZmZikge1xuICAgICAgICAgICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXVwZ3JhZGVkZWRBcnJheVNpemUgJiYgaSA8PCAxIDwgcG9zICYmIGkgPDwgMSA8ICgocG9zIC0gNykgfCAwKSkge1xuICAgICAgICAgICAgdXBncmFkZWRlZEFycmF5U2l6ZSA9IHRydWU7XG4gICAgICAgICAgICB0bXBSZXN1bHQgPSBuZXcgVWludDhBcnJheShsZW4gKiAzKTtcbiAgICAgICAgICAgIHRtcFJlc3VsdC5zZXQocmVzdWx0KTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHRtcFJlc3VsdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHhlIC8qMGIxMTEwKi8gPDwgNCkgfCAocG9pbnQgPj4gMTIpO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgIHJlc3VsdFsocG9zID0gKHBvcyArIDEpIHwgMCldID0gKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gVWludDhBcnJheSA/IHJlc3VsdC5zdWJhcnJheSgwLCBwb3MpIDogcmVzdWx0LnNsaWNlKDAsIHBvcyk7XG4gIH1cblxuICBwdWJsaWMgZW5jb2RlSW50byhpbnB1dFN0cmluZzogc3RyaW5nLCB1OEFycjogVWludDhBcnJheSk6IHsgd3JpdHRlbjogbnVtYmVyOyByZWFkOiBudW1iZXIgfSB7XG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGlucHV0U3RyaW5nID09PSB2b2lkIDAgPyAnJyA6ICgnJyArIGlucHV0U3RyaW5nKS5yZXBsYWNlKGVuY29kZXJSZWdleHAsIGVuY29kZXJSZXBsYWNlcik7XG4gICAgbGV0IGxlbiA9IGVuY29kZWRTdHJpbmcubGVuZ3RoIHwgMCxcbiAgICAgIGkgPSAwLFxuICAgICAgY2hhciA9IDAsXG4gICAgICByZWFkID0gMDtcbiAgICBjb25zdCB1OEFyckxlbiA9IHU4QXJyLmxlbmd0aCB8IDA7XG4gICAgY29uc3QgaW5wdXRMZW5ndGggPSBpbnB1dFN0cmluZy5sZW5ndGggfCAwO1xuICAgIGlmICh1OEFyckxlbiA8IGxlbikgbGVuID0gdThBcnJMZW47XG4gICAgcHV0Q2hhcnM6IHtcbiAgICAgIGZvciAoOyBpIDwgbGVuOyBpID0gKGkgKyAxKSB8IDApIHtcbiAgICAgICAgY2hhciA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdChpKSB8IDA7XG4gICAgICAgIHN3aXRjaCAoY2hhciA+PiA0KSB7XG4gICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAvLyBleHRlbnNpb24gcG9pbnRzOlxuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICBjYXNlIDEzOlxuICAgICAgICAgICAgaWYgKCgoaSArIDEpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgMTQ6XG4gICAgICAgICAgICBpZiAoKChpICsgMikgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIC8vaWYgKCEoY2hhciA9PT0gMHhFRiAmJiBlbmNvZGVkU3RyaW5nLnN1YnN0cihpKzF8MCwyKSA9PT0gXCJcXHhCRlxceEJEXCIpKVxuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGNhc2UgMTU6XG4gICAgICAgICAgICBpZiAoKChpICsgMykgfCAwKSA8IHU4QXJyTGVuKSB7XG4gICAgICAgICAgICAgIHJlYWQgPSAocmVhZCArIDEpIHwgMDtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGJyZWFrIHB1dENoYXJzO1xuICAgICAgICB9XG4gICAgICAgIC8vcmVhZCA9IHJlYWQgKyAoKGNoYXIgPj4gNikgIT09IDIpIHwwO1xuICAgICAgICB1OEFycltpXSA9IGNoYXI7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7IHdyaXR0ZW46IGksIHJlYWQ6IGlucHV0TGVuZ3RoIDwgcmVhZCA/IGlucHV0TGVuZ3RoIDogcmVhZCB9O1xuICB9XG59XG5cbi8qKlxuICogRW5jb2RlIGEgVVRGLTggc3RyaW5nIGludG8gYSBVaW50OEFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGUoczogc3RyaW5nKTogVWludDhBcnJheSB7XG4gIHJldHVybiBUZXh0RW5jb2Rlci5wcm90b3R5cGUuZW5jb2RlKHMpO1xufVxuXG4vKipcbiAqIERlY29kZSBhIFVpbnQ4QXJyYXkgaW50byBhIFVURi04IHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlKGE6IFVpbnQ4QXJyYXkpOiBzdHJpbmcge1xuICByZXR1cm4gVGV4dERlY29kZXIucHJvdG90eXBlLmRlY29kZShhKTtcbn1cbiIsIi8qKlxuICogVGhyb3duIGZyb20gY29kZSB0aGF0IHJlY2VpdmVzIGEgdmFsdWUgdGhhdCBpcyB1bmV4cGVjdGVkIG9yIHRoYXQgaXQncyB1bmFibGUgdG8gaGFuZGxlLlxuICovXG5leHBvcnQgY2xhc3MgVmFsdWVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyA9ICdWYWx1ZUVycm9yJztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsIHB1YmxpYyByZWFkb25seSBjYXVzZT86IHVua25vd24pIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIFBheWxvYWQgQ29udmVydGVyIGlzIG1pc2NvbmZpZ3VyZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXlsb2FkQ29udmVydGVyRXJyb3IgZXh0ZW5kcyBWYWx1ZUVycm9yIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyA9ICdQYXlsb2FkQ29udmVydGVyRXJyb3InO1xufVxuXG4vKipcbiAqIFVzZWQgaW4gZGlmZmVyZW50IHBhcnRzIG9mIHRoZSBTREsgdG8gbm90ZSB0aGF0IHNvbWV0aGluZyB1bmV4cGVjdGVkIGhhcyBoYXBwZW5lZC5cbiAqL1xuZXhwb3J0IGNsYXNzIElsbGVnYWxTdGF0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gJ0lsbGVnYWxTdGF0ZUVycm9yJztcbn1cblxuLyoqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyB0aHJvd24gaW4gdGhlIGZvbGxvd2luZyBjYXNlczpcbiAqICAtIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgaXMgY3VycmVudGx5IHJ1bm5pbmdcbiAqICAtIFRoZXJlIGlzIGEgY2xvc2VkIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgYW5kIHRoZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeX1cbiAqICAgIGlzIGBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfUkVKRUNUX0RVUExJQ0FURWBcbiAqICAtIFRoZXJlIGlzIGNsb3NlZCBXb3JrZmxvdyBpbiB0aGUgYENvbXBsZXRlZGAgc3RhdGUgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBhbmQgdGhlIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5fVxuICogICAgaXMgYFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFlgXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcgPSAnV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yJztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd0lkOiBzdHJpbmcsIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gYSBXb3JrZmxvdyB3aXRoIHRoZSBnaXZlbiBJZCBpcyBub3Qga25vd24gdG8gVGVtcG9yYWwgU2VydmVyLlxuICogSXQgY291bGQgYmUgYmVjYXVzZTpcbiAqIC0gSWQgcGFzc2VkIGlzIGluY29ycmVjdFxuICogLSBXb3JrZmxvdyBpcyBjbG9zZWQgKGZvciBzb21lIGNhbGxzLCBlLmcuIGB0ZXJtaW5hdGVgKVxuICogLSBXb3JrZmxvdyB3YXMgZGVsZXRlZCBmcm9tIHRoZSBTZXJ2ZXIgYWZ0ZXIgcmVhY2hpbmcgaXRzIHJldGVudGlvbiBsaW1pdFxuICovXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gJ1dvcmtmbG93Tm90Rm91bmRFcnJvcic7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nLCBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLCBwdWJsaWMgcmVhZG9ubHkgcnVuSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzLCBpc1JlY29yZCB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuZXhwb3J0IGNvbnN0IEZBSUxVUkVfU09VUkNFID0gJ1R5cGVTY3JpcHRTREsnO1xuZXhwb3J0IHR5cGUgUHJvdG9GYWlsdXJlID0gdGVtcG9yYWwuYXBpLmZhaWx1cmUudjEuSUZhaWx1cmU7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGVcbmV4cG9ydCBlbnVtIFRpbWVvdXRUeXBlIHtcbiAgVElNRU9VVF9UWVBFX1VOU1BFQ0lGSUVEID0gMCxcbiAgVElNRU9VVF9UWVBFX1NUQVJUX1RPX0NMT1NFID0gMSxcbiAgVElNRU9VVF9UWVBFX1NDSEVEVUxFX1RPX1NUQVJUID0gMixcbiAgVElNRU9VVF9UWVBFX1NDSEVEVUxFX1RPX0NMT1NFID0gMyxcbiAgVElNRU9VVF9UWVBFX0hFQVJUQkVBVCA9IDQsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGUsIFRpbWVvdXRUeXBlPigpO1xuY2hlY2tFeHRlbmRzPFRpbWVvdXRUeXBlLCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuVGltZW91dFR5cGU+KCk7XG5cbi8vIEF2b2lkIGltcG9ydGluZyB0aGUgcHJvdG8gaW1wbGVtZW50YXRpb24gdG8gcmVkdWNlIHdvcmtmbG93IGJ1bmRsZSBzaXplXG4vLyBDb3BpZWQgZnJvbSB0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZVxuZXhwb3J0IGVudW0gUmV0cnlTdGF0ZSB7XG4gIFJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVEID0gMCxcbiAgUkVUUllfU1RBVEVfSU5fUFJPR1JFU1MgPSAxLFxuICBSRVRSWV9TVEFURV9OT05fUkVUUllBQkxFX0ZBSUxVUkUgPSAyLFxuICBSRVRSWV9TVEFURV9USU1FT1VUID0gMyxcbiAgUkVUUllfU1RBVEVfTUFYSU1VTV9BVFRFTVBUU19SRUFDSEVEID0gNCxcbiAgUkVUUllfU1RBVEVfUkVUUllfUE9MSUNZX05PVF9TRVQgPSA1LFxuICBSRVRSWV9TVEFURV9JTlRFUk5BTF9TRVJWRVJfRVJST1IgPSA2LFxuICBSRVRSWV9TVEFURV9DQU5DRUxfUkVRVUVTVEVEID0gNyxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlLCBSZXRyeVN0YXRlPigpO1xuY2hlY2tFeHRlbmRzPFJldHJ5U3RhdGUsIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5SZXRyeVN0YXRlPigpO1xuXG5leHBvcnQgdHlwZSBXb3JrZmxvd0V4ZWN1dGlvbiA9IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVdvcmtmbG93RXhlY3V0aW9uO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgZmFpbHVyZXMgdGhhdCBjYW4gY3Jvc3MgV29ya2Zsb3cgYW5kIEFjdGl2aXR5IGJvdW5kYXJpZXMuXG4gKlxuICogKipOZXZlciBleHRlbmQgdGhpcyBjbGFzcyBvciBhbnkgb2YgaXRzIGNoaWxkcmVuLioqXG4gKlxuICogVGhlIG9ubHkgY2hpbGQgY2xhc3MgeW91IHNob3VsZCBldmVyIHRocm93IGZyb20geW91ciBjb2RlIGlzIHtAbGluayBBcHBsaWNhdGlvbkZhaWx1cmV9LlxuICovXG5leHBvcnQgY2xhc3MgVGVtcG9yYWxGYWlsdXJlIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gJ1RlbXBvcmFsRmFpbHVyZSc7XG4gIC8qKlxuICAgKiBUaGUgb3JpZ2luYWwgZmFpbHVyZSB0aGF0IGNvbnN0cnVjdGVkIHRoaXMgZXJyb3IuXG4gICAqXG4gICAqIE9ubHkgcHJlc2VudCBpZiB0aGlzIGVycm9yIHdhcyBnZW5lcmF0ZWQgZnJvbSBhbiBleHRlcm5hbCBvcGVyYXRpb24uXG4gICAqL1xuICBwdWJsaWMgZmFpbHVyZT86IFByb3RvRmFpbHVyZTtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCwgcHVibGljIHJlYWRvbmx5IGNhdXNlPzogRXJyb3IpIHtcbiAgICBzdXBlcihtZXNzYWdlID8/IHVuZGVmaW5lZCk7XG4gIH1cbn1cblxuLyoqIEV4Y2VwdGlvbnMgb3JpZ2luYXRlZCBhdCB0aGUgVGVtcG9yYWwgc2VydmljZS4gKi9cbmV4cG9ydCBjbGFzcyBTZXJ2ZXJGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyA9ICdTZXJ2ZXJGYWlsdXJlJztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU6IGJvb2xlYW4sIGNhdXNlPzogRXJyb3IpIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYHMgYXJlIHVzZWQgdG8gY29tbXVuaWNhdGUgYXBwbGljYXRpb24tc3BlY2lmaWMgZmFpbHVyZXMgaW4gV29ya2Zsb3dzIGFuZCBBY3Rpdml0aWVzLlxuICpcbiAqIFRoZSB7QGxpbmsgdHlwZX0gcHJvcGVydHkgaXMgbWF0Y2hlZCBhZ2FpbnN0IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSB0byBkZXRlcm1pbmUgaWYgYW4gaW5zdGFuY2VcbiAqIG9mIHRoaXMgZXJyb3IgaXMgcmV0cnlhYmxlLiBBbm90aGVyIHdheSB0byBhdm9pZCByZXRyeWluZyBpcyBieSBzZXR0aW5nIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHRvIGB0cnVlYC5cbiAqXG4gKiBJbiBXb3JrZmxvd3MsIGlmIHlvdSB0aHJvdyBhIG5vbi1gQXBwbGljYXRpb25GYWlsdXJlYCwgdGhlIFdvcmtmbG93IFRhc2sgd2lsbCBmYWlsIGFuZCBiZSByZXRyaWVkLiBJZiB5b3UgdGhyb3cgYW5cbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIHdpbGwgZmFpbC5cbiAqXG4gKiBJbiBBY3Rpdml0aWVzLCB5b3UgY2FuIGVpdGhlciB0aHJvdyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCBvciBhbm90aGVyIGBFcnJvcmAgdG8gZmFpbCB0aGUgQWN0aXZpdHkgVGFzay4gSW4gdGhlXG4gKiBsYXR0ZXIgY2FzZSwgdGhlIGBFcnJvcmAgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuIFRoZSBjb252ZXJzaW9uIGlzIGRvbmUgYXMgZm9sbG93aW5nOlxuICpcbiAqIC0gYHR5cGVgIGlzIHNldCB0byBgZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZWBcbiAqIC0gYG1lc3NhZ2VgIGlzIHNldCB0byBgZXJyb3IubWVzc2FnZWBcbiAqIC0gYG5vblJldHJ5YWJsZWAgaXMgc2V0IHRvIGZhbHNlXG4gKiAtIGBkZXRhaWxzYCBhcmUgc2V0IHRvIG51bGxcbiAqIC0gc3RhY2sgdHJhY2UgaXMgY29waWVkIGZyb20gdGhlIG9yaWdpbmFsIGVycm9yXG4gKlxuICogV2hlbiBhbiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYW4tYWN0aXZpdHktZXhlY3V0aW9uIHwgQWN0aXZpdHkgRXhlY3V0aW9ufSBmYWlscywgdGhlXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIHRoZSBsYXN0IEFjdGl2aXR5IFRhc2sgd2lsbCBiZSB0aGUgYGNhdXNlYCBvZiB0aGUge0BsaW5rIEFjdGl2aXR5RmFpbHVyZX0gdGhyb3duIGluIHRoZVxuICogV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gJ0FwcGxpY2F0aW9uRmFpbHVyZSc7XG5cbiAgLyoqXG4gICAqIEFsdGVybmF0aXZlbHksIHVzZSB7QGxpbmsgZnJvbUVycm9yfSBvciB7QGxpbmsgY3JlYXRlfS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSB0eXBlPzogc3RyaW5nIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbm9uUmV0cnlhYmxlPzogYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IGRldGFpbHM/OiB1bmtub3duW10gfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIGFuIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogRmlyc3QgY2FsbHMge0BsaW5rIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZSB8IGBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3IpYH0gYW5kIHRoZW4gb3ZlcnJpZGVzIGFueSBmaWVsZHNcbiAgICogcHJvdmlkZWQgaW4gYG92ZXJyaWRlc2AuXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIGZyb21FcnJvcihlcnJvcjogRXJyb3IgfCB1bmtub3duLCBvdmVycmlkZXM/OiBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICBjb25zdCBmYWlsdXJlID0gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycm9yKTtcbiAgICBPYmplY3QuYXNzaWduKGZhaWx1cmUsIG92ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCB3aWxsIGJlIHJldHJ5YWJsZSAodW5sZXNzIGl0cyBgdHlwZWAgaXMgaW5jbHVkZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgY3JlYXRlKG9wdGlvbnM6IEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIGNvbnN0IHsgbWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlID0gZmFsc2UsIGRldGFpbHMsIGNhdXNlIH0gPSBvcHRpb25zO1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGUsIGRldGFpbHMsIGNhdXNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyBzZXQgdG8gZmFsc2UuIE5vdGUgdGhhdCB0aGlzIGVycm9yIHdpbGwgc3RpbGxcbiAgICogbm90IGJlIHJldHJpZWQgaWYgaXRzIGB0eXBlYCBpcyBpbmNsdWRlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30uXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIE9wdGlvbmFsIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIHR5cGUgT3B0aW9uYWwgZXJyb3IgdHlwZSAodXNlZCBieSB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pXG4gICAqIEBwYXJhbSBkZXRhaWxzIE9wdGlvbmFsIGRldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgcmV0cnlhYmxlKG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsLCB0eXBlPzogc3RyaW5nIHwgbnVsbCwgLi4uZGV0YWlsczogdW5rbm93bltdKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSA/PyAnRXJyb3InLCBmYWxzZSwgZGV0YWlscyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggdGhlIHtAbGluayBub25SZXRyeWFibGV9IGZsYWcgc2V0IHRvIHRydWUuXG4gICAqXG4gICAqIFdoZW4gdGhyb3duIGZyb20gYW4gQWN0aXZpdHkgb3IgV29ya2Zsb3csIHRoZSBBY3Rpdml0eSBvciBXb3JrZmxvdyB3aWxsIG5vdCBiZSByZXRyaWVkIChldmVuIGlmIGB0eXBlYCBpcyBub3RcbiAgICogbGlzdGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSkuXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIE9wdGlvbmFsIGVycm9yIG1lc3NhZ2VcbiAgICogQHBhcmFtIHR5cGUgT3B0aW9uYWwgZXJyb3IgdHlwZVxuICAgKiBAcGFyYW0gZGV0YWlscyBPcHRpb25hbCBkZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBwdWJsaWMgc3RhdGljIG5vblJldHJ5YWJsZShtZXNzYWdlPzogc3RyaW5nIHwgbnVsbCwgdHlwZT86IHN0cmluZyB8IG51bGwsIC4uLmRldGFpbHM6IHVua25vd25bXSk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUgPz8gJ0Vycm9yJywgdHJ1ZSwgZGV0YWlscyk7XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBBcHBsaWNhdGlvbkZhaWx1cmVPcHRpb25zIHtcbiAgLyoqXG4gICAqIEVycm9yIG1lc3NhZ2VcbiAgICovXG4gIG1lc3NhZ2U/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEVycm9yIHR5cGUgKHVzZWQgYnkge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KVxuICAgKi9cbiAgdHlwZT86IHN0cmluZztcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgY3VycmVudCBBY3Rpdml0eSBvciBXb3JrZmxvdyBjYW4gYmUgcmV0cmllZFxuICAgKlxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgbm9uUmV0cnlhYmxlPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogRGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgZGV0YWlscz86IHVua25vd25bXTtcblxuICAvKipcbiAgICogQ2F1c2Ugb2YgdGhlIGZhaWx1cmVcbiAgICovXG4gIGNhdXNlPzogRXJyb3I7XG59XG5cbi8qKlxuICogVGhpcyBlcnJvciBpcyB0aHJvd24gd2hlbiBDYW5jZWxsYXRpb24gaGFzIGJlZW4gcmVxdWVzdGVkLiBUbyBhbGxvdyBDYW5jZWxsYXRpb24gdG8gaGFwcGVuLCBsZXQgaXQgcHJvcGFnYXRlLiBUb1xuICogaWdub3JlIENhbmNlbGxhdGlvbiwgY2F0Y2ggaXQgYW5kIGNvbnRpbnVlIGV4ZWN1dGluZy4gTm90ZSB0aGF0IENhbmNlbGxhdGlvbiBjYW4gb25seSBiZSByZXF1ZXN0ZWQgYSBzaW5nbGUgdGltZSwgc29cbiAqIHlvdXIgV29ya2Zsb3cvQWN0aXZpdHkgRXhlY3V0aW9uIHdpbGwgbm90IHJlY2VpdmUgZnVydGhlciBDYW5jZWxsYXRpb24gcmVxdWVzdHMuXG4gKlxuICogV2hlbiBhIFdvcmtmbG93IG9yIEFjdGl2aXR5IGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBjYW5jZWxsZWQsIGEgYENhbmNlbGxlZEZhaWx1cmVgIHdpbGwgYmUgdGhlIGBjYXVzZWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBDYW5jZWxsZWRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyA9ICdDYW5jZWxsZWRGYWlsdXJlJztcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsIHB1YmxpYyByZWFkb25seSBkZXRhaWxzOiB1bmtub3duW10gPSBbXSwgY2F1c2U/OiBFcnJvcikge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgYXMgdGhlIGBjYXVzZWAgd2hlbiBhIFdvcmtmbG93IGhhcyBiZWVuIHRlcm1pbmF0ZWRcbiAqL1xuZXhwb3J0IGNsYXNzIFRlcm1pbmF0ZWRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIHJlYWRvbmx5IG5hbWU6IHN0cmluZyA9ICdUZXJtaW5hdGVkRmFpbHVyZSc7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBjYXVzZT86IEVycm9yKSB7XG4gICAgc3VwZXIobWVzc2FnZSwgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogVXNlZCB0byByZXByZXNlbnQgdGltZW91dHMgb2YgQWN0aXZpdGllcyBhbmQgV29ya2Zsb3dzXG4gKi9cbmV4cG9ydCBjbGFzcyBUaW1lb3V0RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcgPSAnVGltZW91dEZhaWx1cmUnO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGFzdEhlYXJ0YmVhdERldGFpbHM6IHVua25vd24sXG4gICAgcHVibGljIHJlYWRvbmx5IHRpbWVvdXRUeXBlOiBUaW1lb3V0VHlwZVxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGFuIEFjdGl2aXR5IGZhaWx1cmUuIEFsd2F5cyBjb250YWlucyB0aGUgb3JpZ2luYWwgcmVhc29uIGZvciB0aGUgZmFpbHVyZSBhcyBpdHMgYGNhdXNlYC5cbiAqIEZvciBleGFtcGxlLCBpZiBhbiBBY3Rpdml0eSB0aW1lZCBvdXQsIHRoZSBjYXVzZSB3aWxsIGJlIGEge0BsaW5rIFRpbWVvdXRGYWlsdXJlfS5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCB0byBiZSB0aHJvd24gb25seSBieSB0aGUgZnJhbWV3b3JrIGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBBY3Rpdml0eUZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gJ0FjdGl2aXR5RmFpbHVyZSc7XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZpdHlJZDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIHB1YmxpYyByZWFkb25seSBpZGVudGl0eTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIoJ0FjdGl2aXR5IGV4ZWN1dGlvbiBmYWlsZWQnLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIENoaWxkIFdvcmtmbG93IGZhaWx1cmUuIEFsd2F5cyBjb250YWlucyB0aGUgcmVhc29uIGZvciB0aGUgZmFpbHVyZSBhcyBpdHMge0BsaW5rIGNhdXNlfS5cbiAqIEZvciBleGFtcGxlLCBpZiB0aGUgQ2hpbGQgd2FzIFRlcm1pbmF0ZWQsIHRoZSBgY2F1c2VgIGlzIGEge0BsaW5rIFRlcm1pbmF0ZWRGYWlsdXJlfS5cbiAqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyBleHBlY3RlZCB0byBiZSB0aHJvd24gb25seSBieSB0aGUgZnJhbWV3b3JrIGNvZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDaGlsZFdvcmtmbG93RmFpbHVyZSBleHRlbmRzIFRlbXBvcmFsRmFpbHVyZSB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcgPSAnQ2hpbGRXb3JrZmxvd0ZhaWx1cmUnO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGV4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb24sXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSByZXRyeVN0YXRlOiBSZXRyeVN0YXRlLFxuICAgIGNhdXNlPzogRXJyb3JcbiAgKSB7XG4gICAgc3VwZXIoJ0NoaWxkIFdvcmtmbG93IGV4ZWN1dGlvbiBmYWlsZWQnLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBJZiBgZXJyb3JgIGlzIGFscmVhZHkgYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAsIHJldHVybnMgYGVycm9yYC5cbiAqXG4gKiBPdGhlcndpc2UsIGNvbnZlcnRzIGBlcnJvcmAgaW50byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoOlxuICpcbiAqIC0gYG1lc3NhZ2VgOiBgZXJyb3IubWVzc2FnZWAgb3IgYFN0cmluZyhlcnJvcilgXG4gKiAtIGB0eXBlYDogYGVycm9yLmNvbnN0cnVjdG9yLm5hbWVgIG9yIGBlcnJvci5uYW1lYFxuICogLSBgc3RhY2tgOiBgZXJyb3Iuc3RhY2tgIG9yIGAnJ2BcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcjogdW5rbm93bik6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEFwcGxpY2F0aW9uRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIGNvbnN0IG1lc3NhZ2UgPSAoaXNSZWNvcmQoZXJyb3IpICYmIFN0cmluZyhlcnJvci5tZXNzYWdlKSkgfHwgU3RyaW5nKGVycm9yKTtcbiAgY29uc3QgdHlwZSA9IChpc1JlY29yZChlcnJvcikgJiYgKGVycm9yLmNvbnN0cnVjdG9yPy5uYW1lID8/IGVycm9yLm5hbWUpKSB8fCB1bmRlZmluZWQ7XG4gIGNvbnN0IGZhaWx1cmUgPSBBcHBsaWNhdGlvbkZhaWx1cmUuY3JlYXRlKHsgbWVzc2FnZSwgdHlwZSwgbm9uUmV0cnlhYmxlOiBmYWxzZSB9KTtcbiAgZmFpbHVyZS5zdGFjayA9IChpc1JlY29yZChlcnJvcikgJiYgU3RyaW5nKGVycm9yLnN0YWNrKSkgfHwgJyc7XG4gIHJldHVybiBmYWlsdXJlO1xufVxuXG4vKipcbiAqIElmIGBlcnJgIGlzIGFuIEVycm9yIGl0IGlzIHR1cm5lZCBpbnRvIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLlxuICpcbiAqIElmIGBlcnJgIHdhcyBhbHJlYWR5IGEgYFRlbXBvcmFsRmFpbHVyZWAsIHJldHVybnMgdGhlIG9yaWdpbmFsIGVycm9yLlxuICpcbiAqIE90aGVyd2lzZSByZXR1cm5zIGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgIHdpdGggYFN0cmluZyhlcnIpYCBhcyB0aGUgbWVzc2FnZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnI6IHVua25vd24pOiBUZW1wb3JhbEZhaWx1cmUge1xuICBpZiAoZXJyIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgcmV0dXJuIGVycjtcbiAgfVxuICByZXR1cm4gZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlKGVycik7XG59XG5cbi8qKlxuICogR2V0IHRoZSByb290IGNhdXNlIG1lc3NhZ2Ugb2YgZ2l2ZW4gYGVycm9yYC5cbiAqXG4gKiBJbiBjYXNlIGBlcnJvcmAgaXMgYSB7QGxpbmsgVGVtcG9yYWxGYWlsdXJlfSwgcmVjdXJzZSB0aGUgYGNhdXNlYCBjaGFpbiBhbmQgcmV0dXJuIHRoZSByb290IGBjYXVzZS5tZXNzYWdlYC5cbiAqIE90aGVyd2lzZSwgcmV0dXJuIGBlcnJvci5tZXNzYWdlYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvb3RDYXVzZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnJvci5jYXVzZSA/IHJvb3RDYXVzZShlcnJvci5jYXVzZSkgOiBlcnJvci5tZXNzYWdlO1xuICB9XG4gIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gIH1cbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsIi8qKlxuICogQ29tbW9uIGxpYnJhcnkgZm9yIGNvZGUgdGhhdCdzIHVzZWQgYWNyb3NzIHRoZSBDbGllbnQsIFdvcmtlciwgYW5kL29yIFdvcmtmbG93XG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCAqIGFzIGVuY29kaW5nIGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbmV4cG9ydCAqIGZyb20gJy4vYWN0aXZpdHktb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9kYXRhLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9mYWlsdXJlLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9wYXlsb2FkLWNvZGVjJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3BheWxvYWQtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3R5cGVzJztcbmV4cG9ydCAqIGZyb20gJy4vZGVwcmVjYXRlZC10aW1lJztcbmV4cG9ydCAqIGZyb20gJy4vZXJyb3JzJztcbmV4cG9ydCAqIGZyb20gJy4vZmFpbHVyZSc7XG5leHBvcnQgeyBIZWFkZXJzLCBOZXh0IH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJy4vcmV0cnktcG9saWN5JztcbmV4cG9ydCB7IFRpbWVzdGFtcCB9IGZyb20gJy4vdGltZSc7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93LW9wdGlvbnMnO1xuXG4vKipcbiAqIEVuY29kZSBhIFVURi04IHN0cmluZyBpbnRvIGEgVWludDhBcnJheVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1OChzOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGVuY29kaW5nLmVuY29kZShzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBVaW50OEFycmF5IGludG8gYSBVVEYtOCBzdHJpbmdcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGFycjogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBlbmNvZGluZy5kZWNvZGUoYXJyKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLm1lc3NhZ2VgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JNZXNzYWdlKGVycm9yKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb2RlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JDb2RlKGVycm9yKTtcbn1cbiIsImltcG9ydCB7IEFueUZ1bmMsIE9taXRMYXN0UGFyYW0gfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBuZXh0IGZ1bmN0aW9uIGZvciBhIGdpdmVuIGludGVyY2VwdG9yIGZ1bmN0aW9uXG4gKlxuICogQ2FsbGVkIGZyb20gYW4gaW50ZXJjZXB0b3IgdG8gY29udGludWUgdGhlIGludGVyY2VwdGlvbiBjaGFpblxuICovXG5leHBvcnQgdHlwZSBOZXh0PElGLCBGTiBleHRlbmRzIGtleW9mIElGPiA9IFJlcXVpcmVkPElGPltGTl0gZXh0ZW5kcyBBbnlGdW5jID8gT21pdExhc3RQYXJhbTxSZXF1aXJlZDxJRj5bRk5dPiA6IG5ldmVyO1xuXG4vKiogSGVhZGVycyBhcmUganVzdCBhIG1hcHBpbmcgb2YgaGVhZGVyIG5hbWUgdG8gUGF5bG9hZCAqL1xuZXhwb3J0IHR5cGUgSGVhZGVycyA9IFJlY29yZDxzdHJpbmcsIFBheWxvYWQ+O1xuXG4vKipcbiAqIENvbXBvc2VzIGFsbCBpbnRlcmNlcHRvciBtZXRob2RzIGludG8gYSBzaW5nbGUgZnVuY3Rpb25cbiAqXG4gKiBAcGFyYW0gaW50ZXJjZXB0b3JzIGEgbGlzdCBvZiBpbnRlcmNlcHRvcnNcbiAqIEBwYXJhbSBtZXRob2QgdGhlIG5hbWUgb2YgdGhlIGludGVyY2VwdG9yIG1ldGhvZCB0byBjb21wb3NlXG4gKiBAcGFyYW0gbmV4dCB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgYXQgdGhlIGVuZCBvZiB0aGUgaW50ZXJjZXB0aW9uIGNoYWluXG4gKi9cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0IChpbXBvcnRlZCB2aWEgbGliL2ludGVyY2VwdG9ycylcbmV4cG9ydCBmdW5jdGlvbiBjb21wb3NlSW50ZXJjZXB0b3JzPEksIE0gZXh0ZW5kcyBrZXlvZiBJPihpbnRlcmNlcHRvcnM6IElbXSwgbWV0aG9kOiBNLCBuZXh0OiBOZXh0PEksIE0+KTogTmV4dDxJLCBNPiB7XG4gIGZvciAobGV0IGkgPSBpbnRlcmNlcHRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICBjb25zdCBpbnRlcmNlcHRvciA9IGludGVyY2VwdG9yc1tpXTtcbiAgICBpZiAoaW50ZXJjZXB0b3JbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBwcmV2ID0gbmV4dDtcbiAgICAgIC8vIFdlIGxvb3NlIHR5cGUgc2FmZXR5IGhlcmUgYmVjYXVzZSBUeXBlc2NyaXB0IGNhbid0IGRlZHVjZSB0aGF0IGludGVyY2VwdG9yW21ldGhvZF0gaXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnNcbiAgICAgIC8vIHRoZSBzYW1lIHR5cGUgYXMgTmV4dDxJLCBNPlxuICAgICAgbmV4dCA9ICgoaW5wdXQ6IGFueSkgPT4gKGludGVyY2VwdG9yW21ldGhvZF0gYXMgYW55KShpbnB1dCwgcHJldikpIGFzIGFueTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5leHQ7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG5leHBvcnQgdHlwZSBQYXlsb2FkID0gdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUGF5bG9hZDtcblxuLyoqIFR5cGUgdGhhdCBjYW4gYmUgcmV0dXJuZWQgZnJvbSBhIFdvcmtmbG93IGBleGVjdXRlYCBmdW5jdGlvbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dSZXR1cm5UeXBlID0gUHJvbWlzZTxhbnk+O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dTaWduYWxUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcbmV4cG9ydCB0eXBlIFdvcmtmbG93UXVlcnlUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnk7XG5cbi8qKlxuICogQnJvYWQgV29ya2Zsb3cgZnVuY3Rpb24gZGVmaW5pdGlvbiwgc3BlY2lmaWMgV29ya2Zsb3dzIHdpbGwgdHlwaWNhbGx5IHVzZSBhIG5hcnJvd2VyIHR5cGUgZGVmaW5pdGlvbiwgZS5nOlxuICogYGBgdHNcbiAqIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBteVdvcmtmbG93KGFyZzE6IG51bWJlciwgYXJnMjogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93ID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBXb3JrZmxvd1JldHVyblR5cGU7XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHNpZ25hbCBkZWZpbml0aW9uLCBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVTaWduYWx9XG4gKlxuICogQHJlbWFya3MgYF9BcmdzYCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCAqV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxEZWZpbml0aW9uPF9BcmdzIGV4dGVuZHMgYW55W10gPSBbXT4ge1xuICB0eXBlOiAnc2lnbmFsJztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyBxdWVyeSBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVF1ZXJ5fVxuICpcbiAqIEByZW1hcmtzIGBfQXJnc2AgYW5kIGBfUmV0YCBjYW4gYmUgdXNlZCBmb3IgcGFyYW1ldGVyIHR5cGUgaW5mZXJlbmNlIGluIGhhbmRsZXIgZnVuY3Rpb25zIGFuZCAqV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeURlZmluaXRpb248X1JldCwgX0FyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdPiB7XG4gIHR5cGU6ICdxdWVyeSc7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEdldCB0aGUgXCJ1bndyYXBwZWRcIiByZXR1cm4gdHlwZSAod2l0aG91dCBQcm9taXNlKSBvZiB0aGUgZXhlY3V0ZSBoYW5kbGVyIGZyb20gV29ya2Zsb3cgdHlwZSBgV2AgKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93UmVzdWx0VHlwZTxXIGV4dGVuZHMgV29ya2Zsb3c+ID0gUmV0dXJuVHlwZTxXPiBleHRlbmRzIFByb21pc2U8aW5mZXIgUj4gPyBSIDogbmV2ZXI7XG5cbi8qKlxuICogSWYgYW5vdGhlciBTREsgY3JlYXRlcyBhIFNlYXJjaCBBdHRyaWJ1dGUgdGhhdCdzIG5vdCBhbiBhcnJheSwgd2Ugd3JhcCBpdCBpbiBhbiBhcnJheS5cbiAqXG4gKiBEYXRlcyBhcmUgc2VyaWFsaXplZCBhcyBJU08gc3RyaW5ncy5cbiAqL1xuZXhwb3J0IHR5cGUgU2VhcmNoQXR0cmlidXRlcyA9IFJlY29yZDxzdHJpbmcsIFNlYXJjaEF0dHJpYnV0ZVZhbHVlIHwgdW5kZWZpbmVkPjtcbmV4cG9ydCB0eXBlIFNlYXJjaEF0dHJpYnV0ZVZhbHVlID0gc3RyaW5nW10gfCBudW1iZXJbXSB8IGJvb2xlYW5bXSB8IERhdGVbXTtcblxuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUZ1bmN0aW9uPFAgZXh0ZW5kcyBhbnlbXSA9IGFueVtdLCBSID0gYW55PiB7XG4gICguLi5hcmdzOiBQKTogUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBNYXBwaW5nIG9mIEFjdGl2aXR5IG5hbWUgdG8gZnVuY3Rpb25cbiAqIEBkZXByZWNhdGVkIG5vdCByZXF1aXJlZCBhbnltb3JlLCBmb3IgdW50eXBlZCBhY3Rpdml0aWVzIHVzZSB7QGxpbmsgVW50eXBlZEFjdGl2aXRpZXN9XG4gKi9cbmV4cG9ydCB0eXBlIEFjdGl2aXR5SW50ZXJmYWNlID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogTWFwcGluZyBvZiBBY3Rpdml0eSBuYW1lIHRvIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIFVudHlwZWRBY3Rpdml0aWVzID0gUmVjb3JkPHN0cmluZywgQWN0aXZpdHlGdW5jdGlvbj47XG5cbi8qKlxuICogQSB3b3JrZmxvdydzIGhpc3RvcnkgYW5kIElELiBVc2VmdWwgZm9yIHJlcGxheS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIaXN0b3J5QW5kV29ya2Zsb3dJZCB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgaGlzdG9yeTogdGVtcG9yYWwuYXBpLmhpc3RvcnkudjEuSGlzdG9yeSB8IHVua25vd24gfCB1bmRlZmluZWQ7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgVmFsdWVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IG1zT3B0aW9uYWxUb051bWJlciwgbXNPcHRpb25hbFRvVHMsIG1zVG9OdW1iZXIsIG1zVG9Ucywgb3B0aW9uYWxUc1RvTXMgfSBmcm9tICcuL3RpbWUnO1xuXG4vKipcbiAqIE9wdGlvbnMgZm9yIHJldHJ5aW5nIFdvcmtmbG93cyBhbmQgQWN0aXZpdGllc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFJldHJ5UG9saWN5IHtcbiAgLyoqXG4gICAqIENvZWZmaWNpZW50IHVzZWQgdG8gY2FsY3VsYXRlIHRoZSBuZXh0IHJldHJ5IGludGVydmFsLlxuICAgKiBUaGUgbmV4dCByZXRyeSBpbnRlcnZhbCBpcyBwcmV2aW91cyBpbnRlcnZhbCBtdWx0aXBsaWVkIGJ5IHRoaXMgY29lZmZpY2llbnQuXG4gICAqIEBtaW5pbXVtIDFcbiAgICogQGRlZmF1bHQgMlxuICAgKi9cbiAgYmFja29mZkNvZWZmaWNpZW50PzogbnVtYmVyO1xuICAvKipcbiAgICogSW50ZXJ2YWwgb2YgdGhlIGZpcnN0IHJldHJ5LlxuICAgKiBJZiBjb2VmZmljaWVudCBpcyAxIHRoZW4gaXQgaXMgdXNlZCBmb3IgYWxsIHJldHJpZXNcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqIEBkZWZhdWx0IDEgc2Vjb25kXG4gICAqL1xuICBpbml0aWFsSW50ZXJ2YWw/OiBzdHJpbmcgfCBudW1iZXI7XG4gIC8qKlxuICAgKiBNYXhpbXVtIG51bWJlciBvZiBhdHRlbXB0cy4gV2hlbiBleGNlZWRlZCwgcmV0cmllcyBzdG9wIChldmVuIGlmIHtAbGluayBBY3Rpdml0eU9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dH1cbiAgICogaGFzbid0IGJlZW4gcmVhY2hlZCkuXG4gICAqXG4gICAqIEBkZWZhdWx0IEluZmluaXR5XG4gICAqL1xuICBtYXhpbXVtQXR0ZW1wdHM/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBNYXhpbXVtIGludGVydmFsIGJldHdlZW4gcmV0cmllcy5cbiAgICogRXhwb25lbnRpYWwgYmFja29mZiBsZWFkcyB0byBpbnRlcnZhbCBpbmNyZWFzZS5cbiAgICogVGhpcyB2YWx1ZSBpcyB0aGUgY2FwIG9mIHRoZSBpbmNyZWFzZS5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAweCBvZiB7QGxpbmsgaW5pdGlhbEludGVydmFsfVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIG1heGltdW1JbnRlcnZhbD86IHN0cmluZyB8IG51bWJlcjtcblxuICAvKipcbiAgICogTGlzdCBvZiBhcHBsaWNhdGlvbiBmYWlsdXJlcyB0eXBlcyB0byBub3QgcmV0cnkuXG4gICAqL1xuICBub25SZXRyeWFibGVFcnJvclR5cGVzPzogc3RyaW5nW107XG59XG5cbi8qKlxuICogVHVybiBhIFRTIFJldHJ5UG9saWN5IGludG8gYSBwcm90byBjb21wYXRpYmxlIFJldHJ5UG9saWN5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlUmV0cnlQb2xpY3kocmV0cnlQb2xpY3k6IFJldHJ5UG9saWN5KTogdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUmV0cnlQb2xpY3kge1xuICBpZiAocmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50ICE9IG51bGwgJiYgcmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50IDw9IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kuYmFja29mZkNvZWZmaWNpZW50IG11c3QgYmUgZ3JlYXRlciB0aGFuIDAnKTtcbiAgfVxuICBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzICE9IG51bGwpIHtcbiAgICBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzID09PSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpIHtcbiAgICAgIC8vIGRyb3AgZmllbGQgKEluZmluaXR5IGlzIHRoZSBkZWZhdWx0KVxuICAgICAgY29uc3QgeyBtYXhpbXVtQXR0ZW1wdHM6IF8sIC4uLndpdGhvdXQgfSA9IHJldHJ5UG9saWN5O1xuICAgICAgcmV0cnlQb2xpY3kgPSB3aXRob3V0O1xuICAgIH0gZWxzZSBpZiAocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzIDw9IDApIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXInKTtcbiAgICB9IGVsc2UgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cykpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgbXVzdCBiZSBhbiBpbnRlZ2VyJyk7XG4gICAgfVxuICB9XG4gIGNvbnN0IG1heGltdW1JbnRlcnZhbCA9IG1zT3B0aW9uYWxUb051bWJlcihyZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwpO1xuICBjb25zdCBpbml0aWFsSW50ZXJ2YWwgPSBtc1RvTnVtYmVyKHJldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCA/PyAxMDAwKTtcbiAgaWYgKG1heGltdW1JbnRlcnZhbCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwgY2Fubm90IGJlIDAnKTtcbiAgfVxuICBpZiAoaW5pdGlhbEludGVydmFsID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCBjYW5ub3QgYmUgMCcpO1xuICB9XG4gIGlmIChtYXhpbXVtSW50ZXJ2YWwgIT0gbnVsbCAmJiBtYXhpbXVtSW50ZXJ2YWwgPCBpbml0aWFsSW50ZXJ2YWwpIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsIGNhbm5vdCBiZSBsZXNzIHRoYW4gaXRzIGluaXRpYWxJbnRlcnZhbCcpO1xuICB9XG4gIHJldHVybiB7XG4gICAgbWF4aW11bUF0dGVtcHRzOiByZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMsXG4gICAgaW5pdGlhbEludGVydmFsOiBtc1RvVHMoaW5pdGlhbEludGVydmFsKSxcbiAgICBtYXhpbXVtSW50ZXJ2YWw6IG1zT3B0aW9uYWxUb1RzKG1heGltdW1JbnRlcnZhbCksXG4gICAgYmFja29mZkNvZWZmaWNpZW50OiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQsXG4gICAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogcmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlcyxcbiAgfTtcbn1cblxuLyoqXG4gKiBUdXJuIGEgcHJvdG8gY29tcGF0aWJsZSBSZXRyeVBvbGljeSBpbnRvIGEgVFMgUmV0cnlQb2xpY3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29tcGlsZVJldHJ5UG9saWN5KFxuICByZXRyeVBvbGljeT86IHRlbXBvcmFsLmFwaS5jb21tb24udjEuSVJldHJ5UG9saWN5IHwgbnVsbFxuKTogUmV0cnlQb2xpY3kgfCB1bmRlZmluZWQge1xuICBpZiAoIXJldHJ5UG9saWN5KSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgYmFja29mZkNvZWZmaWNpZW50OiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgPz8gdW5kZWZpbmVkLFxuICAgIG1heGltdW1BdHRlbXB0czogcmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzID8/IHVuZGVmaW5lZCxcbiAgICBtYXhpbXVtSW50ZXJ2YWw6IG9wdGlvbmFsVHNUb01zKHJldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCksXG4gICAgaW5pdGlhbEludGVydmFsOiBvcHRpb25hbFRzVG9NcyhyZXRyeVBvbGljeS5pbml0aWFsSW50ZXJ2YWwpLFxuICAgIG5vblJldHJ5YWJsZUVycm9yVHlwZXM6IHJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXMgPz8gdW5kZWZpbmVkLFxuICB9O1xufVxuIiwiLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGltcG9ydC9uby1uYW1lZC1hcy1kZWZhdWx0XG5pbXBvcnQgTG9uZyBmcm9tICdsb25nJztcbmltcG9ydCBtcyBmcm9tICdtcyc7XG5pbXBvcnQgdHlwZSB7IGdvb2dsZSB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFZhbHVlRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5cbi8vIE5PVEU6IHRoZXNlIGFyZSB0aGUgc2FtZSBpbnRlcmZhY2UgaW4gSlNcbi8vIGdvb2dsZS5wcm90b2J1Zi5JRHVyYXRpb247XG4vLyBnb29nbGUucHJvdG9idWYuSVRpbWVzdGFtcDtcbi8vIFRoZSBjb252ZXJzaW9uIGZ1bmN0aW9ucyBiZWxvdyBzaG91bGQgd29yayBmb3IgYm90aFxuXG5leHBvcnQgdHlwZSBUaW1lc3RhbXAgPSBnb29nbGUucHJvdG9idWYuSVRpbWVzdGFtcDtcblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiB0c1RvTXModHMpO1xufVxuXG4vKipcbiAqIExvc3N5IGNvbnZlcnNpb24gZnVuY3Rpb24gZnJvbSBUaW1lc3RhbXAgdG8gbnVtYmVyIGR1ZSB0byBwb3NzaWJsZSBvdmVyZmxvd1xuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb01zKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIHRpbWVzdGFtcCwgZ290ICR7dHN9YCk7XG4gIH1cbiAgY29uc3QgeyBzZWNvbmRzLCBuYW5vcyB9ID0gdHM7XG4gIHJldHVybiAoc2Vjb25kcyB8fCBMb25nLlVaRVJPKVxuICAgIC5tdWwoMTAwMClcbiAgICAuYWRkKE1hdGguZmxvb3IoKG5hbm9zIHx8IDApIC8gMTAwMDAwMCkpXG4gICAgLnRvTnVtYmVyKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc051bWJlclRvVHMobWlsbGlzOiBudW1iZXIpOiBUaW1lc3RhbXAge1xuICBjb25zdCBzZWNvbmRzID0gTWF0aC5mbG9vcihtaWxsaXMgLyAxMDAwKTtcbiAgY29uc3QgbmFub3MgPSAobWlsbGlzICUgMTAwMCkgKiAxMDAwMDAwO1xuICBpZiAoTnVtYmVyLmlzTmFOKHNlY29uZHMpIHx8IE51bWJlci5pc05hTihuYW5vcykpIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgSW52YWxpZCBtaWxsaXMgJHttaWxsaXN9YCk7XG4gIH1cbiAgcmV0dXJuIHsgc2Vjb25kczogTG9uZy5mcm9tTnVtYmVyKHNlY29uZHMpLCBuYW5vcyB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNUb1RzKHN0cjogc3RyaW5nIHwgbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgaWYgKHR5cGVvZiBzdHIgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIG1zTnVtYmVyVG9UcyhzdHIpO1xuICB9XG4gIHJldHVybiBtc051bWJlclRvVHMobXMoc3RyKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtc09wdGlvbmFsVG9UcyhzdHI6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBzdHIgPyBtc1RvVHMoc3RyKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IHN0cmluZyB8IG51bWJlciB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgcmV0dXJuIG1zVG9OdW1iZXIodmFsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9OdW1iZXIodmFsOiBzdHJpbmcgfCBudW1iZXIpOiBudW1iZXIge1xuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG4gIHJldHVybiBtcyh2YWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHNUb0RhdGUodHM6IFRpbWVzdGFtcCk6IERhdGUge1xuICByZXR1cm4gbmV3IERhdGUodHNUb01zKHRzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9EYXRlKHRzOiBUaW1lc3RhbXAgfCBudWxsIHwgdW5kZWZpbmVkKTogRGF0ZSB8IHVuZGVmaW5lZCB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUodHNUb01zKHRzKSk7XG59XG5cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0IChpbXBvcnRlZCB2aWEgc2NoZWR1bGUtaGVscGVycy50cylcbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbERhdGVUb1RzKGRhdGU6IERhdGUgfCBudWxsIHwgdW5kZWZpbmVkKTogVGltZXN0YW1wIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGRhdGUgPT09IHVuZGVmaW5lZCB8fCBkYXRlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gbXNUb1RzKGRhdGUuZ2V0VGltZSgpKTtcbn1cbiIsIi8qKiBTaG9ydGhhbmQgYWxpYXMgKi9cbmV4cG9ydCB0eXBlIEFueUZ1bmMgPSAoLi4uYXJnczogYW55W10pID0+IGFueTtcbi8qKiBBIHR1cGxlIHdpdGhvdXQgaXRzIGxhc3QgZWxlbWVudCAqL1xuZXhwb3J0IHR5cGUgT21pdExhc3Q8VD4gPSBUIGV4dGVuZHMgWy4uLmluZmVyIFJFU1QsIGFueV0gPyBSRVNUIDogbmV2ZXI7XG4vKiogRiB3aXRoIGFsbCBhcmd1bWVudHMgYnV0IHRoZSBsYXN0ICovXG5leHBvcnQgdHlwZSBPbWl0TGFzdFBhcmFtPEYgZXh0ZW5kcyBBbnlGdW5jPiA9ICguLi5hcmdzOiBPbWl0TGFzdDxQYXJhbWV0ZXJzPEY+PikgPT4gUmV0dXJuVHlwZTxGPjtcblxuLyoqIFZlcmlmeSB0aGF0IGFuIHR5cGUgX0NvcHkgZXh0ZW5kcyBfT3JpZyAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrRXh0ZW5kczxfT3JpZywgX0NvcHkgZXh0ZW5kcyBfT3JpZz4oKTogdm9pZCB7XG4gIC8vIG5vb3AsIGp1c3QgdHlwZSBjaGVja1xufVxuXG5leHBvcnQgdHlwZSBSZXBsYWNlPEJhc2UsIE5ldz4gPSBPbWl0PEJhc2UsIGtleW9mIE5ldz4gJiBOZXc7XG5cbmV4cG9ydCB0eXBlIFJlcXVpcmVBdExlYXN0T25lPEJhc2UsIEtleXMgZXh0ZW5kcyBrZXlvZiBCYXNlPiA9IE9taXQ8QmFzZSwgS2V5cz4gJlxuICB7XG4gICAgW0sgaW4gS2V5c10tPzogUmVxdWlyZWQ8UGljazxCYXNlLCBLPj4gJiBQYXJ0aWFsPFBpY2s8QmFzZSwgRXhjbHVkZTxLZXlzLCBLPj4+O1xuICB9W0tleXNdO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWNvcmQodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICE9PSBudWxsO1xufVxuXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dFxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnR5PFggZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgWSBleHRlbmRzIFByb3BlcnR5S2V5PihcbiAgcmVjb3JkOiBYLFxuICBwcm9wOiBZXG4pOiByZWNvcmQgaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XG4gIHJldHVybiBwcm9wIGluIHJlY29yZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnRpZXM8WCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBZIGV4dGVuZHMgUHJvcGVydHlLZXk+KFxuICByZWNvcmQ6IFgsXG4gIHByb3BzOiBZW11cbik6IHJlY29yZCBpcyBYICYgUmVjb3JkPFksIHVua25vd24+IHtcbiAgcmV0dXJuIHByb3BzLmV2ZXJ5KChwcm9wKSA9PiBwcm9wIGluIHJlY29yZCk7XG59XG5cbi8qKlxuICogR2V0IGBlcnJvci5tZXNzYWdlYCAob3IgYHVuZGVmaW5lZGAgaWYgbm90IHByZXNlbnQpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcnJvck1lc3NhZ2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgIHJldHVybiBlcnJvci5tZXNzYWdlO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmludGVyZmFjZSBFcnJvcldpdGhDb2RlIHtcbiAgY29kZTogc3RyaW5nO1xufVxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVycm9yQ29kZShlcnJvcjogdW5rbm93bik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIGlmIChcbiAgICB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmXG4gICAgKGVycm9yIGFzIEVycm9yV2l0aENvZGUpLmNvZGUgIT09IHVuZGVmaW5lZCAmJlxuICAgIHR5cGVvZiAoZXJyb3IgYXMgRXJyb3JXaXRoQ29kZSkuY29kZSA9PT0gJ3N0cmluZydcbiAgKSB7XG4gICAgcmV0dXJuIChlcnJvciBhcyBFcnJvcldpdGhDb2RlKS5jb2RlO1xuICB9XG5cbiAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cbiIsImltcG9ydCB7IFdvcmtmbG93LCBXb3JrZmxvd1Jlc3VsdFR5cGUsIFNpZ25hbERlZmluaXRpb24gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIEJhc2UgV29ya2Zsb3dIYW5kbGUgaW50ZXJmYWNlLCBleHRlbmRlZCBpbiB3b3JrZmxvdyBhbmQgY2xpZW50IGxpYnMuXG4gKlxuICogVHJhbnNmb3JtcyBhIHdvcmtmbG93IGludGVyZmFjZSBgVGAgaW50byBhIGNsaWVudCBpbnRlcmZhY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93SGFuZGxlPFQgZXh0ZW5kcyBXb3JrZmxvdz4ge1xuICAvKipcbiAgICogUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gV29ya2Zsb3cgZXhlY3V0aW9uIGNvbXBsZXRlc1xuICAgKi9cbiAgcmVzdWx0KCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuICAvKipcbiAgICogU2lnbmFsIGEgcnVubmluZyBXb3JrZmxvdy5cbiAgICpcbiAgICogQHBhcmFtIGRlZiBhIHNpZ25hbCBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVNpZ25hbH1cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogYXdhaXQgaGFuZGxlLnNpZ25hbChpbmNyZW1lbnRTaWduYWwsIDMpO1xuICAgKiBgYGBcbiAgICovXG4gIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10gPSBbXT4oZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgc3RyaW5nLCAuLi5hcmdzOiBBcmdzKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogVGhlIHdvcmtmbG93SWQgb2YgdGhlIGN1cnJlbnQgV29ya2Zsb3dcbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZztcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwsIGdvb2dsZSB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IFNlYXJjaEF0dHJpYnV0ZXMsIFdvcmtmbG93IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFJldHJ5UG9saWN5IH0gZnJvbSAnLi9yZXRyeS1wb2xpY3knO1xuaW1wb3J0IHsgbXNPcHRpb25hbFRvVHMgfSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzLCBSZXBsYWNlIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeVxuLyoqXG4gKiBDb25jZXB0OiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS13b3JrZmxvdy1pZC1yZXVzZS1wb2xpY3kvIHwgV29ya2Zsb3cgSWQgUmV1c2UgUG9saWN5fVxuICpcbiAqIFdoZXRoZXIgYSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBDbG9zZWQgV29ya2Zsb3cuXG4gKlxuICogKk5vdGU6IEEgV29ya2Zsb3cgY2FuIG5ldmVyIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgUnVubmluZyBXb3JrZmxvdy4qXG4gKi9cbmV4cG9ydCBlbnVtIFdvcmtmbG93SWRSZXVzZVBvbGljeSB7XG4gIC8qKlxuICAgKiBObyBuZWVkIHRvIHVzZSB0aGlzLlxuICAgKlxuICAgKiAoSWYgYSBgV29ya2Zsb3dJZFJldXNlUG9saWN5YCBpcyBzZXQgdG8gdGhpcywgb3IgaXMgbm90IHNldCBhdCBhbGwsIHRoZSBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZC4pXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfVU5TUEVDSUZJRUQgPSAwLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgaWYgdGhlIHByZXZpb3VzIFdvcmtmbG93IGlzIGluIGEgQ2xvc2VkIHN0YXRlLlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURSA9IDEsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCBpZiB0aGUgcHJldmlvdXMgV29ya2Zsb3cgaXMgaW4gYSBDbG9zZWQgc3RhdGUgdGhhdCBpcyBub3QgQ29tcGxldGVkLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX0FMTE9XX0RVUExJQ0FURV9GQUlMRURfT05MWSA9IDIsXG5cbiAgLyoqXG4gICAqIFRoZSBXb3JrZmxvdyBjYW5ub3QgYmUgc3RhcnRlZC5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9SRUpFQ1RfRFVQTElDQVRFID0gMyxcblxuICAvKipcbiAgICogVGVybWluYXRlIHRoZSBjdXJyZW50IHdvcmtmbG93IGlmIG9uZSBpcyBhbHJlYWR5IHJ1bm5pbmcuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfVEVSTUlOQVRFX0lGX1JVTk5JTkcgPSA0LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeSwgV29ya2Zsb3dJZFJldXNlUG9saWN5PigpO1xuY2hlY2tFeHRlbmRzPFdvcmtmbG93SWRSZXVzZVBvbGljeSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLldvcmtmbG93SWRSZXVzZVBvbGljeT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBCYXNlV29ya2Zsb3dPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgYSBXb3JrZmxvdyBjYW4gYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBDbG9zZWQgV29ya2Zsb3cuXG4gICAqXG4gICAqICpOb3RlOiBBIFdvcmtmbG93IGNhbiBuZXZlciBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIFJ1bm5pbmcgV29ya2Zsb3cuKlxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgV29ya2Zsb3dJZFJldXNlUG9saWN5LldPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFl9XG4gICAqL1xuICB3b3JrZmxvd0lkUmV1c2VQb2xpY3k/OiBXb3JrZmxvd0lkUmV1c2VQb2xpY3k7XG5cbiAgLyoqXG4gICAqIENvbnRyb2xzIGhvdyBhIFdvcmtmbG93IEV4ZWN1dGlvbiBpcyByZXRyaWVkLlxuICAgKlxuICAgKiBCeSBkZWZhdWx0LCBXb3JrZmxvdyBFeGVjdXRpb25zIGFyZSBub3QgcmV0cmllZC4gRG8gbm90IG92ZXJyaWRlIHRoaXMgYmVoYXZpb3IgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91J3JlIGRvaW5nLlxuICAgKiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYS1yZXRyeS1wb2xpY3kvIHwgTW9yZSBpbmZvcm1hdGlvbn0uXG4gICAqL1xuICByZXRyeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBPcHRpb25hbCBjcm9uIHNjaGVkdWxlIGZvciBXb3JrZmxvdy4gSWYgYSBjcm9uIHNjaGVkdWxlIGlzIHNwZWNpZmllZCwgdGhlIFdvcmtmbG93IHdpbGwgcnVuIGFzIGEgY3JvbiBiYXNlZCBvbiB0aGVcbiAgICogc2NoZWR1bGUuIFRoZSBzY2hlZHVsaW5nIHdpbGwgYmUgYmFzZWQgb24gVVRDIHRpbWUuIFRoZSBzY2hlZHVsZSBmb3IgdGhlIG5leHQgcnVuIG9ubHkgaGFwcGVucyBhZnRlciB0aGUgY3VycmVudFxuICAgKiBydW4gaXMgY29tcGxldGVkL2ZhaWxlZC90aW1lb3V0LiBJZiBhIFJldHJ5UG9saWN5IGlzIGFsc28gc3VwcGxpZWQsIGFuZCB0aGUgV29ya2Zsb3cgZmFpbGVkIG9yIHRpbWVkIG91dCwgdGhlXG4gICAqIFdvcmtmbG93IHdpbGwgYmUgcmV0cmllZCBiYXNlZCBvbiB0aGUgcmV0cnkgcG9saWN5LiBXaGlsZSB0aGUgV29ya2Zsb3cgaXMgcmV0cnlpbmcsIGl0IHdvbid0IHNjaGVkdWxlIGl0cyBuZXh0IHJ1bi5cbiAgICogSWYgdGhlIG5leHQgc2NoZWR1bGUgaXMgZHVlIHdoaWxlIHRoZSBXb3JrZmxvdyBpcyBydW5uaW5nIChvciByZXRyeWluZyksIHRoZW4gaXQgd2lsbCBza2lwIHRoYXQgc2NoZWR1bGUuIENyb25cbiAgICogV29ya2Zsb3cgd2lsbCBub3Qgc3RvcCB1bnRpbCBpdCBpcyB0ZXJtaW5hdGVkIG9yIGNhbmNlbGxlZCAoYnkgcmV0dXJuaW5nIHRlbXBvcmFsLkNhbmNlbGVkRXJyb3IpLlxuICAgKiBodHRwczovL2Nyb250YWIuZ3VydS8gaXMgdXNlZnVsIGZvciB0ZXN0aW5nIHlvdXIgY3JvbiBleHByZXNzaW9ucy5cbiAgICovXG4gIGNyb25TY2hlZHVsZT86IHN0cmluZztcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGFkZGl0aW9uYWwgbm9uLWluZGV4ZWQgaW5mb3JtYXRpb24gdG8gYXR0YWNoIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24uIFRoZSB2YWx1ZXMgY2FuIGJlIGFueXRoaW5nIHRoYXRcbiAgICogaXMgc2VyaWFsaXphYmxlIGJ5IHtAbGluayBEYXRhQ29udmVydGVyfS5cbiAgICovXG4gIG1lbW8/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuICAvKipcbiAgICogU3BlY2lmaWVzIGFkZGl0aW9uYWwgaW5kZXhlZCBpbmZvcm1hdGlvbiB0byBhdHRhY2ggdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvbi4gTW9yZSBpbmZvOlxuICAgKiBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vZG9jcy90eXBlc2NyaXB0L3NlYXJjaC1hdHRyaWJ1dGVzXG4gICAqXG4gICAqIFZhbHVlcyBhcmUgYWx3YXlzIGNvbnZlcnRlZCB1c2luZyB7QGxpbmsgSnNvblBheWxvYWRDb252ZXJ0ZXJ9LCBldmVuIHdoZW4gYSBjdXN0b20gZGF0YSBjb252ZXJ0ZXIgaXMgcHJvdmlkZWQuXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzPzogU2VhcmNoQXR0cmlidXRlcztcbn1cblxuZXhwb3J0IHR5cGUgV2l0aFdvcmtmbG93QXJnczxXIGV4dGVuZHMgV29ya2Zsb3csIFQ+ID0gVCAmXG4gIChQYXJhbWV0ZXJzPFc+IGV4dGVuZHMgW2FueSwgLi4uYW55W11dXG4gICAgPyB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M6IFBhcmFtZXRlcnM8Vz47XG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M/OiBQYXJhbWV0ZXJzPFc+O1xuICAgICAgfSk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dEdXJhdGlvbk9wdGlvbnMge1xuICAvKipcbiAgICogVGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd29ya2Zsb3cgcnVuIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBzZXJ2aWNlLiBEbyBub3RcbiAgICogcmVseSBvbiBydW4gdGltZW91dCBmb3IgYnVzaW5lc3MgbGV2ZWwgdGltZW91dHMuIEl0IGlzIHByZWZlcnJlZCB0byB1c2UgaW4gd29ya2Zsb3cgdGltZXJzXG4gICAqIGZvciB0aGlzIHB1cnBvc2UuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dSdW5UaW1lb3V0Pzogc3RyaW5nIHwgbnVtYmVyO1xuXG4gIC8qKlxuICAgKlxuICAgKiBUaGUgdGltZSBhZnRlciB3aGljaCB3b3JrZmxvdyBleGVjdXRpb24gKHdoaWNoIGluY2x1ZGVzIHJ1biByZXRyaWVzIGFuZCBjb250aW51ZSBhcyBuZXcpIGlzXG4gICAqIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBzZXJ2aWNlLiBEbyBub3QgcmVseSBvbiBleGVjdXRpb24gdGltZW91dCBmb3IgYnVzaW5lc3NcbiAgICogbGV2ZWwgdGltZW91dHMuIEl0IGlzIHByZWZlcnJlZCB0byB1c2UgaW4gd29ya2Zsb3cgdGltZXJzIGZvciB0aGlzIHB1cnBvc2UuXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0Pzogc3RyaW5nIHwgbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgc2luZ2xlIHdvcmtmbG93IHRhc2suIERlZmF1bHQgaXMgMTAgc2Vjb25kcy5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1Rhc2tUaW1lb3V0Pzogc3RyaW5nIHwgbnVtYmVyO1xufVxuXG5leHBvcnQgdHlwZSBDb21tb25Xb3JrZmxvd09wdGlvbnMgPSBCYXNlV29ya2Zsb3dPcHRpb25zICYgV29ya2Zsb3dEdXJhdGlvbk9wdGlvbnM7XG5cbmV4cG9ydCB0eXBlIFdpdGhDb21waWxlZFdvcmtmbG93T3B0aW9uczxUIGV4dGVuZHMgQ29tbW9uV29ya2Zsb3dPcHRpb25zPiA9IFJlcGxhY2U8XG4gIFQsXG4gIHtcbiAgICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ/OiBnb29nbGUucHJvdG9idWYuSUR1cmF0aW9uO1xuICAgIHdvcmtmbG93UnVuVGltZW91dD86IGdvb2dsZS5wcm90b2J1Zi5JRHVyYXRpb247XG4gICAgd29ya2Zsb3dUYXNrVGltZW91dD86IGdvb2dsZS5wcm90b2J1Zi5JRHVyYXRpb247XG4gIH1cbj47XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlV29ya2Zsb3dPcHRpb25zPFQgZXh0ZW5kcyBDb21tb25Xb3JrZmxvd09wdGlvbnM+KG9wdGlvbnM6IFQpOiBXaXRoQ29tcGlsZWRXb3JrZmxvd09wdGlvbnM8VD4ge1xuICBjb25zdCB7IHdvcmtmbG93RXhlY3V0aW9uVGltZW91dCwgd29ya2Zsb3dSdW5UaW1lb3V0LCB3b3JrZmxvd1Rhc2tUaW1lb3V0LCAuLi5yZXN0IH0gPSBvcHRpb25zO1xuXG4gIHJldHVybiB7XG4gICAgLi4ucmVzdCxcbiAgICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKHdvcmtmbG93RXhlY3V0aW9uVGltZW91dCksXG4gICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9Ucyh3b3JrZmxvd1J1blRpbWVvdXQpLFxuICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKHdvcmtmbG93VGFza1RpbWVvdXQpLFxuICB9O1xufVxuIiwiaW1wb3J0IHtcbiAgaXNDYW5jZWxsYXRpb24sXG4gIExvZ2dlclNpbmtzLFxuICBOZXh0LFxuICBwcm94eVNpbmtzLFxuICBXb3JrZmxvd0V4ZWN1dGVJbnB1dCxcbiAgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvcixcbiAgd29ya2Zsb3dJbmZvLFxuICBXb3JrZmxvd0luZm8sXG4gIFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvc3RhY2staGVscGVycyc7XG5cbi8qKlxuICogUmV0dXJucyBhIG1hcCBvZiBhdHRyaWJ1dGVzIHRvIGJlIHNldCBvbiBsb2cgbWVzc2FnZXMgZm9yIGEgZ2l2ZW4gV29ya2Zsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtmbG93TG9nQXR0cmlidXRlcyhpbmZvOiBXb3JrZmxvd0luZm8pOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiB7XG4gIHJldHVybiB7XG4gICAgbmFtZXNwYWNlOiBpbmZvLm5hbWVzcGFjZSxcbiAgICB0YXNrUXVldWU6IGluZm8udGFza1F1ZXVlLFxuICAgIHdvcmtmbG93SWQ6IGluZm8ud29ya2Zsb3dJZCxcbiAgICBydW5JZDogaW5mby5ydW5JZCxcbiAgICB3b3JrZmxvd1R5cGU6IGluZm8ud29ya2Zsb3dUeXBlLFxuICB9O1xufVxuXG4vKiogTG9ncyBXb3JrZmxvdyBleGVjdXRpb24gc3RhcnRzIGFuZCBjb21wbGV0aW9ucyAqL1xuZXhwb3J0IGNsYXNzIFdvcmtmbG93SW5ib3VuZExvZ0ludGVyY2VwdG9yIGltcGxlbWVudHMgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvciB7XG4gIHByb3RlY3RlZCBsb2dBdHRyaWJ1dGVzKCk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgICByZXR1cm4gd29ya2Zsb3dMb2dBdHRyaWJ1dGVzKHdvcmtmbG93SW5mbygpKTtcbiAgfVxuXG4gIGV4ZWN1dGUoaW5wdXQ6IFdvcmtmbG93RXhlY3V0ZUlucHV0LCBuZXh0OiBOZXh0PFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IsICdleGVjdXRlJz4pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICBjb25zdCB7IGRlZmF1bHRXb3JrZXJMb2dnZXI6IGxvZ2dlciB9ID0gcHJveHlTaW5rczxMb2dnZXJTaW5rcz4oKTtcblxuICAgIGxvZ2dlci5kZWJ1ZygnV29ya2Zsb3cgc3RhcnRlZCcsIHRoaXMubG9nQXR0cmlidXRlcygpKTtcbiAgICBjb25zdCBwID0gbmV4dChpbnB1dCkudGhlbihcbiAgICAgIChyZXMpID0+IHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdXb3JrZmxvdyBjb21wbGV0ZWQnLCB0aGlzLmxvZ0F0dHJpYnV0ZXMoKSk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgICB9LFxuICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgIC8vIEF2b2lkIHVzaW5nIGluc3RhbmNlb2YgY2hlY2tzIGluIGNhc2UgdGhlIG1vZHVsZXMgdGhleSdyZSBkZWZpbmVkIGluIGxvYWRlZCBtb3JlIHRoYW4gb25jZSxcbiAgICAgICAgLy8gZS5nLiBieSBqZXN0IG9yIHdoZW4gbXVsdGlwbGUgdmVyc2lvbnMgYXJlIGluc3RhbGxlZC5cbiAgICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnV29ya2Zsb3cgY29tcGxldGVkIGFzIGNhbmNlbGxlZCcsIHRoaXMubG9nQXR0cmlidXRlcygpKTtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3IubmFtZSA9PT0gJ0NvbnRpbnVlQXNOZXcnKSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ1dvcmtmbG93IGNvbnRpbnVlZCBhcyBuZXcnLCB0aGlzLmxvZ0F0dHJpYnV0ZXMoKSk7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbG9nZ2VyLndhcm4oJ1dvcmtmbG93IGZhaWxlZCcsIHsgZXJyb3IsIC4uLnRoaXMubG9nQXR0cmlidXRlcygpIH0pO1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cbiAgICApO1xuICAgIC8vIEF2b2lkIHNob3dpbmcgdGhpcyBpbnRlcmNlcHRvciBpbiBzdGFjayB0cmFjZSBxdWVyeVxuICAgIHVudHJhY2tQcm9taXNlKHApO1xuICAgIHJldHVybiBwO1xuICB9XG59XG5cbi8vIHRzLXBydW5lLWlnbm9yZS1uZXh0XG5leHBvcnQgY29uc3QgaW50ZXJjZXB0b3JzOiBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSAoKSA9PiAoeyBpbmJvdW5kOiBbbmV3IFdvcmtmbG93SW5ib3VuZExvZ0ludGVyY2VwdG9yKCldIH0pO1xuIiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIFRha2VuIGFuZCBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS9zZWVkcmFuZG9tL2Jsb2IvcmVsZWFzZWQvbGliL2FsZWEuanNcblxuY2xhc3MgQWxlYSB7XG4gIHB1YmxpYyBjOiBudW1iZXI7XG4gIHB1YmxpYyBzMDogbnVtYmVyO1xuICBwdWJsaWMgczE6IG51bWJlcjtcbiAgcHVibGljIHMyOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc2VlZDogbnVtYmVyW10pIHtcbiAgICBjb25zdCBtYXNoID0gbmV3IE1hc2goKTtcbiAgICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gICAgdGhpcy5jID0gMTtcbiAgICB0aGlzLnMwID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczEgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMiA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMwIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMCA8IDApIHtcbiAgICAgIHRoaXMuczAgKz0gMTtcbiAgICB9XG4gICAgdGhpcy5zMSAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczEgPCAwKSB7XG4gICAgICB0aGlzLnMxICs9IDE7XG4gICAgfVxuICAgIHRoaXMuczIgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMyIDwgMCkge1xuICAgICAgdGhpcy5zMiArPSAxO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdCA9IDIwOTE2MzkgKiB0aGlzLnMwICsgdGhpcy5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICB0aGlzLnMwID0gdGhpcy5zMTtcbiAgICB0aGlzLnMxID0gdGhpcy5zMjtcbiAgICByZXR1cm4gKHRoaXMuczIgPSB0IC0gKHRoaXMuYyA9IHQgfCAwKSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUk5HID0gKCkgPT4gbnVtYmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gYWxlYShzZWVkOiBudW1iZXJbXSk6IFJORyB7XG4gIGNvbnN0IHhnID0gbmV3IEFsZWEoc2VlZCk7XG4gIHJldHVybiB4Zy5uZXh0LmJpbmQoeGcpO1xufVxuXG5leHBvcnQgY2xhc3MgTWFzaCB7XG4gIHByaXZhdGUgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgcHVibGljIG1hc2goZGF0YTogbnVtYmVyW10pOiBudW1iZXIge1xuICAgIGxldCB7IG4gfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGFbaV07XG4gICAgICBsZXQgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHRoaXMubiA9IG47XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXN5bmNMb2NhbFN0b3JhZ2UgYXMgQUxTIH0gZnJvbSAnYXN5bmNfaG9va3MnO1xuaW1wb3J0IHsgQ2FuY2VsbGVkRmFpbHVyZSwgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuXG4vLyBBc3luY0xvY2FsU3RvcmFnZSBpcyBpbmplY3RlZCB2aWEgdm0gbW9kdWxlIGludG8gZ2xvYmFsIHNjb3BlLlxuLy8gSW4gY2FzZSBXb3JrZmxvdyBjb2RlIGlzIGltcG9ydGVkIGluIE5vZGUuanMgY29udGV4dCwgcmVwbGFjZSB3aXRoIGFuIGVtcHR5IGNsYXNzLlxuZXhwb3J0IGNvbnN0IEFzeW5jTG9jYWxTdG9yYWdlOiBuZXcgPFQ+KCkgPT4gQUxTPFQ+ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5Bc3luY0xvY2FsU3RvcmFnZSA/PyBjbGFzcyB7fTtcblxuLyoqIE1hZ2ljIHN5bWJvbCB1c2VkIHRvIGNyZWF0ZSB0aGUgcm9vdCBzY29wZSAtIGludGVudGlvbmFsbHkgbm90IGV4cG9ydGVkICovXG5jb25zdCBOT19QQVJFTlQgPSBTeW1ib2woJ05PX1BBUkVOVCcpO1xuXG4vKipcbiAqIE9wdGlvbiBmb3IgY29uc3RydWN0aW5nIGEgQ2FuY2VsbGF0aW9uU2NvcGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCBwcmV2ZW50IG91dGVyIGNhbmNlbGxhdGlvbiBmcm9tIHByb3BhZ2F0aW5nIHRvIGlubmVyIHNjb3BlcywgQWN0aXZpdGllcywgdGltZXJzLCBhbmQgVHJpZ2dlcnMsIGRlZmF1bHRzIHRvIHRydWUuXG4gICAqIChTY29wZSBzdGlsbCBwcm9wYWdhdGVzIENhbmNlbGxlZEZhaWx1cmUgdGhyb3duIGZyb20gd2l0aGluKS5cbiAgICovXG4gIGNhbmNlbGxhYmxlOiBib29sZWFuO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgQ2FuY2VsbGF0aW9uU2NvcGUgKHVzZWZ1bCBmb3IgcnVubmluZyBiYWNrZ3JvdW5kIHRhc2tzKS5cbiAgICogVGhlIGBOT19QQVJFTlRgIHN5bWJvbCBpcyByZXNlcnZlZCBmb3IgdGhlIHJvb3Qgc2NvcGUuXG4gICAqL1xuICBwYXJlbnQ/OiBDYW5jZWxsYXRpb25TY29wZSB8IHR5cGVvZiBOT19QQVJFTlQ7XG59XG5cbi8qKlxuICogSW4gdGhlIFNESywgV29ya2Zsb3dzIGFyZSByZXByZXNlbnRlZCBpbnRlcm5hbGx5IGJ5IGEgdHJlZSBvZiBzY29wZXMgd2hlcmUgdGhlIGBleGVjdXRlYCBmdW5jdGlvbiBydW5zIGluIHRoZSByb290IHNjb3BlLlxuICogQ2FuY2VsbGF0aW9uIHByb3BhZ2F0ZXMgZnJvbSBvdXRlciBzY29wZXMgdG8gaW5uZXIgb25lcyBhbmQgaXMgaGFuZGxlZCBieSBjYXRjaGluZyB7QGxpbmsgQ2FuY2VsbGVkRmFpbHVyZX1zXG4gKiB0aHJvd24gYnkgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyAoc2VlIGJlbG93KS5cbiAqXG4gKiBTY29wZXMgYXJlIGNyZWF0ZWQgdXNpbmcgdGhlIGBDYW5jZWxsYXRpb25TY29wZWAgY29uc3RydWN0b3Igb3IgdGhlIHN0YXRpYyBoZWxwZXIgbWV0aG9kc1xuICoge0BsaW5rIGNhbmNlbGxhYmxlfSwge0BsaW5rIG5vbkNhbmNlbGxhYmxlfSBhbmQge0BsaW5rIHdpdGhUaW1lb3V0fS5cbiAqXG4gKiBXaGVuIGEgYENhbmNlbGxhdGlvblNjb3BlYCBpcyBjYW5jZWxsZWQsIGl0IHdpbGwgcHJvcGFnYXRlIGNhbmNlbGxhdGlvbiBhbnkgY2hpbGQgc2NvcGVzIGFuZCBhbnkgY2FuY2VsbGFibGVcbiAqIG9wZXJhdGlvbnMgY3JlYXRlZCB3aXRoaW4gaXQsIHN1Y2ggYXM6XG4gKlxuICogLSBBY3Rpdml0aWVzXG4gKiAtIENoaWxkIFdvcmtmbG93c1xuICogLSBUaW1lcnMgKGNyZWF0ZWQgd2l0aCB0aGUge0BsaW5rIHNsZWVwfSBmdW5jdGlvbilcbiAqIC0ge0BsaW5rIFRyaWdnZXJ9c1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIGF3YWl0IENhbmNlbGxhdGlvblNjb3BlLmNhbmNlbGxhYmxlKGFzeW5jICgpID0+IHtcbiAqICAgY29uc3QgcHJvbWlzZSA9IHNvbWVBY3Rpdml0eSgpO1xuICogICBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCkuY2FuY2VsKCk7IC8vIENhbmNlbHMgdGhlIGFjdGl2aXR5XG4gKiAgIGF3YWl0IHByb21pc2U7IC8vIFRocm93cyBgQWN0aXZpdHlGYWlsdXJlYCB3aXRoIGBjYXVzZWAgc2V0IHRvIGBDYW5jZWxsZWRGYWlsdXJlYFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBzY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICogY29uc3QgcHJvbWlzZSA9IHNjb3BlLnJ1bihzb21lQWN0aXZpdHkpO1xuICogc2NvcGUuY2FuY2VsKCk7IC8vIENhbmNlbHMgdGhlIGFjdGl2aXR5XG4gKiBhd2FpdCBwcm9taXNlOyAvLyBUaHJvd3MgYEFjdGl2aXR5RmFpbHVyZWAgd2l0aCBgY2F1c2VgIHNldCB0byBgQ2FuY2VsbGVkRmFpbHVyZWBcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSB0aW1lb3V0PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBJZiBmYWxzZSwgcHJldmVudCBvdXRlciBjYW5jZWxsYXRpb24gZnJvbSBwcm9wYWdhdGluZyB0byBpbm5lciBzY29wZXMsIEFjdGl2aXRpZXMsIHRpbWVycywgYW5kIFRyaWdnZXJzLCBkZWZhdWx0cyB0byB0cnVlLlxuICAgKiAoU2NvcGUgc3RpbGwgcHJvcGFnYXRlcyBDYW5jZWxsZWRGYWlsdXJlIHRocm93biBmcm9tIHdpdGhpbilcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBjYW5jZWxsYWJsZTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIENhbmNlbGxhdGlvblNjb3BlICh1c2VmdWwgZm9yIHJ1bm5pbmcgYmFja2dyb3VuZCB0YXNrcyksIGRlZmF1bHRzIHRvIHtAbGluayBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50fSgpXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcGFyZW50PzogQ2FuY2VsbGF0aW9uU2NvcGU7XG5cbiAgLyoqXG4gICAqIFJlamVjdGVkIHdoZW4gc2NvcGUgY2FuY2VsbGF0aW9uIGlzIHJlcXVlc3RlZFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNhbmNlbFJlcXVlc3RlZDogUHJvbWlzZTxuZXZlcj47XG5cbiAgI2NhbmNlbFJlcXVlc3RlZCA9IGZhbHNlO1xuXG4gIC8vIFR5cGVzY3JpcHQgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IHRoZSBQcm9taXNlIGV4ZWN1dG9yIHJ1bnMgc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHByb3RlY3RlZCByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucykge1xuICAgIHRoaXMudGltZW91dCA9IG9wdGlvbnM/LnRpbWVvdXQ7XG4gICAgdGhpcy5jYW5jZWxsYWJsZSA9IG9wdGlvbnM/LmNhbmNlbGxhYmxlID8/IHRydWU7XG4gICAgdGhpcy5jYW5jZWxSZXF1ZXN0ZWQgPSBuZXcgUHJvbWlzZSgoXywgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHVuZGVyc3RhbmQgdGhhdCB0aGUgUHJvbWlzZSBleGVjdXRvciBydW5zIHN5bmNocm9ub3VzbHlcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVqZWN0ID0gKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQpO1xuICAgIC8vIEF2b2lkIHVuaGFuZGxlZCByZWplY3Rpb25zXG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgaWYgKG9wdGlvbnM/LnBhcmVudCAhPT0gTk9fUEFSRU5UKSB7XG4gICAgICB0aGlzLnBhcmVudCA9IG9wdGlvbnM/LnBhcmVudCB8fCBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0aGlzLnBhcmVudC4jY2FuY2VsUmVxdWVzdGVkO1xuICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29uc2lkZXJlZENhbmNlbGxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jY2FuY2VsUmVxdWVzdGVkICYmIHRoaXMuY2FuY2VsbGFibGU7XG4gIH1cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBzY29wZSBhcyBjdXJyZW50IGFuZCBydW4gIGBmbmBcbiAgICpcbiAgICogQW55IHRpbWVycywgQWN0aXZpdGllcywgVHJpZ2dlcnMgYW5kIENhbmNlbGxhdGlvblNjb3BlcyBjcmVhdGVkIGluIHRoZSBib2R5IG9mIGBmbmBcbiAgICogYXV0b21hdGljYWxseSBsaW5rIHRoZWlyIGNhbmNlbGxhdGlvbiB0byB0aGlzIHNjb3BlLlxuICAgKlxuICAgKiBAcmV0dXJuIHRoZSByZXN1bHQgb2YgYGZuYFxuICAgKi9cbiAgcnVuPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIHN0b3JhZ2UucnVuKHRoaXMsIHRoaXMucnVuSW5Db250ZXh0LmJpbmQodGhpcywgZm4pIGFzICgpID0+IFByb21pc2U8VD4pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0aGF0IHJ1bnMgYSBmdW5jdGlvbiBpbiBBc3luY0xvY2FsU3RvcmFnZSBjb250ZXh0LlxuICAgKlxuICAgKiBDb3VsZCBoYXZlIGJlZW4gd3JpdHRlbiBhcyBhbm9ueW1vdXMgZnVuY3Rpb24sIG1hZGUgaW50byBhIG1ldGhvZCBmb3IgaW1wcm92ZWQgc3RhY2sgdHJhY2VzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJ1bkluQ29udGV4dDxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIGlmICh0aGlzLnRpbWVvdXQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzbGVlcCh0aGlzLnRpbWVvdXQpLnRoZW4oXG4gICAgICAgICAgKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAvLyBzY29wZSB3YXMgYWxyZWFkeSBjYW5jZWxsZWQsIGlnbm9yZVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0byBjYW5jZWwgdGhlIHNjb3BlIGFuZCBsaW5rZWQgY2hpbGRyZW5cbiAgICovXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlamVjdChuZXcgQ2FuY2VsbGVkRmFpbHVyZSgnQ2FuY2VsbGF0aW9uIHNjb3BlIGNhbmNlbGxlZCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgXCJhY3RpdmVcIiBzY29wZVxuICAgKi9cbiAgc3RhdGljIGN1cnJlbnQoKTogQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAgIC8vIFVzaW5nIGdsb2JhbHMgZGlyZWN0bHkgaW5zdGVhZCBvZiBhIGhlbHBlciBmdW5jdGlvbiB0byBhdm9pZCBjaXJjdWxhciBpbXBvcnRcbiAgICByZXR1cm4gc3RvcmFnZS5nZXRTdG9yZSgpID8/IChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9fLmFjdGl2YXRvci5yb290U2NvcGU7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyBjYW5jZWxsYWJsZTxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbik7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiBmYWxzZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgbm9uQ2FuY2VsbGFibGU8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogZmFsc2UgfSkucnVuKGZuKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUsIHRpbWVvdXQgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIHdpdGhUaW1lb3V0PFQ+KHRpbWVvdXQ6IG51bWJlciwgZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgdGltZW91dCB9KS5ydW4oZm4pO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBpcyBleHBvcnRlZCBzbyBpdCBjYW4gYmUgZGlzcG9zZWQgaW4gdGhlIHdvcmtlciBpbnRlcmZhY2VcbiAqL1xuZXhwb3J0IGNvbnN0IHN0b3JhZ2UgPSBuZXcgQXN5bmNMb2NhbFN0b3JhZ2U8Q2FuY2VsbGF0aW9uU2NvcGU+KCk7XG5cbmV4cG9ydCBjbGFzcyBSb290Q2FuY2VsbGF0aW9uU2NvcGUgZXh0ZW5kcyBDYW5jZWxsYXRpb25TY29wZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHsgY2FuY2VsbGFibGU6IHRydWUsIHBhcmVudDogTk9fUEFSRU5UIH0pO1xuICB9XG5cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0KG5ldyBDYW5jZWxsZWRGYWlsdXJlKCdXb3JrZmxvdyBjYW5jZWxsZWQnKSk7XG4gIH1cbn1cblxuLyoqIFRoaXMgZnVuY3Rpb24gaXMgaGVyZSB0byBhdm9pZCBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYmV0d2VlbiB0aGlzIG1vZHVsZSBhbmQgd29ya2Zsb3cudHMgKi9cbmxldCBzbGVlcCA9IChfOiBudW1iZXIgfCBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyBoYXMgbm90IGJlZW4gcHJvcGVybHkgaW5pdGlhbGl6ZWQnKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24oZm46IHR5cGVvZiBzbGVlcCk6IHZvaWQge1xuICBzbGVlcCA9IGZuO1xufVxuIiwiLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgd29ya2Zsb3cgZXJyb3JzXG4gKi9cbmV4cG9ydCBjbGFzcyBXb3JrZmxvd0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZTogc3RyaW5nID0gJ1dvcmtmbG93RXJyb3InO1xufVxuXG4vKipcbiAqIFRocm93biBpbiB3b3JrZmxvdyB3aGVuIGl0IHRyaWVzIHRvIGRvIHNvbWV0aGluZyB0aGF0IG5vbi1kZXRlcm1pbmlzdGljIHN1Y2ggYXMgY29uc3RydWN0IGEgV2Vha01hcCgpXG4gKi9cbmV4cG9ydCBjbGFzcyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lOiBzdHJpbmcgPSAnRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcic7XG59XG5cbmZ1bmN0aW9uIGxvb2tzTGlrZUVycm9yKGVycjogdW5rbm93bik6IGVyciBpcyB7IG5hbWU6IHN0cmluZzsgY2F1c2U/OiB1bmtub3duIH0ge1xuICByZXR1cm4gdHlwZW9mIGVyciA9PT0gJ29iamVjdCcgJiYgZXJyICE9IG51bGwgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGVyciwgJ25hbWUnKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgcHJvdmlkZWQgYGVycmAgaXMgY2F1c2VkIGJ5IGNhbmNlbGxhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDYW5jZWxsYXRpb24oZXJyOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIGlmICghbG9va3NMaWtlRXJyb3IoZXJyKSkgcmV0dXJuIGZhbHNlO1xuICByZXR1cm4gKFxuICAgIGVyci5uYW1lID09PSAnQ2FuY2VsbGVkRmFpbHVyZScgfHxcbiAgICAoKGVyci5uYW1lID09PSAnQWN0aXZpdHlGYWlsdXJlJyB8fCBlcnIubmFtZSA9PT0gJ0NoaWxkV29ya2Zsb3dGYWlsdXJlJykgJiZcbiAgICAgIGxvb2tzTGlrZUVycm9yKGVyci5jYXVzZSkgJiZcbiAgICAgIGVyci5jYXVzZS5uYW1lID09PSAnQ2FuY2VsbGVkRmFpbHVyZScpXG4gICk7XG59XG4iLCIvKipcbiAqIFRoaXMgbGlicmFyeSBwcm92aWRlcyB0b29scyByZXF1aXJlZCBmb3IgYXV0aG9yaW5nIHdvcmtmbG93cy5cbiAqXG4gKiAjIyBVc2FnZVxuICogU2VlIHRoZSB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvaGVsbG8td29ybGQjd29ya2Zsb3dzIHwgdHV0b3JpYWx9IGZvciB3cml0aW5nIHlvdXIgZmlyc3Qgd29ya2Zsb3cuXG4gKlxuICogIyMjIFRpbWVyc1xuICpcbiAqIFRoZSByZWNvbW1lbmRlZCB3YXkgb2Ygc2NoZWR1bGluZyB0aW1lcnMgaXMgYnkgdXNpbmcgdGhlIHtAbGluayBzbGVlcH0gZnVuY3Rpb24uIFdlJ3ZlIHJlcGxhY2VkIGBzZXRUaW1lb3V0YCBhbmRcbiAqIGBjbGVhclRpbWVvdXRgIHdpdGggZGV0ZXJtaW5pc3RpYyB2ZXJzaW9ucyBzbyB0aGVzZSBhcmUgYWxzbyB1c2FibGUgYnV0IGhhdmUgYSBsaW1pdGF0aW9uIHRoYXQgdGhleSBkb24ndCBwbGF5IHdlbGxcbiAqIHdpdGgge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2NhbmNlbGxhdGlvbi1zY29wZXMgfCBjYW5jZWxsYXRpb24gc2NvcGVzfS5cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtc2xlZXAtd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIEFjdGl2aXRpZXNcbiAqXG4gKiBUbyBzY2hlZHVsZSBBY3Rpdml0aWVzLCB1c2Uge0BsaW5rIHByb3h5QWN0aXZpdGllc30gdG8gb2J0YWluIGFuIEFjdGl2aXR5IGZ1bmN0aW9uIGFuZCBjYWxsLlxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC1zY2hlZHVsZS1hY3Rpdml0eS13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgU2lnbmFscyBhbmQgUXVlcmllc1xuICpcbiAqIFRvIGFkZCBzaWduYWwgaGFuZGxlcnMgdG8gYSBXb3JrZmxvdywgYWRkIGEgc2lnbmFscyBwcm9wZXJ0eSB0byB0aGUgZXhwb3J0ZWQgYHdvcmtmbG93YCBvYmplY3QuIFNpZ25hbCBoYW5kbGVycyBjYW5cbiAqIHJldHVybiBlaXRoZXIgYHZvaWRgIG9yIGBQcm9taXNlPHZvaWQ+YCwgeW91IG1heSBzY2hlZHVsZSBhY3Rpdml0aWVzIGFuZCB0aW1lcnMgZnJvbSBhIHNpZ25hbCBoYW5kbGVyLlxuICpcbiAqIFRvIGFkZCBxdWVyeSBoYW5kbGVycyB0byBhIFdvcmtmbG93LCBhZGQgYSBxdWVyaWVzIHByb3BlcnR5IHRvIHRoZSBleHBvcnRlZCBgd29ya2Zsb3dgIG9iamVjdC4gUXVlcnkgaGFuZGxlcnMgbXVzdFxuICogKipub3QqKiBtdXRhdGUgYW55IHZhcmlhYmxlcyBvciBnZW5lcmF0ZSBhbnkgY29tbWFuZHMgKGxpa2UgQWN0aXZpdGllcyBvciBUaW1lcnMpLCB0aGV5IHJ1biBzeW5jaHJvbm91c2x5IGFuZCB0aHVzXG4gKiAqKm11c3QqKiByZXR1cm4gYSBgUHJvbWlzZWAuXG4gKlxuICogIyMjIyBJbXBsZW1lbnRhdGlvblxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC13b3JrZmxvdy1zaWduYWwtaW1wbGVtZW50YXRpb24tLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKlxuICogIyMjIE1vcmVcbiAqXG4gKiAtIFtEZXRlcm1pbmlzdGljIGJ1aWx0LWluc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvZGV0ZXJtaW5pc20jc291cmNlcy1vZi1ub24tZGV0ZXJtaW5pc20pXG4gKiAtIFtDYW5jZWxsYXRpb24gYW5kIHNjb3Blc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvY2FuY2VsbGF0aW9uLXNjb3BlcylcbiAqICAgLSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9XG4gKiAgIC0ge0BsaW5rIFRyaWdnZXJ9XG4gKiAtIFtTaW5rc10oaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2FwcGxpY2F0aW9uLWRldmVsb3BtZW50L29ic2VydmFiaWxpdHkvP2xhbmc9dHMjbG9nZ2luZylcbiAqICAgLSB7QGxpbmsgU2lua3N9XG4gKlxuICogQG1vZHVsZVxuICovXG5cbmV4cG9ydCB7XG4gIEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBY3Rpdml0eU9wdGlvbnMsXG4gIEFwcGxpY2F0aW9uRmFpbHVyZSxcbiAgQ2FuY2VsbGVkRmFpbHVyZSxcbiAgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUsXG4gIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBQYXlsb2FkQ29udmVydGVyLFxuICBSZXRyeVBvbGljeSxcbiAgcm9vdENhdXNlLFxuICBTZXJ2ZXJGYWlsdXJlLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFRlcm1pbmF0ZWRGYWlsdXJlLFxuICBUaW1lb3V0RmFpbHVyZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmV4cG9ydCAqIGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvZXJyb3JzJztcbmV4cG9ydCB7XG4gIEFjdGl2aXR5RnVuY3Rpb24sXG4gIEFjdGl2aXR5SW50ZXJmYWNlLCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlcHJlY2F0aW9uL2RlcHJlY2F0aW9uXG4gIFBheWxvYWQsXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgU2VhcmNoQXR0cmlidXRlcyxcbiAgU2VhcmNoQXR0cmlidXRlVmFsdWUsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIFVudHlwZWRBY3Rpdml0aWVzLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dRdWVyeVR5cGUsXG4gIFdvcmtmbG93UmVzdWx0VHlwZSxcbiAgV29ya2Zsb3dSZXR1cm5UeXBlLFxuICBXb3JrZmxvd1NpZ25hbFR5cGUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJmYWNlcyc7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3dvcmtmbG93LWhhbmRsZSc7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3dvcmtmbG93LW9wdGlvbnMnO1xuZXhwb3J0IHsgQXN5bmNMb2NhbFN0b3JhZ2UsIENhbmNlbGxhdGlvblNjb3BlLCBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5leHBvcnQgKiBmcm9tICcuL2Vycm9ycyc7XG5leHBvcnQgKiBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5leHBvcnQge1xuICBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnMsXG4gIENvbnRpbnVlQXNOZXcsXG4gIENvbnRpbnVlQXNOZXdPcHRpb25zLFxuICBFbmhhbmNlZFN0YWNrVHJhY2UsXG4gIEZpbGVMb2NhdGlvbixcbiAgRmlsZVNsaWNlLFxuICBQYXJlbnRDbG9zZVBvbGljeSxcbiAgUGFyZW50V29ya2Zsb3dJbmZvLFxuICBTREtJbmZvLFxuICBTdGFja1RyYWNlLFxuICBVbnNhZmVXb3JrZmxvd0luZm8sXG4gIFdvcmtmbG93SW5mbyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCB7IExvZ2dlclNpbmtzLCBTaW5rLCBTaW5rQ2FsbCwgU2lua0Z1bmN0aW9uLCBTaW5rcyB9IGZyb20gJy4vc2lua3MnO1xuZXhwb3J0IHsgVHJpZ2dlciB9IGZyb20gJy4vdHJpZ2dlcic7XG5leHBvcnQgKiBmcm9tICcuL3dvcmtmbG93JztcbmV4cG9ydCB7IENoaWxkV29ya2Zsb3dIYW5kbGUsIEV4dGVybmFsV29ya2Zsb3dIYW5kbGUgfSBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG4iLCIvKipcbiAqIFR5cGUgZGVmaW5pdGlvbnMgYW5kIGdlbmVyaWMgaGVscGVycyBmb3IgaW50ZXJjZXB0b3JzLlxuICpcbiAqIFRoZSBXb3JrZmxvdyBzcGVjaWZpYyBpbnRlcmNlcHRvcnMgYXJlIGRlZmluZWQgaGVyZS5cbiAqXG4gKiBAbW9kdWxlXG4gKi9cblxuaW1wb3J0IHsgQWN0aXZpdHlPcHRpb25zLCBIZWFkZXJzLCBMb2NhbEFjdGl2aXR5T3B0aW9ucywgTmV4dCwgVGltZXN0YW1wLCBXb3JrZmxvd0V4ZWN1dGlvbiB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cywgQ29udGludWVBc05ld09wdGlvbnMgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgeyBOZXh0LCBIZWFkZXJzIH07XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5leGVjdXRlICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93RXhlY3V0ZUlucHV0IHtcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlU2lnbmFsICovXG5leHBvcnQgaW50ZXJmYWNlIFNpZ25hbElucHV0IHtcbiAgcmVhZG9ubHkgc2lnbmFsTmFtZTogc3RyaW5nO1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvci5oYW5kbGVRdWVyeSAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeUlucHV0IHtcbiAgcmVhZG9ubHkgcXVlcnlJZDogc3RyaW5nO1xuICByZWFkb25seSBxdWVyeU5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKipcbiAqIEltcGxlbWVudCBhbnkgb2YgdGhlc2UgbWV0aG9kcyB0byBpbnRlcmNlcHQgV29ya2Zsb3cgaW5ib3VuZCBjYWxscyBsaWtlIGV4ZWN1dGlvbiwgYW5kIHNpZ25hbCBhbmQgcXVlcnkgaGFuZGxpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBleGVjdXRlIG1ldGhvZCBpcyBjYWxsZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIFdvcmtmbG93IGV4ZWN1dGlvblxuICAgKi9cbiAgZXhlY3V0ZT86IChpbnB1dDogV29ya2Zsb3dFeGVjdXRlSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2V4ZWN1dGUnPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKiogQ2FsbGVkIHdoZW4gc2lnbmFsIGlzIGRlbGl2ZXJlZCB0byBhIFdvcmtmbG93IGV4ZWN1dGlvbiAqL1xuICBoYW5kbGVTaWduYWw/OiAoaW5wdXQ6IFNpZ25hbElucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVTaWduYWwnPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gYSBXb3JrZmxvdyBpcyBxdWVyaWVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBxdWVyeVxuICAgKi9cbiAgaGFuZGxlUXVlcnk/OiAoaW5wdXQ6IFF1ZXJ5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVF1ZXJ5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2NoZWR1bGVBY3Rpdml0eSAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zY2hlZHVsZUxvY2FsQWN0aXZpdHkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxBY3Rpdml0eUlucHV0IHtcbiAgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgb3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBvcmlnaW5hbFNjaGVkdWxlVGltZT86IFRpbWVzdGFtcDtcbiAgcmVhZG9ubHkgYXR0ZW1wdDogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCB7XG4gIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nO1xuICByZWFkb25seSBvcHRpb25zOiBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc3RhcnRUaW1lciAqL1xuZXhwb3J0IGludGVyZmFjZSBUaW1lcklucHV0IHtcbiAgcmVhZG9ubHkgZHVyYXRpb25NczogbnVtYmVyO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqXG4gKiBTYW1lIGFzIENvbnRpbnVlQXNOZXdPcHRpb25zIGJ1dCB3b3JrZmxvd1R5cGUgbXVzdCBiZSBkZWZpbmVkXG4gKi9cbmV4cG9ydCB0eXBlIENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnMgPSBDb250aW51ZUFzTmV3T3B0aW9ucyAmIFJlcXVpcmVkPFBpY2s8Q29udGludWVBc05ld09wdGlvbnMsICd3b3JrZmxvd1R5cGUnPj47XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3IuY29udGludWVBc05ldyAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250aW51ZUFzTmV3SW5wdXQge1xuICByZWFkb25seSBhcmdzOiB1bmtub3duW107XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IENvbnRpbnVlQXNOZXdJbnB1dE9wdGlvbnM7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc2lnbmFsV29ya2Zsb3cgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lnbmFsV29ya2Zsb3dJbnB1dCB7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xuICByZWFkb25seSBzaWduYWxOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgdGFyZ2V0OlxuICAgIHwge1xuICAgICAgICByZWFkb25seSB0eXBlOiAnZXh0ZXJuYWwnO1xuICAgICAgICByZWFkb25seSB3b3JrZmxvd0V4ZWN1dGlvbjogV29ya2Zsb3dFeGVjdXRpb247XG4gICAgICB9XG4gICAgfCB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGU6ICdjaGlsZCc7XG4gICAgICAgIHJlYWRvbmx5IGNoaWxkV29ya2Zsb3dJZDogc3RyaW5nO1xuICAgICAgfTtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnQgYW55IG9mIHRoZXNlIG1ldGhvZHMgdG8gaW50ZXJjZXB0IFdvcmtmbG93IGNvZGUgY2FsbHMgdG8gdGhlIFRlbXBvcmFsIEFQSXMsIGxpa2Ugc2NoZWR1bGluZyBhbiBhY3Rpdml0eSBhbmQgc3RhcnRpbmcgYSB0aW1lclxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhbiBBY3Rpdml0eVxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgYWN0aXZpdHkgZXhlY3V0aW9uXG4gICAqL1xuICBzY2hlZHVsZUFjdGl2aXR5PzogKGlucHV0OiBBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUFjdGl2aXR5Jz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNjaGVkdWxlcyBhIGxvY2FsIEFjdGl2aXR5XG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBhY3Rpdml0eSBleGVjdXRpb25cbiAgICovXG4gIHNjaGVkdWxlTG9jYWxBY3Rpdml0eT86IChpbnB1dDogTG9jYWxBY3Rpdml0eUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzY2hlZHVsZUxvY2FsQWN0aXZpdHknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc3RhcnRzIGEgdGltZXJcbiAgICovXG4gIHN0YXJ0VGltZXI/OiAoaW5wdXQ6IFRpbWVySW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3N0YXJ0VGltZXInPikgPT4gUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgY2FsbHMgY29udGludWVBc05ld1xuICAgKi9cbiAgY29udGludWVBc05ldz86IChpbnB1dDogQ29udGludWVBc05ld0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdjb250aW51ZUFzTmV3Jz4pID0+IFByb21pc2U8bmV2ZXI+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzaWduYWxzIGEgY2hpbGQgb3IgZXh0ZXJuYWwgV29ya2Zsb3dcbiAgICovXG4gIHNpZ25hbFdvcmtmbG93PzogKGlucHV0OiBTaWduYWxXb3JrZmxvd0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdzaWduYWxXb3JrZmxvdyc+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzdGFydHMgYSBjaGlsZCB3b3JrZmxvdyBleGVjdXRpb24sIHRoZSBpbnRlcmNlcHRvciBmdW5jdGlvbiByZXR1cm5zIDIgcHJvbWlzZXM6XG4gICAqXG4gICAqIC0gVGhlIGZpcnN0IHJlc29sdmVzIHdpdGggdGhlIGBydW5JZGAgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgaGFzIHN0YXJ0ZWQgb3IgcmVqZWN0cyBpZiBmYWlsZWQgdG8gc3RhcnQuXG4gICAqIC0gVGhlIHNlY29uZCByZXNvbHZlcyB3aXRoIHRoZSB3b3JrZmxvdyByZXN1bHQgd2hlbiB0aGUgY2hpbGQgd29ya2Zsb3cgY29tcGxldGVzIG9yIHJlamVjdHMgb24gZmFpbHVyZS5cbiAgICovXG4gIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbj86IChcbiAgICBpbnB1dDogU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gICAgbmV4dDogTmV4dDx0aGlzLCAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJz5cbiAgKSA9PiBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmNvbmNsdWRlQWN0aXZhdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCB7XG4gIGNvbW1hbmRzOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmRbXTtcbn1cblxuLyoqIE91dHB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5jb25jbHVkZUFjdGl2YXRpb24gKi9cbmV4cG9ydCB0eXBlIENvbmNsdWRlQWN0aXZhdGlvbk91dHB1dCA9IENvbmNsdWRlQWN0aXZhdGlvbklucHV0O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuYWN0aXZhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZhdGVJbnB1dCB7XG4gIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uO1xuICBiYXRjaEluZGV4OiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5kaXNwb3NlICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWVtcHR5LWludGVyZmFjZVxuZXhwb3J0IGludGVyZmFjZSBEaXNwb3NlSW5wdXQge31cblxuLyoqXG4gKiBJbnRlcmNlcHRvciBmb3IgdGhlIGludGVybmFscyBvZiB0aGUgV29ya2Zsb3cgcnVudGltZS5cbiAqXG4gKiBVc2UgdG8gbWFuaXB1bGF0ZSBvciB0cmFjZSBXb3JrZmxvdyBhY3RpdmF0aW9ucy5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgV29ya2Zsb3cgcnVudGltZSBydW5zIGEgV29ya2Zsb3dBY3RpdmF0aW9uSm9iLlxuICAgKi9cbiAgYWN0aXZhdGU/KGlucHV0OiBBY3RpdmF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdhY3RpdmF0ZSc+KTogdm9pZDtcblxuICAvKipcbiAgICogQ2FsbGVkIGFmdGVyIGFsbCBgV29ya2Zsb3dBY3RpdmF0aW9uSm9iYHMgaGF2ZSBiZWVuIHByb2Nlc3NlZCBmb3IgYW4gYWN0aXZhdGlvbi5cbiAgICpcbiAgICogQ2FuIG1hbmlwdWxhdGUgdGhlIGNvbW1hbmRzIGdlbmVyYXRlZCBieSB0aGUgV29ya2Zsb3dcbiAgICovXG4gIGNvbmNsdWRlQWN0aXZhdGlvbj8oaW5wdXQ6IENvbmNsdWRlQWN0aXZhdGlvbklucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdjb25jbHVkZUFjdGl2YXRpb24nPik6IENvbmNsdWRlQWN0aXZhdGlvbk91dHB1dDtcblxuICAvKipcbiAgICogQ2FsbGVkIGJlZm9yZSBkaXNwb3NpbmcgdGhlIFdvcmtmbG93IGlzb2xhdGUgY29udGV4dC5cbiAgICpcbiAgICogSW1wbGVtZW50IHRoaXMgbWV0aG9kIHRvIHBlcmZvcm0gYW55IHJlc291cmNlIGNsZWFudXAuXG4gICAqL1xuICBkaXNwb3NlPyhpbnB1dDogRGlzcG9zZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdkaXNwb3NlJz4pOiB2b2lkO1xufVxuXG4vKipcbiAqIEEgbWFwcGluZyBmcm9tIGludGVyY2VwdG9yIHR5cGUgdG8gYW4gb3B0aW9uYWwgbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0ludGVyY2VwdG9ycyB7XG4gIGluYm91bmQ/OiBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yW107XG4gIG91dGJvdW5kPzogV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3JbXTtcbiAgaW50ZXJuYWxzPzogV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvcltdO1xufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHtAbGluayBXb3JrZmxvd0ludGVyY2VwdG9yc30gYW5kIHRha2VzIG5vIGFyZ3VtZW50cy5cbiAqXG4gKiBXb3JrZmxvdyBpbnRlcmNlcHRvciBtb2R1bGVzIHNob3VsZCBleHBvcnQgYW4gYGludGVyY2VwdG9yc2AgZnVuY3Rpb24gb2YgdGhpcyB0eXBlLlxuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIGV4cG9ydCBmdW5jdGlvbiBpbnRlcmNlcHRvcnMoKTogV29ya2Zsb3dJbnRlcmNlcHRvcnMge1xuICogICByZXR1cm4ge1xuICogICAgIGluYm91bmQ6IFtdLCAgIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgICBvdXRib3VuZDogW10sICAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgICAgaW50ZXJuYWxzOiBbXSwgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICB9O1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSA9ICgpID0+IFdvcmtmbG93SW50ZXJjZXB0b3JzO1xuIiwiaW1wb3J0IHR5cGUgeyBSYXdTb3VyY2VNYXAgfSBmcm9tICdzb3VyY2UtbWFwJztcbmltcG9ydCB7IFJldHJ5UG9saWN5LCBUZW1wb3JhbEZhaWx1cmUsIENvbW1vbldvcmtmbG93T3B0aW9ucywgU2VhcmNoQXR0cmlidXRlcyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5cbi8qKlxuICogV29ya2Zsb3cgRXhlY3V0aW9uIGluZm9ybWF0aW9uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbmZvIHtcbiAgLyoqXG4gICAqIElEIG9mIHRoZSBXb3JrZmxvdywgdGhpcyBjYW4gYmUgc2V0IGJ5IHRoZSBjbGllbnQgZHVyaW5nIFdvcmtmbG93IGNyZWF0aW9uLlxuICAgKiBBIHNpbmdsZSBXb3JrZmxvdyBtYXkgcnVuIG11bHRpcGxlIHRpbWVzIGUuZy4gd2hlbiBzY2hlZHVsZWQgd2l0aCBjcm9uLlxuICAgKi9cbiAgd29ya2Zsb3dJZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJRCBvZiBhIHNpbmdsZSBXb3JrZmxvdyBydW5cbiAgICovXG4gIHJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFdvcmtmbG93IGZ1bmN0aW9uJ3MgbmFtZVxuICAgKi9cbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEluZGV4ZWQgaW5mb3JtYXRpb24gYXR0YWNoZWQgdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvblxuICAgKlxuICAgKiBUaGlzIHZhbHVlIG1heSBjaGFuZ2UgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzO1xuXG4gIC8qKlxuICAgKiBOb24taW5kZXhlZCBpbmZvcm1hdGlvbiBhdHRhY2hlZCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFBhcmVudCBXb3JrZmxvdyBpbmZvIChwcmVzZW50IGlmIHRoaXMgaXMgYSBDaGlsZCBXb3JrZmxvdylcbiAgICovXG4gIHBhcmVudD86IFBhcmVudFdvcmtmbG93SW5mbztcblxuICAvKipcbiAgICogUmVzdWx0IGZyb20gdGhlIHByZXZpb3VzIFJ1biAocHJlc2VudCBpZiB0aGlzIGlzIGEgQ3JvbiBXb3JrZmxvdyBvciB3YXMgQ29udGludWVkIEFzIE5ldykuXG4gICAqXG4gICAqIEFuIGFycmF5IG9mIHZhbHVlcywgc2luY2Ugb3RoZXIgU0RLcyBtYXkgcmV0dXJuIG11bHRpcGxlIHZhbHVlcyBmcm9tIGEgV29ya2Zsb3cuXG4gICAqL1xuICBsYXN0UmVzdWx0PzogdW5rbm93bjtcblxuICAvKipcbiAgICogRmFpbHVyZSBmcm9tIHRoZSBwcmV2aW91cyBSdW4gKHByZXNlbnQgd2hlbiB0aGlzIFJ1biBpcyBhIHJldHJ5LCBvciB0aGUgbGFzdCBSdW4gb2YgYSBDcm9uIFdvcmtmbG93IGZhaWxlZClcbiAgICovXG4gIGxhc3RGYWlsdXJlPzogVGVtcG9yYWxGYWlsdXJlO1xuXG4gIC8qKlxuICAgKiBMZW5ndGggb2YgV29ya2Zsb3cgaGlzdG9yeSB1cCB1bnRpbCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFlvdSBtYXkgc2FmZWx5IHVzZSB0aGlzIGluZm9ybWF0aW9uIHRvIGRlY2lkZSB3aGVuIHRvIHtAbGluayBjb250aW51ZUFzTmV3fS5cbiAgICovXG4gIGhpc3RvcnlMZW5ndGg6IG51bWJlcjtcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBvblxuICAgKi9cbiAgdGFza1F1ZXVlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE5hbWVzcGFjZSB0aGlzIFdvcmtmbG93IGlzIGV4ZWN1dGluZyBpblxuICAgKi9cbiAgbmFtZXNwYWNlOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFJ1biBJZCBvZiB0aGUgZmlyc3QgUnVuIGluIHRoaXMgRXhlY3V0aW9uIENoYWluXG4gICAqL1xuICBmaXJzdEV4ZWN1dGlvblJ1bklkOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBsYXN0IFJ1biBJZCBpbiB0aGlzIEV4ZWN1dGlvbiBDaGFpblxuICAgKi9cbiAgY29udGludWVkRnJvbUV4ZWN1dGlvblJ1bklkPzogc3RyaW5nO1xuXG4gIC8vIFRPRE8gZXhwb3NlIGZyb20gQ29yZVxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGUgV29ya2Zsb3cgUnVuIHN0YXJ0ZWRcbiAgICovXG4gIC8vIHN0YXJ0VGltZTogRGF0ZTtcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGFmdGVyIHdoaWNoIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIFNlcnZlci4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93RXhlY3V0aW9uVGltZW91dH0uXG4gICAqL1xuICBleGVjdXRpb25UaW1lb3V0TXM/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRpbWUgYXQgd2hpY2ggdGhlIFdvcmtmbG93IEV4ZWN1dGlvbiBleHBpcmVzXG4gICAqL1xuICBleGVjdXRpb25FeHBpcmF0aW9uVGltZT86IERhdGU7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgV29ya2Zsb3cgUnVuIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1J1blRpbWVvdXR9LlxuICAgKi9cbiAgcnVuVGltZW91dE1zPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgV29ya2Zsb3cgVGFzayBpbiBtaWxsaXNlY29uZHMuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0fS5cbiAgICovXG4gIHRhc2tUaW1lb3V0TXM6IG51bWJlcjtcblxuICAvKipcbiAgICogUmV0cnkgUG9saWN5IGZvciB0aGlzIEV4ZWN1dGlvbi4gU2V0IHZpYSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLnJldHJ5fS5cbiAgICovXG4gIHJldHJ5UG9saWN5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIFN0YXJ0cyBhdCAxIGFuZCBpbmNyZW1lbnRzIGZvciBldmVyeSByZXRyeSBpZiB0aGVyZSBpcyBhIGByZXRyeVBvbGljeWBcbiAgICovXG4gIGF0dGVtcHQ6IG51bWJlcjtcblxuICAvKipcbiAgICogQ3JvbiBTY2hlZHVsZSBmb3IgdGhpcyBFeGVjdXRpb24uIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy5jcm9uU2NoZWR1bGV9LlxuICAgKi9cbiAgY3JvblNjaGVkdWxlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYmV0d2VlbiBDcm9uIFJ1bnNcbiAgICovXG4gIGNyb25TY2hlZHVsZVRvU2NoZWR1bGVJbnRlcnZhbD86IG51bWJlcjtcblxuICB1bnNhZmU6IFVuc2FmZVdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBVbnNhZmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uLlxuICpcbiAqIE5ldmVyIHJlbHkgb24gdGhpcyBpbmZvcm1hdGlvbiBpbiBXb3JrZmxvdyBsb2dpYyBhcyBpdCB3aWxsIGNhdXNlIG5vbi1kZXRlcm1pbmlzdGljIGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVuc2FmZVdvcmtmbG93SW5mbyB7XG4gIC8qKlxuICAgKiBDdXJyZW50IHN5c3RlbSB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgKlxuICAgKiBUaGUgc2FmZSB2ZXJzaW9uIG9mIHRpbWUgaXMgYG5ldyBEYXRlKClgIGFuZCBgRGF0ZS5ub3coKWAsIHdoaWNoIGFyZSBzZXQgb24gdGhlIGZpcnN0IGludm9jYXRpb24gb2YgYSBXb3JrZmxvd1xuICAgKiBUYXNrIGFuZCBzdGF5IGNvbnN0YW50IGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIFRhc2sgYW5kIGR1cmluZyByZXBsYXkuXG4gICAqL1xuICBub3coKTogbnVtYmVyO1xuXG4gIGlzUmVwbGF5aW5nOiBib29sZWFuO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcmVudFdvcmtmbG93SW5mbyB7XG4gIHdvcmtmbG93SWQ6IHN0cmluZztcbiAgcnVuSWQ6IHN0cmluZztcbiAgbmFtZXNwYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogTm90IGFuIGFjdHVhbCBlcnJvciwgdXNlZCBieSB0aGUgV29ya2Zsb3cgcnVudGltZSB0byBhYm9ydCBleGVjdXRpb24gd2hlbiB7QGxpbmsgY29udGludWVBc05ld30gaXMgY2FsbGVkXG4gKi9cbmV4cG9ydCBjbGFzcyBDb250aW51ZUFzTmV3IGV4dGVuZHMgRXJyb3Ige1xuICBwdWJsaWMgcmVhZG9ubHkgbmFtZSA9ICdDb250aW51ZUFzTmV3JztcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgY29tbWFuZDogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JQ29udGludWVBc05ld1dvcmtmbG93RXhlY3V0aW9uKSB7XG4gICAgc3VwZXIoJ1dvcmtmbG93IGNvbnRpbnVlZCBhcyBuZXcnKTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGNvbnRpbnVpbmcgYSBXb3JrZmxvdyBhcyBuZXdcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250aW51ZUFzTmV3T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIFdvcmtmbG93IHR5cGUgbmFtZSwgZS5nLiB0aGUgZmlsZW5hbWUgaW4gdGhlIE5vZGUuanMgU0RLIG9yIGNsYXNzIG5hbWUgaW4gSmF2YVxuICAgKi9cbiAgd29ya2Zsb3dUeXBlPzogc3RyaW5nO1xuICAvKipcbiAgICogVGFzayBxdWV1ZSB0byBjb250aW51ZSB0aGUgV29ya2Zsb3cgaW5cbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcbiAgLyoqXG4gICAqIFRpbWVvdXQgZm9yIHRoZSBlbnRpcmUgV29ya2Zsb3cgcnVuXG4gICAqIEBmb3JtYXQge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93UnVuVGltZW91dD86IHN0cmluZztcbiAgLyoqXG4gICAqIFRpbWVvdXQgZm9yIGEgc2luZ2xlIFdvcmtmbG93IHRhc2tcbiAgICogQGZvcm1hdCB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dUYXNrVGltZW91dD86IHN0cmluZztcbiAgLyoqXG4gICAqIE5vbi1zZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIC8qKlxuICAgKiBTZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzPzogU2VhcmNoQXR0cmlidXRlcztcbn1cblxuLyoqXG4gKiBTcGVjaWZpZXM6XG4gKiAtIHdoZXRoZXIgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGFyZSBzZW50IHRvIHRoZSBDaGlsZFxuICogLSB3aGV0aGVyIGFuZCB3aGVuIGEge0BsaW5rIENhbmNlbGVkRmFpbHVyZX0gaXMgdGhyb3duIGZyb20ge0BsaW5rIGV4ZWN1dGVDaGlsZH0gb3JcbiAqICAge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGUucmVzdWx0fVxuICpcbiAqIEBkZWZhdWx0IHtAbGluayBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUR9XG4gKi9cbmV4cG9ydCBlbnVtIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlIHtcbiAgLyoqXG4gICAqIERvbid0IHNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuXG4gICAqL1xuICBBQkFORE9OID0gMCxcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gSW1tZWRpYXRlbHkgdGhyb3cgdGhlIGVycm9yLlxuICAgKi9cbiAgVFJZX0NBTkNFTCA9IDEsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIFRoZSBDaGlsZCBtYXkgcmVzcGVjdCBjYW5jZWxsYXRpb24sIGluIHdoaWNoIGNhc2UgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd25cbiAgICogd2hlbiBjYW5jZWxsYXRpb24gaGFzIGNvbXBsZXRlZCwgYW5kIHtAbGluayBpc0NhbmNlbGxhdGlvbn0oZXJyb3IpIHdpbGwgYmUgdHJ1ZS4gT24gdGhlIG90aGVyIGhhbmQsIHRoZSBDaGlsZCBtYXlcbiAgICogaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdCwgaW4gd2hpY2ggY2FzZSBhbiBlcnJvciBtaWdodCBiZSB0aHJvd24gd2l0aCBhIGRpZmZlcmVudCBjYXVzZSwgb3IgdGhlIENoaWxkIG1heVxuICAgKiBjb21wbGV0ZSBzdWNjZXNzZnVsbHkuXG4gICAqXG4gICAqIEBkZWZhdWx0XG4gICAqL1xuICBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUQgPSAyLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBUaHJvdyB0aGUgZXJyb3Igb25jZSB0aGUgU2VydmVyIHJlY2VpdmVzIHRoZSBDaGlsZCBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICovXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX1JFUVVFU1RFRCA9IDMsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LkNoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLCBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5DaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZT4oKTtcblxuLyoqXG4gKiBIb3cgYSBDaGlsZCBXb3JrZmxvdyByZWFjdHMgdG8gdGhlIFBhcmVudCBXb3JrZmxvdyByZWFjaGluZyBhIENsb3NlZCBzdGF0ZS5cbiAqXG4gKiBAc2VlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vY29uY2VwdHMvd2hhdC1pcy1hLXBhcmVudC1jbG9zZS1wb2xpY3kvIHwgUGFyZW50IENsb3NlIFBvbGljeX1cbiAqL1xuZXhwb3J0IGVudW0gUGFyZW50Q2xvc2VQb2xpY3kge1xuICAvKipcbiAgICogSWYgYSBgUGFyZW50Q2xvc2VQb2xpY3lgIGlzIHNldCB0byB0aGlzLCBvciBpcyBub3Qgc2V0IGF0IGFsbCwgdGhlIHNlcnZlciBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfVU5TUEVDSUZJRUQgPSAwLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCB0aGUgQ2hpbGQgaXMgVGVybWluYXRlZC5cbiAgICpcbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfVEVSTUlOQVRFID0gMSxcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgbm90aGluZyBpcyBkb25lIHRvIHRoZSBDaGlsZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfQUJBTkRPTiA9IDIsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBDYW5jZWxsZWQuXG4gICAqL1xuICBQQVJFTlRfQ0xPU0VfUE9MSUNZX1JFUVVFU1RfQ0FOQ0VMID0gMyxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3ksIFBhcmVudENsb3NlUG9saWN5PigpO1xuY2hlY2tFeHRlbmRzPFBhcmVudENsb3NlUG9saWN5LCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlBhcmVudENsb3NlUG9saWN5PigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoaWxkV29ya2Zsb3dPcHRpb25zIGV4dGVuZHMgQ29tbW9uV29ya2Zsb3dPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdvcmtmbG93IGlkIHRvIHVzZSB3aGVuIHN0YXJ0aW5nLiBJZiBub3Qgc3BlY2lmaWVkIGEgVVVJRCBpcyBnZW5lcmF0ZWQuIE5vdGUgdGhhdCBpdCBpc1xuICAgKiBkYW5nZXJvdXMgYXMgaW4gY2FzZSBvZiBjbGllbnQgc2lkZSByZXRyaWVzIG5vIGRlZHVwbGljYXRpb24gd2lsbCBoYXBwZW4gYmFzZWQgb24gdGhlXG4gICAqIGdlbmVyYXRlZCBpZC4gU28gcHJlZmVyIGFzc2lnbmluZyBidXNpbmVzcyBtZWFuaW5nZnVsIGlkcyBpZiBwb3NzaWJsZS5cbiAgICovXG4gIHdvcmtmbG93SWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdG8gdXNlIGZvciBXb3JrZmxvdyB0YXNrcy4gSXQgc2hvdWxkIG1hdGNoIGEgdGFzayBxdWV1ZSBzcGVjaWZpZWQgd2hlbiBjcmVhdGluZyBhXG4gICAqIGBXb3JrZXJgIHRoYXQgaG9zdHMgdGhlIFdvcmtmbG93IGNvZGUuXG4gICAqL1xuICB0YXNrUXVldWU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllczpcbiAgICogLSB3aGV0aGVyIGNhbmNlbGxhdGlvbiByZXF1ZXN0cyBhcmUgc2VudCB0byB0aGUgQ2hpbGRcbiAgICogLSB3aGV0aGVyIGFuZCB3aGVuIGFuIGVycm9yIGlzIHRocm93biBmcm9tIHtAbGluayBleGVjdXRlQ2hpbGR9IG9yXG4gICAqICAge0BsaW5rIENoaWxkV29ya2Zsb3dIYW5kbGUucmVzdWx0fVxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEfVxuICAgKi9cbiAgY2FuY2VsbGF0aW9uVHlwZT86IENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZpZXMgaG93IHRoZSBDaGlsZCByZWFjdHMgdG8gdGhlIFBhcmVudCBXb3JrZmxvdyByZWFjaGluZyBhIENsb3NlZCBzdGF0ZS5cbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIFBhcmVudENsb3NlUG9saWN5LlBBUkVOVF9DTE9TRV9QT0xJQ1lfVEVSTUlOQVRFfVxuICAgKi9cbiAgcGFyZW50Q2xvc2VQb2xpY3k/OiBQYXJlbnRDbG9zZVBvbGljeTtcbn1cblxuZXhwb3J0IHR5cGUgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucyA9IFJlcXVpcmVkPFBpY2s8Q2hpbGRXb3JrZmxvd09wdGlvbnMsICd3b3JrZmxvd0lkJyB8ICdjYW5jZWxsYXRpb25UeXBlJz4+ICYge1xuICBhcmdzOiB1bmtub3duW107XG59O1xuXG5leHBvcnQgdHlwZSBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyA9IENoaWxkV29ya2Zsb3dPcHRpb25zICYgUmVxdWlyZWRDaGlsZFdvcmtmbG93T3B0aW9ucztcblxuZXhwb3J0IGludGVyZmFjZSBTREtJbmZvIHtcbiAgbmFtZTogc3RyaW5nO1xuICB2ZXJzaW9uOiBzdHJpbmc7XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHNsaWNlIG9mIGEgZmlsZSBzdGFydGluZyBhdCBsaW5lT2Zmc2V0XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZVNsaWNlIHtcbiAgLyoqXG4gICAqIHNsaWNlIG9mIGEgZmlsZSB3aXRoIGBcXG5gIChuZXdsaW5lKSBsaW5lIHRlcm1pbmF0b3IuXG4gICAqL1xuICBjb250ZW50OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBPbmx5IHVzZWQgcG9zc2libGUgdG8gdHJpbSB0aGUgZmlsZSB3aXRob3V0IGJyZWFraW5nIHN5bnRheCBoaWdobGlnaHRpbmcuXG4gICAqL1xuICBsaW5lT2Zmc2V0OiBudW1iZXI7XG59XG5cbi8qKlxuICogQSBwb2ludGVyIHRvIGEgbG9jYXRpb24gaW4gYSBmaWxlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRmlsZUxvY2F0aW9uIHtcbiAgLyoqXG4gICAqIFBhdGggdG8gc291cmNlIGZpbGUgKGFic29sdXRlIG9yIHJlbGF0aXZlKS5cbiAgICogV2hlbiB1c2luZyBhIHJlbGF0aXZlIHBhdGgsIG1ha2Ugc3VyZSBhbGwgcGF0aHMgYXJlIHJlbGF0aXZlIHRvIHRoZSBzYW1lIHJvb3QuXG4gICAqL1xuICBmaWxlUGF0aD86IHN0cmluZztcbiAgLyoqXG4gICAqIElmIHBvc3NpYmxlLCBTREsgc2hvdWxkIHNlbmQgdGhpcywgcmVxdWlyZWQgZm9yIGRpc3BsYXlpbmcgdGhlIGNvZGUgbG9jYXRpb24uXG4gICAqL1xuICBsaW5lPzogbnVtYmVyO1xuICAvKipcbiAgICogSWYgcG9zc2libGUsIFNESyBzaG91bGQgc2VuZCB0aGlzLlxuICAgKi9cbiAgY29sdW1uPzogbnVtYmVyO1xuICAvKipcbiAgICogRnVuY3Rpb24gbmFtZSB0aGlzIGxpbmUgYmVsb25ncyB0byAoaWYgYXBwbGljYWJsZSkuXG4gICAqIFVzZWQgZm9yIGZhbGxpbmcgYmFjayB0byBzdGFjayB0cmFjZSB2aWV3LlxuICAgKi9cbiAgZnVuY3Rpb25OYW1lPzogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrVHJhY2Uge1xuICBsb2NhdGlvbnM6IEZpbGVMb2NhdGlvbltdO1xufVxuXG4vKipcbiAqIFVzZWQgYXMgdGhlIHJlc3VsdCBmb3IgdGhlIGVuaGFuY2VkIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRW5oYW5jZWRTdGFja1RyYWNlIHtcbiAgc2RrOiBTREtJbmZvO1xuICAvKipcbiAgICogTWFwcGluZyBvZiBmaWxlIHBhdGggdG8gZmlsZSBjb250ZW50cy5cbiAgICogU0RLIG1heSBjaG9vc2UgdG8gc2VuZCBubywgc29tZSBvciBhbGwgc291cmNlcy5cbiAgICogU291cmNlcyBtaWdodCBiZSB0cmltbWVkLCBhbmQgc29tZSB0aW1lIG9ubHkgdGhlIGZpbGUocykgb2YgdGhlIHRvcCBlbGVtZW50IG9mIHRoZSB0cmFjZSB3aWxsIGJlIHNlbnQuXG4gICAqL1xuICBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBGaWxlU2xpY2VbXT47XG4gIHN0YWNrczogU3RhY2tUcmFjZVtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93Q3JlYXRlT3B0aW9ucyB7XG4gIGluZm86IFdvcmtmbG93SW5mbztcbiAgcmFuZG9tbmVzc1NlZWQ6IG51bWJlcltdO1xuICBub3c6IG51bWJlcjtcbiAgcGF0Y2hlczogc3RyaW5nW107XG4gIHNob3dTdGFja1RyYWNlU291cmNlczogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNXaXRoU291cmNlTWFwIGV4dGVuZHMgV29ya2Zsb3dDcmVhdGVPcHRpb25zIHtcbiAgc291cmNlTWFwOiBSYXdTb3VyY2VNYXA7XG59XG4iLCJpbXBvcnQgdHlwZSB7IFJhd1NvdXJjZU1hcCB9IGZyb20gJ3NvdXJjZS1tYXAnO1xuaW1wb3J0IHtcbiAgZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIsXG4gIEZhaWx1cmVDb252ZXJ0ZXIsXG4gIFBheWxvYWRDb252ZXJ0ZXIsXG4gIGFycmF5RnJvbVBheWxvYWRzLFxuICBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgZW5zdXJlVGVtcG9yYWxGYWlsdXJlLFxuICBJbGxlZ2FsU3RhdGVFcnJvcixcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yLFxuICBXb3JrZmxvd1F1ZXJ5VHlwZSxcbiAgV29ya2Zsb3dTaWduYWxUeXBlLFxuICBQcm90b0ZhaWx1cmUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgYWxlYSwgUk5HIH0gZnJvbSAnLi9hbGVhJztcbmltcG9ydCB7IFJvb3RDYW5jZWxsYXRpb25TY29wZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IsIGlzQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgUXVlcnlJbnB1dCwgU2lnbmFsSW5wdXQsIFdvcmtmbG93RXhlY3V0ZUlucHV0LCBXb3JrZmxvd0ludGVyY2VwdG9ycyB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENvbnRpbnVlQXNOZXcsXG4gIFNES0luZm8sXG4gIEZpbGVTbGljZSxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBGaWxlTG9jYXRpb24sXG4gIFdvcmtmbG93SW5mbyxcbiAgV29ya2Zsb3dDcmVhdGVPcHRpb25zV2l0aFNvdXJjZU1hcCxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IFNpbmtDYWxsIH0gZnJvbSAnLi9zaW5rcyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgcGtnIGZyb20gJy4vcGtnJztcblxuZW51bSBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSB7XG4gIFNUQVJUX0NISUxEX1dPUktGTE9XX0VYRUNVVElPTl9GQUlMRURfQ0FVU0VfVU5TUEVDSUZJRUQgPSAwLFxuICBTVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1dPUktGTE9XX0FMUkVBRFlfRVhJU1RTID0gMSxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UsIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlPigpO1xuY2hlY2tFeHRlbmRzPFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlPigpO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0YWNrIHtcbiAgZm9ybWF0dGVkOiBzdHJpbmc7XG4gIHN0cnVjdHVyZWQ6IEZpbGVMb2NhdGlvbltdO1xufVxuXG4vKipcbiAqIEdsb2JhbCBzdG9yZSB0byB0cmFjayBwcm9taXNlIHN0YWNrcyBmb3Igc3RhY2sgdHJhY2UgcXVlcnlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQcm9taXNlU3RhY2tTdG9yZSB7XG4gIGNoaWxkVG9QYXJlbnQ6IE1hcDxQcm9taXNlPHVua25vd24+LCBTZXQ8UHJvbWlzZTx1bmtub3duPj4+O1xuICBwcm9taXNlVG9TdGFjazogTWFwPFByb21pc2U8dW5rbm93bj4sIFN0YWNrPjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb21wbGV0aW9uIHtcbiAgcmVzb2x2ZSh2YWw6IHVua25vd24pOiB1bmtub3duO1xuICByZWplY3QocmVhc29uOiB1bmtub3duKTogdW5rbm93bjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xuICBmbigpOiBib29sZWFuO1xuICByZXNvbHZlKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogQSBjbGFzcyB0aGF0IGFjdHMgYXMgYSBtYXJrZXIgZm9yIHRoaXMgc3BlY2lhbCByZXN1bHQgdHlwZVxuICovXG5leHBvcnQgY2xhc3MgTG9jYWxBY3Rpdml0eURvQmFja29mZiB7XG4gIHB1YmxpYyByZWFkb25seSBuYW1lID0gJ0xvY2FsQWN0aXZpdHlEb0JhY2tvZmYnO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgYmFja29mZjogY29yZXNkay5hY3Rpdml0eV9yZXN1bHQuSURvQmFja29mZikge31cbn1cblxuZXhwb3J0IHR5cGUgQWN0aXZhdGlvbkhhbmRsZXJGdW5jdGlvbjxLIGV4dGVuZHMga2V5b2YgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2I+ID0gKFxuICBhY3RpdmF0aW9uOiBOb25OdWxsYWJsZTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYltLXT5cbikgPT4gdm9pZDtcblxuLyoqXG4gKiBWZXJpZmllcyBhbGwgYWN0aXZhdGlvbiBqb2IgaGFuZGxpbmcgbWV0aG9kcyBhcmUgaW1wbGVtZW50ZWRcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aXZhdGlvbkhhbmRsZXIgPSB7XG4gIFtQIGluIGtleW9mIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iXTogQWN0aXZhdGlvbkhhbmRsZXJGdW5jdGlvbjxQPjtcbn07XG5cbi8qKlxuICogU0RLIEludGVybmFsIFBhdGNoZXMgYXJlIGNyZWF0ZWQgYnkgdGhlIFNESyB0byBhdm9pZCBicmVha2luZyBoaXN0b3J5IHdoZW4gYmVoYXZpb3VyXG4gKiBvZiBleGlzdGluZyBBUEkgbmVlZCB0byBiZSBtb2RpZmllZC4gVGhpcyBpcyB0aGUgcGF0Y2ggbnVtYmVyIHN1cHBvcnRlZCBieSB0aGUgY3VycmVudFxuICogdmVyc2lvbiBvZiB0aGUgU0RLLlxuICpcbiAqIEhpc3Rvcnk6XG4gKiAxOiBGaXggYGNvbmRpdGlvbiguLi4sIDApYCBpcyBub3QgdGhlIHNhbWUgYXMgYGNvbmRpdGlvbiguLi4sIHVuZGVmaW5lZClgXG4gKi9cbmV4cG9ydCBjb25zdCBMQVRFU1RfSU5URVJOQUxfUEFUQ0hfTlVNQkVSID0gMTtcblxuLyoqXG4gKiBLZWVwcyBhbGwgb2YgdGhlIFdvcmtmbG93IHJ1bnRpbWUgc3RhdGUgbGlrZSBwZW5kaW5nIGNvbXBsZXRpb25zIGZvciBhY3Rpdml0aWVzIGFuZCB0aW1lcnMuXG4gKlxuICogSW1wbGVtZW50cyBoYW5kbGVycyBmb3IgYWxsIHdvcmtmbG93IGFjdGl2YXRpb24gam9icy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2YXRvciBpbXBsZW1lbnRzIEFjdGl2YXRpb25IYW5kbGVyIHtcbiAgLyoqXG4gICAqIE1hcCBvZiB0YXNrIHNlcXVlbmNlIHRvIGEgQ29tcGxldGlvblxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGlvbnMgPSB7XG4gICAgdGltZXI6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGFjdGl2aXR5OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjaGlsZFdvcmtmbG93U3RhcnQ6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNoaWxkV29ya2Zsb3dDb21wbGV0ZTogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgc2lnbmFsV29ya2Zsb3c6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNhbmNlbFdvcmtmbG93OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgfTtcblxuICAvKipcbiAgICogSG9sZHMgYnVmZmVyZWQgc2lnbmFsIGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkXG4gICAqL1xuICByZWFkb25seSBidWZmZXJlZFNpZ25hbHMgPSBuZXcgTWFwPHN0cmluZywgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTaWduYWxXb3JrZmxvd1tdPigpO1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBxdWVyeSBjYWxscyB1bnRpbCBhIGhhbmRsZXIgaXMgcmVnaXN0ZXJlZC5cbiAgICpcbiAgICogKipJTVBPUlRBTlQqKiBxdWVyaWVzIGFyZSBvbmx5IGJ1ZmZlcmVkIHVudGlsIHdvcmtmbG93IGlzIHN0YXJ0ZWQuXG4gICAqIFRoaXMgaXMgcmVxdWlyZWQgYmVjYXVzZSBhc3luYyBpbnRlcmNlcHRvcnMgbWlnaHQgYmxvY2sgd29ya2Zsb3cgZnVuY3Rpb24gaW52b2NhdGlvblxuICAgKiB3aGljaCBkZWxheXMgcXVlcnkgaGFuZGxlciByZWdpc3RyYXRpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgYnVmZmVyZWRRdWVyaWVzID0gQXJyYXk8Y29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklRdWVyeVdvcmtmbG93PigpO1xuXG4gIC8qKlxuICAgKiBNYXBwaW5nIG9mIHNpZ25hbCBuYW1lIHRvIGhhbmRsZXJcbiAgICovXG4gIHJlYWRvbmx5IHNpZ25hbEhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93U2lnbmFsVHlwZT4oKTtcblxuICAvKipcbiAgICogU291cmNlIG1hcCBmaWxlIGZvciBsb29raW5nIHVwIHRoZSBzb3VyY2UgZmlsZXMgaW4gcmVzcG9uc2UgdG8gX19lbmhhbmNlZF9zdGFja190cmFjZVxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNvdXJjZU1hcDogUmF3U291cmNlTWFwO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0byBzZW5kIHRoZSBzb3VyY2VzIGluIGVuaGFuY2VkIHN0YWNrIHRyYWNlIHF1ZXJ5IHJlc3BvbnNlc1xuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNob3dTdGFja1RyYWNlU291cmNlcztcblxuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcHJvbWlzZVN0YWNrU3RvcmU6IFByb21pc2VTdGFja1N0b3JlID0ge1xuICAgIHByb21pc2VUb1N0YWNrOiBuZXcgTWFwKCksXG4gICAgY2hpbGRUb1BhcmVudDogbmV3IE1hcCgpLFxuICB9O1xuXG4gIHB1YmxpYyByZWFkb25seSByb290U2NvcGUgPSBuZXcgUm9vdENhbmNlbGxhdGlvblNjb3BlKCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgcXVlcnkgbmFtZSB0byBoYW5kbGVyXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcXVlcnlIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1F1ZXJ5VHlwZT4oW1xuICAgIFtcbiAgICAgICdfX3N0YWNrX3RyYWNlJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhY2tUcmFjZXMoKVxuICAgICAgICAgIC5tYXAoKHMpID0+IHMuZm9ybWF0dGVkKVxuICAgICAgICAgIC5qb2luKCdcXG5cXG4nKTtcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICAnX19lbmhhbmNlZF9zdGFja190cmFjZScsXG4gICAgICAoKTogRW5oYW5jZWRTdGFja1RyYWNlID0+IHtcbiAgICAgICAgY29uc3QgeyBzb3VyY2VNYXAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHNkazogU0RLSW5mbyA9IHsgbmFtZTogJ3R5cGVzY3JpcHQnLCB2ZXJzaW9uOiBwa2cudmVyc2lvbiB9O1xuICAgICAgICBjb25zdCBzdGFja3MgPSB0aGlzLmdldFN0YWNrVHJhY2VzKCkubWFwKCh7IHN0cnVjdHVyZWQ6IGxvY2F0aW9ucyB9KSA9PiAoeyBsb2NhdGlvbnMgfSkpO1xuICAgICAgICBjb25zdCBzb3VyY2VzOiBSZWNvcmQ8c3RyaW5nLCBGaWxlU2xpY2VbXT4gPSB7fTtcbiAgICAgICAgaWYgKHRoaXMuc2hvd1N0YWNrVHJhY2VTb3VyY2VzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCB7IGxvY2F0aW9ucyB9IG9mIHN0YWNrcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGZpbGVQYXRoIH0gb2YgbG9jYXRpb25zKSB7XG4gICAgICAgICAgICAgIGlmICghZmlsZVBhdGgpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gc291cmNlTWFwPy5zb3VyY2VzQ29udGVudD8uW3NvdXJjZU1hcD8uc291cmNlcy5pbmRleE9mKGZpbGVQYXRoKV07XG4gICAgICAgICAgICAgIGlmICghY29udGVudCkgY29udGludWU7XG4gICAgICAgICAgICAgIHNvdXJjZXNbZmlsZVBhdGhdID0gW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGNvbnRlbnQsXG4gICAgICAgICAgICAgICAgICBsaW5lT2Zmc2V0OiAwLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IHNkaywgc3RhY2tzLCBzb3VyY2VzIH07XG4gICAgICB9LFxuICAgIF0sXG4gIF0pO1xuXG4gIC8qKlxuICAgKiBMb2FkZWQgaW4ge0BsaW5rIGluaXRSdW50aW1lfVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGludGVyY2VwdG9yczogUmVxdWlyZWQ8V29ya2Zsb3dJbnRlcmNlcHRvcnM+ID0geyBpbmJvdW5kOiBbXSwgb3V0Ym91bmQ6IFtdLCBpbnRlcm5hbHM6IFtdIH07XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciB0aGF0IHN0b3JlcyBhbGwgZ2VuZXJhdGVkIGNvbW1hbmRzLCByZXNldCBhZnRlciBlYWNoIGFjdGl2YXRpb25cbiAgICovXG4gIHByb3RlY3RlZCBjb21tYW5kczogY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5JV29ya2Zsb3dDb21tYW5kW10gPSBbXTtcblxuICAvKipcbiAgICogU3RvcmVzIGFsbCB7QGxpbmsgY29uZGl0aW9ufXMgdGhhdCBoYXZlbid0IGJlZW4gdW5ibG9ja2VkIHlldFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGJsb2NrZWRDb25kaXRpb25zID0gbmV3IE1hcDxudW1iZXIsIENvbmRpdGlvbj4oKTtcblxuICAvKipcbiAgICogSXMgdGhpcyBXb3JrZmxvdyBjb21wbGV0ZWQ/XG4gICAqXG4gICAqIEEgV29ya2Zsb3cgd2lsbCBiZSBjb25zaWRlcmVkIGNvbXBsZXRlZCBpZiBpdCBnZW5lcmF0ZXMgYSBjb21tYW5kIHRoYXQgdGhlXG4gICAqIHN5c3RlbSBjb25zaWRlcnMgYXMgYSBmaW5hbCBXb3JrZmxvdyBjb21tYW5kIChlLmcuXG4gICAqIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb24gb3IgZmFpbFdvcmtmbG93RXhlY3V0aW9uKS5cbiAgICovXG4gIHB1YmxpYyBjb21wbGV0ZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogV2FzIHRoaXMgV29ya2Zsb3cgY2FuY2VsbGVkP1xuICAgKi9cbiAgcHJvdGVjdGVkIGNhbmNlbGxlZCA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRyYWNrZWQgdG8gYWxsb3cgYnVmZmVyaW5nIHF1ZXJpZXMgdW50aWwgYSB3b3JrZmxvdyBmdW5jdGlvbiBpcyBjYWxsZWQuXG4gICAqIFRPRE8oYmVyZ3VuZHkpOiBJIGRvbid0IHRoaW5rIHRoaXMgbWFrZXMgc2Vuc2Ugc2luY2UgcXVlcmllcyBydW4gbGFzdCBpbiBhbiBhY3RpdmF0aW9uIGFuZCBtdXN0IGJlIHJlc3BvbmRlZCB0byBpblxuICAgKiB0aGUgc2FtZSBhY3RpdmF0aW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIHdvcmtmbG93RnVuY3Rpb25XYXNDYWxsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIG5leHQgKGluY3JlbWVudGFsKSBzZXF1ZW5jZSB0byBhc3NpZ24gd2hlbiBnZW5lcmF0aW5nIGNvbXBsZXRhYmxlIGNvbW1hbmRzXG4gICAqL1xuICBwdWJsaWMgbmV4dFNlcXMgPSB7XG4gICAgdGltZXI6IDEsXG4gICAgYWN0aXZpdHk6IDEsXG4gICAgY2hpbGRXb3JrZmxvdzogMSxcbiAgICBzaWduYWxXb3JrZmxvdzogMSxcbiAgICBjYW5jZWxXb3JrZmxvdzogMSxcbiAgICBjb25kaXRpb246IDEsXG4gICAgLy8gVXNlZCBpbnRlcm5hbGx5IHRvIGtlZXAgdHJhY2sgb2YgYWN0aXZlIHN0YWNrIHRyYWNlc1xuICAgIHN0YWNrOiAxLFxuICB9O1xuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHNldCBldmVyeSB0aW1lIHRoZSB3b3JrZmxvdyBleGVjdXRlcyBhbiBhY3RpdmF0aW9uXG4gICAqL1xuICBub3c6IG51bWJlcjtcblxuICAvKipcbiAgICogUmVmZXJlbmNlIHRvIHRoZSBjdXJyZW50IFdvcmtmbG93LCBpbml0aWFsaXplZCB3aGVuIGEgV29ya2Zsb3cgaXMgc3RhcnRlZFxuICAgKi9cbiAgcHVibGljIHdvcmtmbG93PzogV29ya2Zsb3c7XG5cbiAgLyoqXG4gICAqIEluZm9ybWF0aW9uIGFib3V0IHRoZSBjdXJyZW50IFdvcmtmbG93XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgaW5mbzogV29ya2Zsb3dJbmZvO1xuXG4gIC8qKlxuICAgKiBBIGRldGVybWluaXN0aWMgUk5HLCB1c2VkIGJ5IHRoZSBpc29sYXRlJ3Mgb3ZlcnJpZGRlbiBNYXRoLnJhbmRvbVxuICAgKi9cbiAgcHVibGljIHJhbmRvbTogUk5HO1xuXG4gIHB1YmxpYyBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyID0gZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXI7XG4gIHB1YmxpYyBmYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gZGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXI7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgd2Uga25vdyB0aGUgc3RhdHVzIG9mIGZvciB0aGlzIHdvcmtmbG93LCBhcyBpbiB7QGxpbmsgcGF0Y2hlZH1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBrbm93blByZXNlbnRQYXRjaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIFBhdGNoZXMgd2Ugc2VudCB0byBjb3JlIHtAbGluayBwYXRjaGVkfVxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IHNlbnRQYXRjaGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgLyoqXG4gICAqIFNESyBJbnRlcm5hbCBQYXRjaGVzIGFyZSBjcmVhdGVkIGJ5IHRoZSBTREsgdG8gYXZvaWQgYnJlYWtpbmcgaGlzdG9yeSB3aGVuIGJlaGF2aW91clxuICAgKiBvZiBleGlzdGluZyBBUEkgbmVlZCB0byBiZSBtb2RpZmllZC5cbiAgICovXG4gIHB1YmxpYyBpbnRlcm5hbFBhdGNoTnVtYmVyID0gMDtcblxuICBzaW5rQ2FsbHMgPSBBcnJheTxTaW5rQ2FsbD4oKTtcblxuICBjb25zdHJ1Y3Rvcih7XG4gICAgaW5mbyxcbiAgICBub3csXG4gICAgc2hvd1N0YWNrVHJhY2VTb3VyY2VzLFxuICAgIHNvdXJjZU1hcCxcbiAgICByYW5kb21uZXNzU2VlZCxcbiAgICBwYXRjaGVzLFxuICB9OiBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNXaXRoU291cmNlTWFwKSB7XG4gICAgdGhpcy5pbmZvID0gaW5mbztcbiAgICB0aGlzLm5vdyA9IG5vdztcbiAgICB0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcyA9IHNob3dTdGFja1RyYWNlU291cmNlcztcbiAgICB0aGlzLnNvdXJjZU1hcCA9IHNvdXJjZU1hcDtcbiAgICB0aGlzLnJhbmRvbSA9IGFsZWEocmFuZG9tbmVzc1NlZWQpO1xuXG4gICAgaWYgKGluZm8udW5zYWZlLmlzUmVwbGF5aW5nKSB7XG4gICAgICBmb3IgKGNvbnN0IHBhdGNoIG9mIHBhdGNoZXMpIHtcbiAgICAgICAgdGhpcy5rbm93blByZXNlbnRQYXRjaGVzLmFkZChwYXRjaCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJvdGVjdGVkIGdldFN0YWNrVHJhY2VzKCk6IFN0YWNrW10ge1xuICAgIGNvbnN0IHsgY2hpbGRUb1BhcmVudCwgcHJvbWlzZVRvU3RhY2sgfSA9IHRoaXMucHJvbWlzZVN0YWNrU3RvcmU7XG4gICAgY29uc3QgaW50ZXJuYWxOb2RlcyA9IFsuLi5jaGlsZFRvUGFyZW50LnZhbHVlcygpXS5yZWR1Y2UoKGFjYywgY3VycikgPT4ge1xuICAgICAgZm9yIChjb25zdCBwIG9mIGN1cnIpIHtcbiAgICAgICAgYWNjLmFkZChwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgbmV3IFNldCgpKTtcbiAgICBjb25zdCBzdGFja3MgPSBuZXcgTWFwPHN0cmluZywgU3RhY2s+KCk7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZFRvUGFyZW50LmtleXMoKSkge1xuICAgICAgaWYgKCFpbnRlcm5hbE5vZGVzLmhhcyhjaGlsZCkpIHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBwcm9taXNlVG9TdGFjay5nZXQoY2hpbGQpO1xuICAgICAgICBpZiAoIXN0YWNrIHx8ICFzdGFjay5mb3JtYXR0ZWQpIGNvbnRpbnVlO1xuICAgICAgICBzdGFja3Muc2V0KHN0YWNrLmZvcm1hdHRlZCwgc3RhY2spO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3QgMTAwJSBzdXJlIHdoZXJlIHRoaXMgY29tZXMgZnJvbSwganVzdCBmaWx0ZXIgaXQgb3V0XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pJyk7XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pXFxuJyk7XG4gICAgcmV0dXJuIFsuLi5zdGFja3NdLm1hcCgoW18sIHN0YWNrXSkgPT4gc3RhY2spO1xuICB9XG5cbiAgZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTogU2lua0NhbGxbXSB7XG4gICAgY29uc3QgeyBzaW5rQ2FsbHMgfSA9IHRoaXM7XG4gICAgdGhpcy5zaW5rQ2FsbHMgPSBbXTtcbiAgICByZXR1cm4gc2lua0NhbGxzO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciBhIFdvcmtmbG93IGNvbW1hbmQgdG8gYmUgY29sbGVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgYWN0aXZhdGlvbi5cbiAgICpcbiAgICogUHJldmVudHMgY29tbWFuZHMgZnJvbSBiZWluZyBhZGRlZCBhZnRlciBXb3JrZmxvdyBjb21wbGV0aW9uLlxuICAgKi9cbiAgcHVzaENvbW1hbmQoY21kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmQsIGNvbXBsZXRlID0gZmFsc2UpOiB2b2lkIHtcbiAgICAvLyBPbmx5IHF1ZXJ5IHJlc3BvbnNlcyBtYXkgYmUgc2VudCBhZnRlciBjb21wbGV0aW9uXG4gICAgaWYgKHRoaXMuY29tcGxldGVkICYmICFjbWQucmVzcG9uZFRvUXVlcnkpIHJldHVybjtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goY21kKTtcbiAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgIHRoaXMuY29tcGxldGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBnZXRBbmRSZXNldENvbW1hbmRzKCk6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdIHtcbiAgICBjb25zdCBjb21tYW5kcyA9IHRoaXMuY29tbWFuZHM7XG4gICAgdGhpcy5jb21tYW5kcyA9IFtdO1xuICAgIHJldHVybiBjb21tYW5kcztcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydFdvcmtmbG93TmV4dEhhbmRsZXIoeyBhcmdzIH06IFdvcmtmbG93RXhlY3V0ZUlucHV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCB7IHdvcmtmbG93IH0gPSB0aGlzO1xuICAgIGlmICh3b3JrZmxvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IHVuaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgbGV0IHByb21pc2U6IFByb21pc2U8YW55PjtcbiAgICB0cnkge1xuICAgICAgcHJvbWlzZSA9IHdvcmtmbG93KC4uLmFyZ3MpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBHdWFyYW50ZWUgdGhpcyBydW5zIGV2ZW4gaWYgdGhlcmUgd2FzIGFuIGV4Y2VwdGlvbiB3aGVuIGludm9raW5nIHRoZSBXb3JrZmxvdyBmdW5jdGlvblxuICAgICAgLy8gT3RoZXJ3aXNlIHRoaXMgV29ya2Zsb3cgd2lsbCBub3cgYmUgcXVlcnlhYmxlLlxuICAgICAgdGhpcy53b3JrZmxvd0Z1bmN0aW9uV2FzQ2FsbGVkID0gdHJ1ZTtcbiAgICAgIC8vIEVtcHR5IHRoZSBidWZmZXJcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMuYnVmZmVyZWRRdWVyaWVzLnNwbGljZSgwKTtcbiAgICAgIGZvciAoY29uc3QgYWN0aXZhdGlvbiBvZiBidWZmZXIpIHtcbiAgICAgICAgdGhpcy5xdWVyeVdvcmtmbG93KGFjdGl2YXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXdhaXQgcHJvbWlzZTtcbiAgfVxuXG4gIHB1YmxpYyBzdGFydFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU3RhcnRXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsICdleGVjdXRlJywgdGhpcy5zdGFydFdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgdW50cmFja1Byb21pc2UoXG4gICAgICBleGVjdXRlKHtcbiAgICAgICAgaGVhZGVyczogYWN0aXZhdGlvbi5oZWFkZXJzID8/IHt9LFxuICAgICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uYXJndW1lbnRzKSxcbiAgICAgIH0pLnRoZW4odGhpcy5jb21wbGV0ZVdvcmtmbG93LmJpbmQodGhpcyksIHRoaXMuaGFuZGxlV29ya2Zsb3dGYWlsdXJlLmJpbmQodGhpcykpXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBjYW5jZWxXb3JrZmxvdyhfYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklDYW5jZWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIHRoaXMuY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICB0aGlzLnJvb3RTY29wZS5jYW5jZWwoKTtcbiAgfVxuXG4gIHB1YmxpYyBmaXJlVGltZXIoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklGaXJlVGltZXIpOiB2b2lkIHtcbiAgICAvLyBUaW1lcnMgYXJlIGEgc3BlY2lhbCBjYXNlIHdoZXJlIHRoZWlyIGNvbXBsZXRpb24gbWlnaHQgbm90IGJlIGluIFdvcmtmbG93IHN0YXRlLFxuICAgIC8vIHRoaXMgaXMgZHVlIHRvIGltbWVkaWF0ZSB0aW1lciBjYW5jZWxsYXRpb24gdGhhdCBkb2Vzbid0IGdvIHdhaXQgZm9yIENvcmUuXG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMubWF5YmVDb25zdW1lQ29tcGxldGlvbigndGltZXInLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGNvbXBsZXRpb24/LnJlc29sdmUodW5kZWZpbmVkKTtcbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQWN0aXZpdHkoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQWN0aXZpdHkpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmVzdWx0KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUFjdGl2aXR5IGFjdGl2YXRpb24gd2l0aCBubyByZXN1bHQnKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2FjdGl2aXR5JywgZ2V0U2VxKGFjdGl2YXRpb24pKTtcbiAgICBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkKSB7XG4gICAgICBjb25zdCBjb21wbGV0ZWQgPSBhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQ7XG4gICAgICBjb25zdCByZXN1bHQgPSBjb21wbGV0ZWQucmVzdWx0ID8gdGhpcy5wYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkKGNvbXBsZXRlZC5yZXN1bHQpIDogdW5kZWZpbmVkO1xuICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZDtcbiAgICAgIGNvbnN0IGVyciA9IGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpIDogdW5kZWZpbmVkO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkO1xuICAgICAgY29uc3QgZXJyID0gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkgOiB1bmRlZmluZWQ7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmJhY2tvZmYpIHtcbiAgICAgIHJlamVjdChuZXcgTG9jYWxBY3Rpdml0eURvQmFja29mZihhY3RpdmF0aW9uLnJlc3VsdC5iYWNrb2ZmKSk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnQoXG4gICAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvblN0YXJ0XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjaGlsZFdvcmtmbG93U3RhcnQnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnN1Y2NlZWRlZCkge1xuICAgICAgcmVzb2x2ZShhY3RpdmF0aW9uLnN1Y2NlZWRlZC5ydW5JZCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLmZhaWxlZCkge1xuICAgICAgaWYgKFxuICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC5jYXVzZSAhPT1cbiAgICAgICAgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UuU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9XT1JLRkxPV19BTFJFQURZX0VYSVNUU1xuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignR290IHVua25vd24gU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2UnKTtcbiAgICAgIH1cbiAgICAgIGlmICghKGFjdGl2YXRpb24uc2VxICYmIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93SWQgJiYgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dUeXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGF0dHJpYnV0ZXMgaW4gYWN0aXZhdGlvbiBqb2InKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdChcbiAgICAgICAgbmV3IFdvcmtmbG93RXhlY3V0aW9uQWxyZWFkeVN0YXJ0ZWRFcnJvcihcbiAgICAgICAgICAnV29ya2Zsb3cgZXhlY3V0aW9uIGFscmVhZHkgc3RhcnRlZCcsXG4gICAgICAgICAgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dJZCxcbiAgICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd1R5cGVcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24uY2FuY2VsbGVkKSB7XG4gICAgICBpZiAoIWFjdGl2YXRpb24uY2FuY2VsbGVkLmZhaWx1cmUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IG5vIGZhaWx1cmUgaW4gY2FuY2VsbGVkIHZhcmlhbnQnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uY2FuY2VsbGVkLmZhaWx1cmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnQgd2l0aCBubyBzdGF0dXMnKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb24oYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbik6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbiBhY3RpdmF0aW9uIHdpdGggbm8gcmVzdWx0Jyk7XG4gICAgfVxuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjaGlsZFdvcmtmbG93Q29tcGxldGUnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRlZC5yZXN1bHQgPyB0aGlzLnBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQoY29tcGxldGVkLnJlc3VsdCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkO1xuICAgICAgaWYgKGZhaWx1cmUgPT09IHVuZGVmaW5lZCB8fCBmYWlsdXJlID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBmYWlsZWQgcmVzdWx0IHdpdGggbm8gZmFpbHVyZSBhdHRyaWJ1dGUnKTtcbiAgICAgIH1cbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUpKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQ7XG4gICAgICBpZiAoZmFpbHVyZSA9PT0gdW5kZWZpbmVkIHx8IGZhaWx1cmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGNhbmNlbGxlZCByZXN1bHQgd2l0aCBubyBmYWlsdXJlIGF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEludGVudGlvbmFsbHkgbm90IG1hZGUgZnVuY3Rpb24gYXN5bmMgc28gdGhpcyBoYW5kbGVyIGRvZXNuJ3Qgc2hvdyB1cCBpbiB0aGUgc3RhY2sgdHJhY2VcbiAgcHJvdGVjdGVkIHF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlcih7IHF1ZXJ5TmFtZSwgYXJncyB9OiBRdWVyeUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnF1ZXJ5SGFuZGxlcnMuZ2V0KHF1ZXJ5TmFtZSk7XG4gICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGtub3duUXVlcnlUeXBlcyA9IFsuLi50aGlzLnF1ZXJ5SGFuZGxlcnMua2V5cygpXS5qb2luKCcgJyk7XG4gICAgICAvLyBGYWlsIHRoZSBxdWVyeVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGRpZCBub3QgcmVnaXN0ZXIgYSBoYW5kbGVyIGZvciAke3F1ZXJ5TmFtZX0uIFJlZ2lzdGVyZWQgcXVlcmllczogWyR7a25vd25RdWVyeVR5cGVzfV1gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXQgPSBmbiguLi5hcmdzKTtcbiAgICAgIGlmIChyZXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignUXVlcnkgaGFuZGxlcnMgc2hvdWxkIG5vdCByZXR1cm4gYSBQcm9taXNlJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklRdWVyeVdvcmtmbG93KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndvcmtmbG93RnVuY3Rpb25XYXNDYWxsZWQpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRRdWVyaWVzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBxdWVyeVR5cGUsIHF1ZXJ5SWQsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCEocXVlcnlUeXBlICYmIHF1ZXJ5SWQpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIHF1ZXJ5IGFjdGl2YXRpb24gYXR0cmlidXRlcycpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVRdWVyeScsXG4gICAgICB0aGlzLnF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIHF1ZXJ5TmFtZTogcXVlcnlUeXBlLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmFyZ3VtZW50cyksXG4gICAgICBxdWVyeUlkLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KS50aGVuKFxuICAgICAgKHJlc3VsdCkgPT4gdGhpcy5jb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQsIHJlc3VsdCksXG4gICAgICAocmVhc29uKSA9PiB0aGlzLmZhaWxRdWVyeShxdWVyeUlkLCByZWFzb24pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyKHsgc2lnbmFsTmFtZSwgYXJncyB9OiBTaWduYWxJbnB1dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZuID0gdGhpcy5zaWduYWxIYW5kbGVycy5nZXQoc2lnbmFsTmFtZSk7XG4gICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gcmVnaXN0ZXJlZCBzaWduYWwgaGFuZGxlciBmb3Igc2lnbmFsICR7c2lnbmFsTmFtZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IGZuKC4uLmFyZ3MpO1xuICB9XG5cbiAgcHVibGljIHNpZ25hbFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU2lnbmFsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHNpZ25hbE5hbWUsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCFzaWduYWxOYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gc2lnbmFsTmFtZScpO1xuICAgIH1cblxuICAgIGNvbnN0IGZuID0gdGhpcy5zaWduYWxIYW5kbGVycy5nZXQoc2lnbmFsTmFtZSk7XG4gICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGxldCBidWZmZXIgPSB0aGlzLmJ1ZmZlcmVkU2lnbmFscy5nZXQoc2lnbmFsTmFtZSk7XG4gICAgICBpZiAoYnVmZmVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYnVmZmVyID0gW107XG4gICAgICAgIHRoaXMuYnVmZmVyZWRTaWduYWxzLnNldChzaWduYWxOYW1lLCBidWZmZXIpO1xuICAgICAgfVxuICAgICAgYnVmZmVyLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgICB0aGlzLmludGVyY2VwdG9ycy5pbmJvdW5kLFxuICAgICAgJ2hhbmRsZVNpZ25hbCcsXG4gICAgICB0aGlzLnNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICk7XG4gICAgZXhlY3V0ZSh7XG4gICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uaW5wdXQpLFxuICAgICAgc2lnbmFsTmFtZSxcbiAgICAgIGhlYWRlcnM6IGhlYWRlcnMgPz8ge30sXG4gICAgfSkuY2F0Y2godGhpcy5oYW5kbGVXb3JrZmxvd0ZhaWx1cmUuYmluZCh0aGlzKSk7XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZVNpZ25hbEV4dGVybmFsV29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklSZXNvbHZlU2lnbmFsRXh0ZXJuYWxXb3JrZmxvdyk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdzaWduYWxXb3JrZmxvdycsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uZmFpbHVyZSkge1xuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZVJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93KFxuICAgIGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZVJlcXVlc3RDYW5jZWxFeHRlcm5hbFdvcmtmbG93XG4gICk6IHZvaWQge1xuICAgIGNvbnN0IHsgcmVzb2x2ZSwgcmVqZWN0IH0gPSB0aGlzLmNvbnN1bWVDb21wbGV0aW9uKCdjYW5jZWxXb3JrZmxvdycsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uZmFpbHVyZSkge1xuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5mYWlsdXJlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlUmFuZG9tU2VlZChhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVVwZGF0ZVJhbmRvbVNlZWQpOiB2b2lkIHtcbiAgICBpZiAoIWFjdGl2YXRpb24ucmFuZG9tbmVzc1NlZWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFjdGl2YXRpb24gd2l0aCByYW5kb21uZXNzU2VlZCBhdHRyaWJ1dGUnKTtcbiAgICB9XG4gICAgdGhpcy5yYW5kb20gPSBhbGVhKGFjdGl2YXRpb24ucmFuZG9tbmVzc1NlZWQudG9CeXRlcygpKTtcbiAgfVxuXG4gIHB1YmxpYyBub3RpZnlIYXNQYXRjaChhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSU5vdGlmeUhhc1BhdGNoKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnBhdGNoSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ05vdGlmeSBoYXMgcGF0Y2ggbWlzc2luZyBwYXRjaCBuYW1lJyk7XG4gICAgfVxuICAgIGlmIChhY3RpdmF0aW9uLnBhdGNoSWQuc3RhcnRzV2l0aCgnX19zZGtfaW50ZXJuYWxfcGF0Y2hfbnVtYmVyOicpKSB7XG4gICAgICBjb25zdCBpbnRlcm5hbFBhdGNoTnVtYmVyID0gcGFyc2VJbnQoYWN0aXZhdGlvbi5wYXRjaElkLnN1YnN0cmluZygnX19zZGtfaW50ZXJuYWxfcGF0Y2hfbnVtYmVyOicubGVuZ3RoKSk7XG4gICAgICBpZiAoaW50ZXJuYWxQYXRjaE51bWJlciA+IExBVEVTVF9JTlRFUk5BTF9QQVRDSF9OVU1CRVIpXG4gICAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihcbiAgICAgICAgICBgVW5zdXBwb3J0ZWQgaW50ZXJuYWwgcGF0Y2ggbnVtYmVyOiAke2ludGVybmFsUGF0Y2hOdW1iZXJ9ID4gJHtMQVRFU1RfSU5URVJOQUxfUEFUQ0hfTlVNQkVSfWBcbiAgICAgICAgKTtcbiAgICAgIGlmICh0aGlzLmludGVybmFsUGF0Y2hOdW1iZXIgPCBpbnRlcm5hbFBhdGNoTnVtYmVyKSB0aGlzLmludGVybmFsUGF0Y2hOdW1iZXIgPSBpbnRlcm5hbFBhdGNoTnVtYmVyO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmtub3duUHJlc2VudFBhdGNoZXMuYWRkKGFjdGl2YXRpb24ucGF0Y2hJZCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGNoZWNrSW50ZXJuYWxQYXRjaEF0TGVhc3QobWluaW11bVBhdGNoTnVtYmVyOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5pbnRlcm5hbFBhdGNoTnVtYmVyID49IG1pbmltdW1QYXRjaE51bWJlcikgcmV0dXJuIHRydWU7XG4gICAgaWYgKCF0aGlzLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nKSB7XG4gICAgICB0aGlzLmludGVybmFsUGF0Y2hOdW1iZXIgPSBtaW5pbXVtUGF0Y2hOdW1iZXI7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgICAgc2V0UGF0Y2hNYXJrZXI6IHsgcGF0Y2hJZDogYF9fc2RrX2ludGVybmFsX3BhdGNoX251bWJlcjoke0xBVEVTVF9JTlRFUk5BTF9QQVRDSF9OVU1CRVJ9YCwgZGVwcmVjYXRlZDogZmFsc2UgfSxcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHB1YmxpYyByZW1vdmVGcm9tQ2FjaGUoKTogdm9pZCB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdyZW1vdmVGcm9tQ2FjaGUgYWN0aXZhdGlvbiBqb2Igc2hvdWxkIG5vdCByZWFjaCB3b3JrZmxvdycpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRyYW5zZm9ybXMgZmFpbHVyZXMgaW50byBhIGNvbW1hbmQgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBVc2VkIHRvIGhhbmRsZSBhbnkgZmFpbHVyZSBlbWl0dGVkIGJ5IHRoZSBXb3JrZmxvdy5cbiAgICovXG4gIGFzeW5jIGhhbmRsZVdvcmtmbG93RmFpbHVyZShlcnJvcjogdW5rbm93bik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLmNhbmNlbGxlZCAmJiBpc0NhbmNlbGxhdGlvbihlcnJvcikpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjYW5jZWxXb3JrZmxvd0V4ZWN1dGlvbjoge30gfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChlcnJvciBpbnN0YW5jZW9mIENvbnRpbnVlQXNOZXcpIHtcbiAgICAgIHRoaXMucHVzaENvbW1hbmQoeyBjb250aW51ZUFzTmV3V29ya2Zsb3dFeGVjdXRpb246IGVycm9yLmNvbW1hbmQgfSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSkge1xuICAgICAgICAvLyBUaGlzIHJlc3VsdHMgaW4gYW4gdW5oYW5kbGVkIHJlamVjdGlvbiB3aGljaCB3aWxsIGZhaWwgdGhlIGFjdGl2YXRpb25cbiAgICAgICAgLy8gcHJldmVudGluZyBpdCBmcm9tIGNvbXBsZXRpbmcuXG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnB1c2hDb21tYW5kKFxuICAgICAgICB7XG4gICAgICAgICAgZmFpbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICBmYWlsdXJlOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVycm9yKSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICB0cnVlXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29tcGxldGVRdWVyeShxdWVyeUlkOiBzdHJpbmcsIHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgcmVzcG9uZFRvUXVlcnk6IHsgcXVlcnlJZCwgc3VjY2VlZGVkOiB7IHJlc3BvbnNlOiB0aGlzLnBheWxvYWRDb252ZXJ0ZXIudG9QYXlsb2FkKHJlc3VsdCkgfSB9LFxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBmYWlsUXVlcnkocXVlcnlJZDogc3RyaW5nLCBlcnJvcjogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoe1xuICAgICAgcmVzcG9uZFRvUXVlcnk6IHtcbiAgICAgICAgcXVlcnlJZCxcbiAgICAgICAgZmFpbGVkOiB0aGlzLmVycm9yVG9GYWlsdXJlKGVuc3VyZVRlbXBvcmFsRmFpbHVyZShlcnJvcikpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUgKi9cbiAgcHJpdmF0ZSBtYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGU6IGtleW9mIEFjdGl2YXRvclsnY29tcGxldGlvbnMnXSwgdGFza1NlcTogbnVtYmVyKTogQ29tcGxldGlvbiB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgY29tcGxldGlvbiA9IHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZ2V0KHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY29tcGxldGlvbnNbdHlwZV0uZGVsZXRlKHRhc2tTZXEpO1xuICAgIH1cbiAgICByZXR1cm4gY29tcGxldGlvbjtcbiAgfVxuXG4gIC8qKiBDb25zdW1lIGEgY29tcGxldGlvbiBpZiBpdCBleGlzdHMgaW4gV29ya2Zsb3cgc3RhdGUsIHRocm93cyBpZiBpdCBkb2Vzbid0ICovXG4gIHByaXZhdGUgY29uc3VtZUNvbXBsZXRpb24odHlwZToga2V5b2YgQWN0aXZhdG9yWydjb21wbGV0aW9ucyddLCB0YXNrU2VxOiBudW1iZXIpOiBDb21wbGV0aW9uIHtcbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5tYXliZUNvbnN1bWVDb21wbGV0aW9uKHR5cGUsIHRhc2tTZXEpO1xuICAgIGlmIChjb21wbGV0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcihgTm8gY29tcGxldGlvbiBmb3IgdGFza1NlcSAke3Rhc2tTZXF9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0aW9uO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVdvcmtmbG93KHJlc3VsdDogdW5rbm93bik6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoXG4gICAgICB7XG4gICAgICAgIGNvbXBsZXRlV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICByZXN1bHQ6IHRoaXMucGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQocmVzdWx0KSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB0cnVlXG4gICAgKTtcbiAgfVxuXG4gIGVycm9yVG9GYWlsdXJlKGVycjogdW5rbm93bik6IFByb3RvRmFpbHVyZSB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5lcnJvclRvRmFpbHVyZShlcnIsIHRoaXMucGF5bG9hZENvbnZlcnRlcik7XG4gIH1cblxuICBmYWlsdXJlVG9FcnJvcihmYWlsdXJlOiBQcm90b0ZhaWx1cmUpOiBFcnJvciB7XG4gICAgcmV0dXJuIHRoaXMuZmFpbHVyZUNvbnZlcnRlci5mYWlsdXJlVG9FcnJvcihmYWlsdXJlLCB0aGlzLnBheWxvYWRDb252ZXJ0ZXIpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmF0b3IoKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX18/LmFjdGl2YXRvcjtcbiAgaWYgKGFjdGl2YXRvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyB1bmluaXRpYWxpemVkJyk7XG4gIH1cbiAgcmV0dXJuIGFjdGl2YXRvcjtcbn1cblxuZnVuY3Rpb24gZ2V0U2VxPFQgZXh0ZW5kcyB7IHNlcT86IG51bWJlciB8IG51bGwgfT4oYWN0aXZhdGlvbjogVCk6IG51bWJlciB7XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRpb24uc2VxO1xuICBpZiAoc2VxID09PSB1bmRlZmluZWQgfHwgc2VxID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgR290IGFjdGl2YXRpb24gd2l0aCBubyBzZXEgYXR0cmlidXRlYCk7XG4gIH1cbiAgcmV0dXJuIHNlcTtcbn1cbiIsIi8vIC4uL3BhY2thZ2UuanNvbiBpcyBvdXRzaWRlIG9mIHRoZSBUUyBwcm9qZWN0IHJvb3REaXIgd2hpY2ggY2F1c2VzIFRTIHRvIGNvbXBsYWluIGFib3V0IHRoaXMgaW1wb3J0LlxuLy8gV2UgZG8gbm90IHdhbnQgdG8gY2hhbmdlIHRoZSByb290RGlyIGJlY2F1c2UgaXQgbWVzc2VzIHVwIHRoZSBvdXRwdXQgc3RydWN0dXJlLlxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuLy8gQHRzLWlnbm9yZVxuaW1wb3J0IHBrZyBmcm9tICcuLi9wYWNrYWdlLmpzb24nO1xuXG5leHBvcnQgZGVmYXVsdCBwa2cgYXMgeyBuYW1lOiBzdHJpbmc7IHZlcnNpb246IHN0cmluZyB9O1xuIiwiaW1wb3J0IHR5cGUgeyBQcm9taXNlU3RhY2tTdG9yZSB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gcmVtb3ZlIGEgcHJvbWlzZSBmcm9tIGJlaW5nIHRyYWNrZWQgZm9yIHN0YWNrIHRyYWNlIHF1ZXJ5IHB1cnBvc2VzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1bnRyYWNrUHJvbWlzZShwcm9taXNlOiBQcm9taXNlPHVua25vd24+KTogdm9pZCB7XG4gIGNvbnN0IHN0b3JlID0gKGdsb2JhbFRoaXMgYXMgYW55KS5fX1RFTVBPUkFMX18/LmFjdGl2YXRvcj8ucHJvbWlzZVN0YWNrU3RvcmUgYXMgUHJvbWlzZVN0YWNrU3RvcmUgfCB1bmRlZmluZWQ7XG4gIGlmICghc3RvcmUpIHJldHVybjtcbiAgc3RvcmUuY2hpbGRUb1BhcmVudC5kZWxldGUocHJvbWlzZSk7XG4gIHN0b3JlLnByb21pc2VUb1N0YWNrLmRlbGV0ZShwcm9taXNlKTtcbn1cbiIsImltcG9ydCB7IENhbmNlbGxhdGlvblNjb3BlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuXG4vKipcbiAqIEEgYFByb21pc2VMaWtlYCBoZWxwZXIgd2hpY2ggZXhwb3NlcyBpdHMgYHJlc29sdmVgIGFuZCBgcmVqZWN0YCBtZXRob2RzLlxuICpcbiAqIFRyaWdnZXIgaXMgQ2FuY2VsbGF0aW9uU2NvcGUtYXdhcmU6IGl0IGlzIGxpbmtlZCB0byB0aGUgY3VycmVudCBzY29wZSBvblxuICogY29uc3RydWN0aW9uIGFuZCB0aHJvd3Mgd2hlbiB0aGF0IHNjb3BlIGlzIGNhbmNlbGxlZC5cbiAqXG4gKiBVc2VmdWwgZm9yIGUuZy4gd2FpdGluZyBmb3IgdW5ibG9ja2luZyBhIFdvcmtmbG93IGZyb20gYSBTaWduYWwuXG4gKlxuICogQGV4YW1wbGVcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC10cmlnZ2VyLXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICovXG5leHBvcnQgY2xhc3MgVHJpZ2dlcjxUPiBpbXBsZW1lbnRzIFByb21pc2VMaWtlPFQ+IHtcbiAgLy8gVHlwZXNjcmlwdCBkb2VzIG5vdCByZWFsaXplIHRoYXQgdGhlIHByb21pc2UgZXhlY3V0b3IgaXMgcnVuIHN5bmNocm9ub3VzbHkgaW4gdGhlIGNvbnN0cnVjdG9yXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwdWJsaWMgcmVhZG9ubHkgcmVzb2x2ZTogKHZhbHVlOiBUIHwgUHJvbWlzZUxpa2U8VD4pID0+IHZvaWQ7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgLy8gQHRzLWlnbm9yZVxuICBwdWJsaWMgcmVhZG9ubHkgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkO1xuICBwcm90ZWN0ZWQgcmVhZG9ubHkgcHJvbWlzZTogUHJvbWlzZTxUPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZTxUPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkIHx8IHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIH1cbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4gICAgICAvLyBAdHMtaWdub3JlXG4gICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgICAvLyBBdm9pZCB1bmhhbmRsZWQgcmVqZWN0aW9uc1xuICAgIHVudHJhY2tQcm9taXNlKHRoaXMucHJvbWlzZS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpKTtcbiAgfVxuXG4gIHRoZW48VFJlc3VsdDEgPSBULCBUUmVzdWx0MiA9IG5ldmVyPihcbiAgICBvbmZ1bGZpbGxlZD86ICgodmFsdWU6IFQpID0+IFRSZXN1bHQxIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDE+KSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgb25yZWplY3RlZD86ICgocmVhc29uOiBhbnkpID0+IFRSZXN1bHQyIHwgUHJvbWlzZUxpa2U8VFJlc3VsdDI+KSB8IHVuZGVmaW5lZCB8IG51bGxcbiAgKTogUHJvbWlzZUxpa2U8VFJlc3VsdDEgfCBUUmVzdWx0Mj4ge1xuICAgIHJldHVybiB0aGlzLnByb21pc2UudGhlbihvbmZ1bGZpbGxlZCwgb25yZWplY3RlZCk7XG4gIH1cbn1cbiIsIi8qKlxuICogRXhwb3J0ZWQgZnVuY3Rpb25zIGZvciB0aGUgV29ya2VyIHRvIGludGVyYWN0IHdpdGggdGhlIFdvcmtmbG93IGlzb2xhdGVcbiAqXG4gKiBAbW9kdWxlXG4gKi9cbmltcG9ydCB7IElsbGVnYWxTdGF0ZUVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IG1zVG9UcywgdHNUb01zIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBzdG9yYWdlIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHsgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IFdvcmtmbG93SW50ZXJjZXB0b3JzRmFjdG9yeSB9IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IFdvcmtmbG93Q3JlYXRlT3B0aW9uc1dpdGhTb3VyY2VNYXAgfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgQWN0aXZhdG9yLCBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5pbXBvcnQgeyBTaW5rQ2FsbCB9IGZyb20gJy4vc2lua3MnO1xuXG4vLyBFeHBvcnQgdGhlIHR5cGUgZm9yIHVzZSBvbiB0aGUgXCJ3b3JrZXJcIiBzaWRlXG5leHBvcnQgeyBQcm9taXNlU3RhY2tTdG9yZSB9IGZyb20gJy4vaW50ZXJuYWxzJztcblxuY29uc3QgZ2xvYmFsID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG5jb25zdCBPcmlnaW5hbERhdGUgPSBnbG9iYWxUaGlzLkRhdGU7XG5cbmV4cG9ydCBmdW5jdGlvbiBvdmVycmlkZUdsb2JhbHMoKTogdm9pZCB7XG4gIC8vIE1vY2sgYW55IHdlYWsgcmVmZXJlbmNlIGJlY2F1c2UgR0MgaXMgbm9uLWRldGVybWluaXN0aWMgYW5kIHRoZSBlZmZlY3QgaXMgb2JzZXJ2YWJsZSBmcm9tIHRoZSBXb3JrZmxvdy5cbiAgLy8gV2Vha1JlZiBpcyBpbXBsZW1lbnRlZCBpbiBWOCA4LjQgd2hpY2ggaXMgZW1iZWRkZWQgaW4gbm9kZSA+PTE0LjYuMC5cbiAgLy8gV29ya2Zsb3cgZGV2ZWxvcGVyIHdpbGwgZ2V0IGEgbWVhbmluZ2Z1bCBleGNlcHRpb24gaWYgdGhleSB0cnkgdG8gdXNlIHRoZXNlLlxuICBnbG9iYWwuV2Vha1JlZiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aHJvdyBuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignV2Vha1JlZiBjYW5ub3QgYmUgdXNlZCBpbiBXb3JrZmxvd3MgYmVjYXVzZSB2OCBHQyBpcyBub24tZGV0ZXJtaW5pc3RpYycpO1xuICB9O1xuICBnbG9iYWwuRmluYWxpemF0aW9uUmVnaXN0cnkgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoXG4gICAgICAnRmluYWxpemF0aW9uUmVnaXN0cnkgY2Fubm90IGJlIHVzZWQgaW4gV29ya2Zsb3dzIGJlY2F1c2UgdjggR0MgaXMgbm9uLWRldGVybWluaXN0aWMnXG4gICAgKTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZSA9IGZ1bmN0aW9uICguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gbmV3IChPcmlnaW5hbERhdGUgYXMgYW55KSguLi5hcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBPcmlnaW5hbERhdGUoZ2V0QWN0aXZhdG9yKCkubm93KTtcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGdldEFjdGl2YXRvcigpLm5vdztcbiAgfTtcblxuICBnbG9iYWwuRGF0ZS5wYXJzZSA9IE9yaWdpbmFsRGF0ZS5wYXJzZS5iaW5kKE9yaWdpbmFsRGF0ZSk7XG4gIGdsb2JhbC5EYXRlLlVUQyA9IE9yaWdpbmFsRGF0ZS5VVEMuYmluZChPcmlnaW5hbERhdGUpO1xuXG4gIGdsb2JhbC5EYXRlLnByb3RvdHlwZSA9IE9yaWdpbmFsRGF0ZS5wcm90b3R5cGU7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtcyBzbGVlcCBkdXJhdGlvbiAtICBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLiBJZiBnaXZlbiBhIG5lZ2F0aXZlIG51bWJlciwgdmFsdWUgd2lsbCBiZSBzZXQgdG8gMS5cbiAgICovXG4gIGdsb2JhbC5zZXRUaW1lb3V0ID0gZnVuY3Rpb24gKGNiOiAoLi4uYXJnczogYW55W10pID0+IGFueSwgbXM6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBudW1iZXIge1xuICAgIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAgIG1zID0gTWF0aC5tYXgoMSwgbXMpO1xuICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrO1xuICAgIC8vIENyZWF0ZSBhIFByb21pc2UgZm9yIEFzeW5jTG9jYWxTdG9yYWdlIHRvIGJlIGFibGUgdG8gdHJhY2sgdGhpcyBjb21wbGV0aW9uIHVzaW5nIHByb21pc2UgaG9va3MuXG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgc3RhcnRUaW1lcjoge1xuICAgICAgICAgIHNlcSxcbiAgICAgICAgICBzdGFydFRvRmlyZVRpbWVvdXQ6IG1zVG9UcyhtcyksXG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9KS50aGVuKFxuICAgICAgKCkgPT4gY2IoLi4uYXJncyksXG4gICAgICAoKSA9PiB1bmRlZmluZWQgLyogaWdub3JlIGNhbmNlbGxhdGlvbiAqL1xuICAgICk7XG4gICAgcmV0dXJuIHNlcTtcbiAgfTtcblxuICBnbG9iYWwuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24gKGhhbmRsZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gICAgYWN0aXZhdG9yLm5leHRTZXFzLnRpbWVyKys7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLmRlbGV0ZShoYW5kbGUpO1xuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBjYW5jZWxUaW1lcjoge1xuICAgICAgICBzZXE6IGhhbmRsZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG5cbiAgLy8gYWN0aXZhdG9yLnJhbmRvbSBpcyBtdXRhYmxlLCBkb24ndCBoYXJkY29kZSBpdHMgcmVmZXJlbmNlXG4gIE1hdGgucmFuZG9tID0gKCkgPT4gZ2V0QWN0aXZhdG9yKCkucmFuZG9tKCk7XG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgaXNvbGF0ZSBydW50aW1lLlxuICpcbiAqIFNldHMgcmVxdWlyZWQgaW50ZXJuYWwgc3RhdGUgYW5kIGluc3RhbnRpYXRlcyB0aGUgd29ya2Zsb3cgYW5kIGludGVyY2VwdG9ycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRSdW50aW1lKG9wdGlvbnM6IFdvcmtmbG93Q3JlYXRlT3B0aW9uc1dpdGhTb3VyY2VNYXApOiB2b2lkIHtcbiAgY29uc3QgeyBpbmZvIH0gPSBvcHRpb25zO1xuICBpbmZvLnVuc2FmZS5ub3cgPSBPcmlnaW5hbERhdGUubm93O1xuICBjb25zdCBhY3RpdmF0b3IgPSBuZXcgQWN0aXZhdG9yKG9wdGlvbnMpO1xuICAvLyBUaGVyZSdzIG9uIGFjdGl2YXRvciBwZXIgd29ya2Zsb3cgaW5zdGFuY2UsIHNldCBpdCBnbG9iYWxseSBvbiB0aGUgY29udGV4dC5cbiAgLy8gV2UgZG8gdGhpcyBiZWZvcmUgaW1wb3J0aW5nIGFueSB1c2VyIGNvZGUgc28gdXNlciBjb2RlIGNhbiBzdGF0aWNhbGx5IHJlZmVyZW5jZSBAdGVtcG9yYWxpby93b3JrZmxvdyBmdW5jdGlvbnNcbiAgLy8gYXMgd2VsbCBhcyBEYXRlIGFuZCBNYXRoLnJhbmRvbS5cbiAgZ2xvYmFsLl9fVEVNUE9SQUxfXy5hY3RpdmF0b3IgPSBhY3RpdmF0b3I7XG5cbiAgLy8gd2VicGFjayBhbGlhcyB0byBwYXlsb2FkQ29udmVydGVyUGF0aFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICBjb25zdCBjdXN0b21QYXlsb2FkQ29udmVydGVyID0gcmVxdWlyZSgnX190ZW1wb3JhbF9jdXN0b21fcGF5bG9hZF9jb252ZXJ0ZXInKS5wYXlsb2FkQ29udmVydGVyO1xuICAvLyBUaGUgYHBheWxvYWRDb252ZXJ0ZXJgIGV4cG9ydCBpcyB2YWxpZGF0ZWQgaW4gdGhlIFdvcmtlclxuICBpZiAoY3VzdG9tUGF5bG9hZENvbnZlcnRlciAhPSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIgPSBjdXN0b21QYXlsb2FkQ29udmVydGVyO1xuICB9XG4gIC8vIHdlYnBhY2sgYWxpYXMgdG8gZmFpbHVyZUNvbnZlcnRlclBhdGhcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgY29uc3QgY3VzdG9tRmFpbHVyZUNvbnZlcnRlciA9IHJlcXVpcmUoJ19fdGVtcG9yYWxfY3VzdG9tX2ZhaWx1cmVfY29udmVydGVyJykuZmFpbHVyZUNvbnZlcnRlcjtcbiAgLy8gVGhlIGBmYWlsdXJlQ29udmVydGVyYCBleHBvcnQgaXMgdmFsaWRhdGVkIGluIHRoZSBXb3JrZXJcbiAgaWYgKGN1c3RvbUZhaWx1cmVDb252ZXJ0ZXIgIT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5mYWlsdXJlQ29udmVydGVyID0gY3VzdG9tRmFpbHVyZUNvbnZlcnRlcjtcbiAgfVxuXG4gIGNvbnN0IHsgaW1wb3J0V29ya2Zsb3dzLCBpbXBvcnRJbnRlcmNlcHRvcnMgfSA9IGdsb2JhbC5fX1RFTVBPUkFMX187XG4gIGlmIChpbXBvcnRXb3JrZmxvd3MgPT09IHVuZGVmaW5lZCB8fCBpbXBvcnRJbnRlcmNlcHRvcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcignV29ya2Zsb3cgYnVuZGxlIGRpZCBub3QgcmVnaXN0ZXIgaW1wb3J0IGhvb2tzJyk7XG4gIH1cblxuICBjb25zdCBpbnRlcmNlcHRvcnMgPSBpbXBvcnRJbnRlcmNlcHRvcnMoKTtcbiAgZm9yIChjb25zdCBtb2Qgb2YgaW50ZXJjZXB0b3JzKSB7XG4gICAgY29uc3QgZmFjdG9yeTogV29ya2Zsb3dJbnRlcmNlcHRvcnNGYWN0b3J5ID0gbW9kLmludGVyY2VwdG9ycztcbiAgICBpZiAoZmFjdG9yeSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIGZhY3RvcnkgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgaW50ZXJjZXB0b3JzIG11c3QgYmUgYSBmdW5jdGlvbiwgZ290OiAke2ZhY3Rvcnl9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBmYWN0b3J5KCk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmluYm91bmQucHVzaCguLi4oaW50ZXJjZXB0b3JzLmluYm91bmQgPz8gW10pKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQucHVzaCguLi4oaW50ZXJjZXB0b3JzLm91dGJvdW5kID8/IFtdKSk7XG4gICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscy5wdXNoKC4uLihpbnRlcmNlcHRvcnMuaW50ZXJuYWxzID8/IFtdKSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbW9kID0gaW1wb3J0V29ya2Zsb3dzKCk7XG4gIGNvbnN0IHdvcmtmbG93ID0gbW9kW2luZm8ud29ya2Zsb3dUeXBlXTtcbiAgaWYgKHR5cGVvZiB3b3JrZmxvdyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYCcke2luZm8ud29ya2Zsb3dUeXBlfScgaXMgbm90IGEgZnVuY3Rpb25gKTtcbiAgfVxuICBhY3RpdmF0b3Iud29ya2Zsb3cgPSB3b3JrZmxvdztcbn1cblxuLyoqXG4gKiBSdW4gYSBjaHVuayBvZiBhY3RpdmF0aW9uIGpvYnNcbiAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgam9iIHdhcyBwcm9jZXNzZWQgb3IgaWdub3JlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLldvcmtmbG93QWN0aXZhdGlvbiwgYmF0Y2hJbmRleDogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBjb25zdCBpbnRlcmNlcHQgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnYWN0aXZhdGUnLCAoeyBhY3RpdmF0aW9uLCBiYXRjaEluZGV4IH0pID0+IHtcbiAgICBpZiAoYmF0Y2hJbmRleCA9PT0gMCkge1xuICAgICAgaWYgKCFhY3RpdmF0aW9uLmpvYnMpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGFjdGl2YXRpb24gd2l0aCBubyBqb2JzJyk7XG4gICAgICB9XG4gICAgICBpZiAoYWN0aXZhdGlvbi50aW1lc3RhbXAgIT0gbnVsbCkge1xuICAgICAgICAvLyB0aW1lc3RhbXAgd2lsbCBub3QgYmUgdXBkYXRlZCBmb3IgYWN0aXZhdGlvbiB0aGF0IGNvbnRhaW4gb25seSBxdWVyaWVzXG4gICAgICAgIGFjdGl2YXRvci5ub3cgPSB0c1RvTXMoYWN0aXZhdGlvbi50aW1lc3RhbXApO1xuICAgICAgfVxuICAgICAgaWYgKGFjdGl2YXRpb24uaGlzdG9yeUxlbmd0aCA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBhY3RpdmF0aW9uIHdpdGggbm8gaGlzdG9yeUxlbmd0aCcpO1xuICAgICAgfVxuICAgICAgYWN0aXZhdG9yLmluZm8udW5zYWZlLmlzUmVwbGF5aW5nID0gYWN0aXZhdGlvbi5pc1JlcGxheWluZyA/PyBmYWxzZTtcbiAgICAgIGFjdGl2YXRvci5pbmZvLmhpc3RvcnlMZW5ndGggPSBhY3RpdmF0aW9uLmhpc3RvcnlMZW5ndGg7XG4gICAgfVxuXG4gICAgLy8gQ2FzdCBmcm9tIHRoZSBpbnRlcmZhY2UgdG8gdGhlIGNsYXNzIHdoaWNoIGhhcyB0aGUgYHZhcmlhbnRgIGF0dHJpYnV0ZS5cbiAgICAvLyBUaGlzIGlzIHNhZmUgYmVjYXVzZSB3ZSBrbm93IHRoYXQgYWN0aXZhdGlvbiBpcyBhIHByb3RvIGNsYXNzLlxuICAgIGNvbnN0IGpvYnMgPSBhY3RpdmF0aW9uLmpvYnMgYXMgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLldvcmtmbG93QWN0aXZhdGlvbkpvYltdO1xuXG4gICAgZm9yIChjb25zdCBqb2Igb2Ygam9icykge1xuICAgICAgaWYgKGpvYi52YXJpYW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgam9iLnZhcmlhbnQgdG8gYmUgZGVmaW5lZCcpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB2YXJpYW50ID0gam9iW2pvYi52YXJpYW50XTtcbiAgICAgIGlmICghdmFyaWFudCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBqb2IuJHtqb2IudmFyaWFudH0gdG8gYmUgc2V0YCk7XG4gICAgICB9XG4gICAgICAvLyBUaGUgb25seSBqb2IgdGhhdCBjYW4gYmUgZXhlY3V0ZWQgb24gYSBjb21wbGV0ZWQgd29ya2Zsb3cgaXMgYSBxdWVyeS5cbiAgICAgIC8vIFdlIG1pZ2h0IGdldCBvdGhlciBqb2JzIGFmdGVyIGNvbXBsZXRpb24gZm9yIGluc3RhbmNlIHdoZW4gYSBzaW5nbGVcbiAgICAgIC8vIGFjdGl2YXRpb24gY29udGFpbnMgbXVsdGlwbGUgam9icyBhbmQgdGhlIGZpcnN0IG9uZSBjb21wbGV0ZXMgdGhlIHdvcmtmbG93LlxuICAgICAgaWYgKGFjdGl2YXRvci5jb21wbGV0ZWQgJiYgam9iLnZhcmlhbnQgIT09ICdxdWVyeVdvcmtmbG93Jykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhY3RpdmF0b3Jbam9iLnZhcmlhbnRdKHZhcmlhbnQgYXMgYW55IC8qIFRTIGNhbid0IGluZmVyIHRoaXMgdHlwZSAqLyk7XG4gICAgICBpZiAoc2hvd1VuYmxvY2tDb25kaXRpb25zKGpvYikpIHtcbiAgICAgICAgdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpbnRlcmNlcHQoe1xuICAgIGFjdGl2YXRpb24sXG4gICAgYmF0Y2hJbmRleCxcbiAgfSk7XG59XG5cbi8qKlxuICogQ29uY2x1ZGUgYSBzaW5nbGUgYWN0aXZhdGlvbi5cbiAqIFNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgcHJvY2Vzc2luZyBhbGwgYWN0aXZhdGlvbiBqb2JzIGFuZCBxdWV1ZWQgbWljcm90YXNrcy5cbiAqXG4gKiBBY3RpdmF0aW9uIGZhaWx1cmVzIGFyZSBoYW5kbGVkIGluIHRoZSBtYWluIE5vZGUuanMgaXNvbGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNsdWRlQWN0aXZhdGlvbigpOiBjb3Jlc2RrLndvcmtmbG93X2NvbXBsZXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2NvbmNsdWRlQWN0aXZhdGlvbicsIChpbnB1dCkgPT4gaW5wdXQpO1xuICBjb25zdCB7IGluZm8gfSA9IGFjdGl2YXRvcjtcbiAgY29uc3QgeyBjb21tYW5kcyB9ID0gaW50ZXJjZXB0KHsgY29tbWFuZHM6IGFjdGl2YXRvci5nZXRBbmRSZXNldENvbW1hbmRzKCkgfSk7XG4gIHJldHVybiB7XG4gICAgcnVuSWQ6IGluZm8ucnVuSWQsXG4gICAgc3VjY2Vzc2Z1bDogeyBjb21tYW5kcyB9LFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTogU2lua0NhbGxbXSB7XG4gIHJldHVybiBnZXRBY3RpdmF0b3IoKS5nZXRBbmRSZXNldFNpbmtDYWxscygpO1xufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCBhbGwgYmxvY2tlZCBjb25kaXRpb25zLCBldmFsdWF0ZSBhbmQgdW5ibG9jayBpZiBwb3NzaWJsZS5cbiAqXG4gKiBAcmV0dXJucyBudW1iZXIgb2YgdW5ibG9ja2VkIGNvbmRpdGlvbnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cnlVbmJsb2NrQ29uZGl0aW9ucygpOiBudW1iZXIge1xuICBsZXQgbnVtVW5ibG9ja2VkID0gMDtcbiAgZm9yICg7Oykge1xuICAgIGNvbnN0IHByZXZVbmJsb2NrZWQgPSBudW1VbmJsb2NrZWQ7XG4gICAgZm9yIChjb25zdCBbc2VxLCBjb25kXSBvZiBnZXRBY3RpdmF0b3IoKS5ibG9ja2VkQ29uZGl0aW9ucy5lbnRyaWVzKCkpIHtcbiAgICAgIGlmIChjb25kLmZuKCkpIHtcbiAgICAgICAgY29uZC5yZXNvbHZlKCk7XG4gICAgICAgIG51bVVuYmxvY2tlZCsrO1xuICAgICAgICAvLyBJdCBpcyBzYWZlIHRvIGRlbGV0ZSBlbGVtZW50cyBkdXJpbmcgbWFwIGl0ZXJhdGlvblxuICAgICAgICBnZXRBY3RpdmF0b3IoKS5ibG9ja2VkQ29uZGl0aW9ucy5kZWxldGUoc2VxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHByZXZVbmJsb2NrZWQgPT09IG51bVVuYmxvY2tlZCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBudW1VbmJsb2NrZWQ7XG59XG5cbi8qKlxuICogUHJlZGljYXRlIHVzZWQgdG8gcHJldmVudCB0cmlnZ2VyaW5nIGNvbmRpdGlvbnMgZm9yIG5vbi1xdWVyeSBhbmQgbm9uLXBhdGNoIGpvYnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93VW5ibG9ja0NvbmRpdGlvbnMoam9iOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYik6IGJvb2xlYW4ge1xuICByZXR1cm4gIWpvYi5xdWVyeVdvcmtmbG93ICYmICFqb2Iubm90aWZ5SGFzUGF0Y2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlKCk6IHZvaWQge1xuICBjb25zdCBkaXNwb3NlID0gY29tcG9zZUludGVyY2VwdG9ycyhnZXRBY3RpdmF0b3IoKS5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnZGlzcG9zZScsIGFzeW5jICgpID0+IHtcbiAgICBzdG9yYWdlLmRpc2FibGUoKTtcbiAgfSk7XG4gIGRpc3Bvc2Uoe30pO1xufVxuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGdW5jdGlvbixcbiAgQWN0aXZpdHlPcHRpb25zLFxuICBjb21waWxlUmV0cnlQb2xpY3ksXG4gIElsbGVnYWxTdGF0ZUVycm9yLFxuICBMb2NhbEFjdGl2aXR5T3B0aW9ucyxcbiAgbWFwVG9QYXlsb2FkcyxcbiAgUXVlcnlEZWZpbml0aW9uLFxuICBzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLFxuICBTZWFyY2hBdHRyaWJ1dGVzLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICB0b1BheWxvYWRzLFxuICBVbnR5cGVkQWN0aXZpdGllcyxcbiAgV2l0aFdvcmtmbG93QXJncyxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93UmVzdWx0VHlwZSxcbiAgV29ya2Zsb3dSZXR1cm5UeXBlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgbXNPcHRpb25hbFRvVHMsIG1zVG9OdW1iZXIsIG1zVG9UcywgdHNUb01zIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90aW1lJztcbmltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBDYW5jZWxsYXRpb25TY29wZSwgcmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuaW1wb3J0IHtcbiAgQWN0aXZpdHlJbnB1dCxcbiAgTG9jYWxBY3Rpdml0eUlucHV0LFxuICBTaWduYWxXb3JrZmxvd0lucHV0LFxuICBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCxcbiAgVGltZXJJbnB1dCxcbn0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHtcbiAgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zLFxuICBDaGlsZFdvcmtmbG93T3B0aW9uc1dpdGhEZWZhdWx0cyxcbiAgQ29udGludWVBc05ldyxcbiAgQ29udGludWVBc05ld09wdGlvbnMsXG4gIEVuaGFuY2VkU3RhY2tUcmFjZSxcbiAgV29ya2Zsb3dJbmZvLFxufSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHsgTG9jYWxBY3Rpdml0eURvQmFja29mZiwgZ2V0QWN0aXZhdG9yIH0gZnJvbSAnLi9pbnRlcm5hbHMnO1xuaW1wb3J0IHsgU2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmltcG9ydCB7IHVudHJhY2tQcm9taXNlIH0gZnJvbSAnLi9zdGFjay1oZWxwZXJzJztcbmltcG9ydCB7IENoaWxkV29ya2Zsb3dIYW5kbGUsIEV4dGVybmFsV29ya2Zsb3dIYW5kbGUgfSBmcm9tICcuL3dvcmtmbG93LWhhbmRsZSc7XG5cbi8vIEF2b2lkIGEgY2lyY3VsYXIgZGVwZW5kZW5jeVxucmVnaXN0ZXJTbGVlcEltcGxlbWVudGF0aW9uKHNsZWVwKTtcblxuLyoqXG4gKiBBZGRzIGRlZmF1bHQgdmFsdWVzIHRvIGB3b3JrZmxvd0lkYCBhbmQgYHdvcmtmbG93SWRSZXVzZVBvbGljeWAgdG8gZ2l2ZW4gd29ya2Zsb3cgb3B0aW9ucy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnM8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgb3B0czogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzIHtcbiAgY29uc3QgeyBhcmdzLCB3b3JrZmxvd0lkLCAuLi5yZXN0IH0gPSBvcHRzO1xuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQ6IHdvcmtmbG93SWQgPz8gdXVpZDQoKSxcbiAgICBhcmdzOiBhcmdzID8/IFtdLFxuICAgIGNhbmNlbGxhdGlvblR5cGU6IENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCxcbiAgICAuLi5yZXN0LFxuICB9O1xufVxuXG4vKipcbiAqIFB1c2ggYSBzdGFydFRpbWVyIGNvbW1hbmQgaW50byBzdGF0ZSBhY2N1bXVsYXRvciBhbmQgcmVnaXN0ZXIgY29tcGxldGlvblxuICovXG5mdW5jdGlvbiB0aW1lck5leHRIYW5kbGVyKGlucHV0OiBUaW1lcklucHV0KSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuZGVsZXRlKGlucHV0LnNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIGNhbmNlbFRpbWVyOiB7XG4gICAgICAgICAgICAgIHNlcTogaW5wdXQuc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzdGFydFRpbWVyOiB7XG4gICAgICAgIHNlcTogaW5wdXQuc2VxLFxuICAgICAgICBzdGFydFRvRmlyZVRpbWVvdXQ6IG1zVG9UcyhpbnB1dC5kdXJhdGlvbk1zKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnRpbWVyLnNldChpbnB1dC5zZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIEFzeW5jaHJvbm91cyBzbGVlcC5cbiAqXG4gKiBTY2hlZHVsZXMgYSB0aW1lciBvbiB0aGUgVGVtcG9yYWwgc2VydmljZS5cbiAqXG4gKiBAcGFyYW0gbXMgc2xlZXAgZHVyYXRpb24gLSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9LlxuICogSWYgZ2l2ZW4gYSBuZWdhdGl2ZSBudW1iZXIgb3IgMCwgdmFsdWUgd2lsbCBiZSBzZXQgdG8gMS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNsZWVwKG1zOiBudW1iZXIgfCBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrO1xuXG4gIGNvbnN0IGR1cmF0aW9uTXMgPSBNYXRoLm1heCgxLCBtc1RvTnVtYmVyKG1zKSk7XG5cbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ3N0YXJ0VGltZXInLCB0aW1lck5leHRIYW5kbGVyKTtcblxuICByZXR1cm4gZXhlY3V0ZSh7XG4gICAgZHVyYXRpb25NcyxcbiAgICBzZXEsXG4gIH0pO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucyhvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiB2b2lkIHtcbiAgaWYgKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCA9PT0gdW5kZWZpbmVkICYmIG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVxdWlyZWQgZWl0aGVyIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQgb3Igc3RhcnRUb0Nsb3NlVGltZW91dCcpO1xuICB9XG59XG5cbi8vIFVzZSBzYW1lIHZhbGlkYXRpb24gd2UgdXNlIGZvciBub3JtYWwgYWN0aXZpdGllc1xuY29uc3QgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyA9IHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zO1xuXG4vKipcbiAqIEhvb2tzIHVwIGFjdGl2aXR5IHByb21pc2UgdG8gY3VycmVudCBjYW5jZWxsYXRpb24gc2NvcGUgYW5kIGNvbXBsZXRpb24gY2FsbGJhY2tzLlxuICpcbiAqIFJldHVybnMgYGZhbHNlYCBpZiB0aGUgY3VycmVudCBzY29wZSBpcyBhbHJlYWR5IGNhbmNlbGxlZC5cbiAqL1xuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gYWN0aXZhdG9yIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcih7IG9wdGlvbnMsIGFyZ3MsIGhlYWRlcnMsIHNlcSwgYWN0aXZpdHlUeXBlIH06IEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhY3Rpdml0eUlkOiBvcHRpb25zLmFjdGl2aXR5SWQgPz8gYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8/LnRhc2tRdWV1ZSxcbiAgICAgICAgaGVhcnRiZWF0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5oZWFydGJlYXRUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvU3RhcnRUaW1lb3V0KSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgICBkb05vdEVhZ2VybHlFeGVjdXRlOiAhKG9wdGlvbnMuYWxsb3dFYWdlckRpc3BhdGNoID8/IHRydWUpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogUHVzaCBhIHNjaGVkdWxlQWN0aXZpdHkgY29tbWFuZCBpbnRvIHN0YXRlIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNjaGVkdWxlTG9jYWxBY3Rpdml0eU5leHRIYW5kbGVyKHtcbiAgb3B0aW9ucyxcbiAgYXJncyxcbiAgaGVhZGVycyxcbiAgc2VxLFxuICBhY3Rpdml0eVR5cGUsXG4gIGF0dGVtcHQsXG4gIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxufTogTG9jYWxBY3Rpdml0eUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgcmVxdWVzdENhbmNlbExvY2FsQWN0aXZpdHk6IHtcbiAgICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzY2hlZHVsZUxvY2FsQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhdHRlbXB0LFxuICAgICAgICBvcmlnaW5hbFNjaGVkdWxlVGltZSxcbiAgICAgICAgLy8gSW50ZW50aW9uYWxseSBub3QgZXhwb3NpbmcgYWN0aXZpdHlJZCBhcyBhbiBvcHRpb25cbiAgICAgICAgYWN0aXZpdHlJZDogYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc3RhcnRUb0Nsb3NlVGltZW91dCksXG4gICAgICAgIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMuc2NoZWR1bGVUb1N0YXJ0VGltZW91dCksXG4gICAgICAgIGxvY2FsUmV0cnlUaHJlc2hvbGQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMubG9jYWxSZXRyeVRocmVzaG9sZCksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgIH0sXG4gICAgfSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIGFuIGFjdGl2aXR5IGFuZCBydW4gb3V0Ym91bmQgaW50ZXJjZXB0b3JzXG4gKiBAaGlkZGVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2hlZHVsZUFjdGl2aXR5PFI+KGFjdGl2aXR5VHlwZTogc3RyaW5nLCBhcmdzOiBhbnlbXSwgb3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogUHJvbWlzZTxSPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGVtcHR5IGFjdGl2aXR5IG9wdGlvbnMnKTtcbiAgfVxuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuYWN0aXZpdHkrKztcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ3NjaGVkdWxlQWN0aXZpdHknLCBzY2hlZHVsZUFjdGl2aXR5TmV4dEhhbmRsZXIpO1xuXG4gIHJldHVybiBleGVjdXRlKHtcbiAgICBhY3Rpdml0eVR5cGUsXG4gICAgaGVhZGVyczoge30sXG4gICAgb3B0aW9ucyxcbiAgICBhcmdzLFxuICAgIHNlcSxcbiAgfSkgYXMgUHJvbWlzZTxSPjtcbn1cblxuLyoqXG4gKiBTY2hlZHVsZSBhbiBhY3Rpdml0eSBhbmQgcnVuIG91dGJvdW5kIGludGVyY2VwdG9yc1xuICogQGhpZGRlblxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2NoZWR1bGVMb2NhbEFjdGl2aXR5PFI+KFxuICBhY3Rpdml0eVR5cGU6IHN0cmluZyxcbiAgYXJnczogYW55W10sXG4gIG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zXG4pOiBQcm9taXNlPFI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZW1wdHkgYWN0aXZpdHkgb3B0aW9ucycpO1xuICB9XG5cbiAgbGV0IGF0dGVtcHQgPSAxO1xuICBsZXQgb3JpZ2luYWxTY2hlZHVsZVRpbWUgPSB1bmRlZmluZWQ7XG5cbiAgZm9yICg7Oykge1xuICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5hY3Rpdml0eSsrO1xuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICdzY2hlZHVsZUxvY2FsQWN0aXZpdHknLFxuICAgICAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5TmV4dEhhbmRsZXJcbiAgICApO1xuXG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoYXdhaXQgZXhlY3V0ZSh7XG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICAgIG9wdGlvbnMsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHNlcSxcbiAgICAgICAgYXR0ZW1wdCxcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG4gICAgICB9KSkgYXMgUHJvbWlzZTxSPjtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmKSB7XG4gICAgICAgIGF3YWl0IHNsZWVwKHRzVG9NcyhlcnIuYmFja29mZi5iYWNrb2ZmRHVyYXRpb24pKTtcbiAgICAgICAgaWYgKHR5cGVvZiBlcnIuYmFja29mZi5hdHRlbXB0ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgYmFja29mZiBhdHRlbXB0IHR5cGUnKTtcbiAgICAgICAgfVxuICAgICAgICBhdHRlbXB0ID0gZXJyLmJhY2tvZmYuYXR0ZW1wdDtcbiAgICAgICAgb3JpZ2luYWxTY2hlZHVsZVRpbWUgPSBlcnIuYmFja29mZi5vcmlnaW5hbFNjaGVkdWxlVGltZSA/PyB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyKHtcbiAgb3B0aW9ucyxcbiAgaGVhZGVycyxcbiAgd29ya2Zsb3dUeXBlLFxuICBzZXEsXG59OiBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCk6IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IHdvcmtmbG93SWQgPSBvcHRpb25zLndvcmtmbG93SWQgPz8gdXVpZDQoKTtcbiAgY29uc3Qgc3RhcnRQcm9taXNlID0gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICFhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd0NvbXBsZXRlLmhhcyhzZXEpO1xuXG4gICAgICAgICAgaWYgKCFjb21wbGV0ZSkge1xuICAgICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgICAgY2FuY2VsQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbjogeyBjaGlsZFdvcmtmbG93U2VxOiBzZXEgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBOb3RoaW5nIHRvIGNhbmNlbCBvdGhlcndpc2VcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgc2VxLFxuICAgICAgICB3b3JrZmxvd0lkLFxuICAgICAgICB3b3JrZmxvd1R5cGUsXG4gICAgICAgIGlucHV0OiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5vcHRpb25zLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgdGFza1F1ZXVlOiBvcHRpb25zLnRhc2tRdWV1ZSB8fCBhY3RpdmF0b3IuaW5mbz8udGFza1F1ZXVlLFxuICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93UnVuVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dCksXG4gICAgICAgIG5hbWVzcGFjZTogd29ya2Zsb3dJbmZvKCkubmFtZXNwYWNlLCAvLyBOb3QgY29uZmlndXJhYmxlXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgICAgd29ya2Zsb3dJZFJldXNlUG9saWN5OiBvcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeSxcbiAgICAgICAgcGFyZW50Q2xvc2VQb2xpY3k6IG9wdGlvbnMucGFyZW50Q2xvc2VQb2xpY3ksXG4gICAgICAgIGNyb25TY2hlZHVsZTogb3B0aW9ucy5jcm9uU2NoZWR1bGUsXG4gICAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlc1xuICAgICAgICAgID8gbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXMpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd1N0YXJ0LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFdlIGNvbnN0cnVjdCBhIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHRoZSBjaGlsZCBXb3JrZmxvdyBiZWZvcmUgd2Uga25vd1xuICAvLyBpZiB0aGUgV29ya2Zsb3cgY29kZSB3aWxsIGF3YWl0IGl0IHRvIGNhcHR1cmUgdGhlIHJlc3VsdCBpbiBjYXNlIGl0IGRvZXMuXG4gIGNvbnN0IGNvbXBsZXRlUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBDaGFpbiBzdGFydCBQcm9taXNlIHJlamVjdGlvbiB0byB0aGUgY29tcGxldGUgUHJvbWlzZS5cbiAgICB1bnRyYWNrUHJvbWlzZShzdGFydFByb21pc2UuY2F0Y2gocmVqZWN0KSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dDb21wbGV0ZS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbiAgdW50cmFja1Byb21pc2Uoc3RhcnRQcm9taXNlKTtcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlKTtcbiAgLy8gUHJldmVudCB1bmhhbmRsZWQgcmVqZWN0aW9uIGJlY2F1c2UgdGhlIGNvbXBsZXRpb24gbWlnaHQgbm90IGJlIGF3YWl0ZWRcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICBjb25zdCByZXQgPSBuZXcgUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT4oKHJlc29sdmUpID0+IHJlc29sdmUoW3N0YXJ0UHJvbWlzZSwgY29tcGxldGVQcm9taXNlXSkpO1xuICB1bnRyYWNrUHJvbWlzZShyZXQpO1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyKHsgc2VxLCBzaWduYWxOYW1lLCBhcmdzLCB0YXJnZXQsIGhlYWRlcnMgfTogU2lnbmFsV29ya2Zsb3dJbnB1dCkge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5zaWduYWxXb3JrZmxvdy5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoeyBjYW5jZWxTaWduYWxXb3JrZmxvdzogeyBzZXEgfSB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzaWduYWxFeHRlcm5hbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYXJnczogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHNpZ25hbE5hbWUsXG4gICAgICAgIC4uLih0YXJnZXQudHlwZSA9PT0gJ2V4dGVybmFsJ1xuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgIC4uLnRhcmdldC53b3JrZmxvd0V4ZWN1dGlvbixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgY2hpbGRXb3JrZmxvd0lkOiB0YXJnZXQuY2hpbGRXb3JrZmxvd0lkLFxuICAgICAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnNpZ25hbFdvcmtmbG93LnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTeW1ib2wgdXNlZCBpbiB0aGUgcmV0dXJuIHR5cGUgb2YgcHJveHkgbWV0aG9kcyB0byBtYXJrIHRoYXQgYW4gYXR0cmlidXRlIG9uIHRoZSBzb3VyY2UgdHlwZSBpcyBub3QgYSBtZXRob2QuXG4gKlxuICogQHNlZSB7QGxpbmsgQWN0aXZpdHlJbnRlcmZhY2VGb3J9XG4gKiBAc2VlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9XG4gKiBAc2VlIHtAbGluayBwcm94eUxvY2FsQWN0aXZpdGllc31cbiAqL1xuZXhwb3J0IGNvbnN0IE5vdEFuQWN0aXZpdHlNZXRob2QgPSBTeW1ib2wuZm9yKCdfX1RFTVBPUkFMX05PVF9BTl9BQ1RJVklUWV9NRVRIT0QnKTtcblxuLyoqXG4gKiBUeXBlIGhlbHBlciB0aGF0IHRha2VzIGEgdHlwZSBgVGAgYW5kIHRyYW5zZm9ybXMgYXR0cmlidXRlcyB0aGF0IGFyZSBub3Qge0BsaW5rIEFjdGl2aXR5RnVuY3Rpb259IHRvXG4gKiB7QGxpbmsgTm90QW5BY3Rpdml0eU1ldGhvZH0uXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBVc2VkIGJ5IHtAbGluayBwcm94eUFjdGl2aXRpZXN9IHRvIGdldCB0aGlzIGNvbXBpbGUtdGltZSBlcnJvcjpcbiAqXG4gKiBgYGB0c1xuICogaW50ZXJmYWNlIE15QWN0aXZpdGllcyB7XG4gKiAgIHZhbGlkKGlucHV0OiBudW1iZXIpOiBQcm9taXNlPG51bWJlcj47XG4gKiAgIGludmFsaWQoaW5wdXQ6IG51bWJlcik6IG51bWJlcjtcbiAqIH1cbiAqXG4gKiBjb25zdCBhY3QgPSBwcm94eUFjdGl2aXRpZXM8TXlBY3Rpdml0aWVzPih7IHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScgfSk7XG4gKlxuICogYXdhaXQgYWN0LnZhbGlkKHRydWUpO1xuICogYXdhaXQgYWN0LmludmFsaWQoKTtcbiAqIC8vIF4gVFMgY29tcGxhaW5zIHdpdGg6XG4gKiAvLyAocHJvcGVydHkpIGludmFsaWREZWZpbml0aW9uOiB0eXBlb2YgTm90QW5BY3Rpdml0eU1ldGhvZFxuICogLy8gVGhpcyBleHByZXNzaW9uIGlzIG5vdCBjYWxsYWJsZS5cbiAqIC8vIFR5cGUgJ1N5bWJvbCcgaGFzIG5vIGNhbGwgc2lnbmF0dXJlcy4oMjM0OSlcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBBY3Rpdml0eUludGVyZmFjZUZvcjxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBBY3Rpdml0eUZ1bmN0aW9uID8gVFtLXSA6IHR5cGVvZiBOb3RBbkFjdGl2aXR5TWV0aG9kO1xufTtcblxuLyoqXG4gKiBDb25maWd1cmUgQWN0aXZpdHkgZnVuY3Rpb25zIHdpdGggZ2l2ZW4ge0BsaW5rIEFjdGl2aXR5T3B0aW9uc30uXG4gKlxuICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBzZXR1cCBBY3Rpdml0aWVzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gKlxuICogQHJldHVybiBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSB8IFByb3h5fSBmb3JcbiAqICAgICAgICAgd2hpY2ggZWFjaCBhdHRyaWJ1dGUgaXMgYSBjYWxsYWJsZSBBY3Rpdml0eSBmdW5jdGlvblxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlBY3Rpdml0aWVzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICogaW1wb3J0ICogYXMgYWN0aXZpdGllcyBmcm9tICcuLi9hY3Rpdml0aWVzJztcbiAqXG4gKiAvLyBTZXR1cCBBY3Rpdml0aWVzIGZyb20gbW9kdWxlIGV4cG9ydHNcbiAqIGNvbnN0IHsgaHR0cEdldCwgb3RoZXJBY3Rpdml0eSB9ID0gcHJveHlBY3Rpdml0aWVzPHR5cGVvZiBhY3Rpdml0aWVzPih7XG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICczMCBtaW51dGVzJyxcbiAqIH0pO1xuICpcbiAqIC8vIFNldHVwIEFjdGl2aXRpZXMgZnJvbSBhbiBleHBsaWNpdCBpbnRlcmZhY2UgKGUuZy4gd2hlbiBkZWZpbmVkIGJ5IGFub3RoZXIgU0RLKVxuICogaW50ZXJmYWNlIEphdmFBY3Rpdml0aWVzIHtcbiAqICAgaHR0cEdldEZyb21KYXZhKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+XG4gKiAgIHNvbWVPdGhlckphdmFBY3Rpdml0eShhcmcxOiBudW1iZXIsIGFyZzI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAqIH1cbiAqXG4gKiBjb25zdCB7XG4gKiAgIGh0dHBHZXRGcm9tSmF2YSxcbiAqICAgc29tZU90aGVySmF2YUFjdGl2aXR5XG4gKiB9ID0gcHJveHlBY3Rpdml0aWVzPEphdmFBY3Rpdml0aWVzPih7XG4gKiAgIHRhc2tRdWV1ZTogJ2phdmEtd29ya2VyLXRhc2tRdWV1ZScsXG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScsXG4gKiB9KTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gZXhlY3V0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBodHRwR2V0KCdodHRwOi8vZXhhbXBsZS5jb20nKTtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5QWN0aXZpdGllczxBID0gVW50eXBlZEFjdGl2aXRpZXM+KG9wdGlvbnM6IEFjdGl2aXR5T3B0aW9ucyk6IEFjdGl2aXR5SW50ZXJmYWNlRm9yPEE+IHtcbiAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ29wdGlvbnMgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgLy8gVmFsaWRhdGUgYXMgZWFybHkgYXMgcG9zc2libGUgZm9yIGltbWVkaWF0ZSB1c2VyIGZlZWRiYWNrXG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpdml0eVR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgT25seSBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIEFjdGl2aXR5IHR5cGVzLCBnb3Q6ICR7U3RyaW5nKGFjdGl2aXR5VHlwZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFjdGl2aXR5UHJveHlGdW5jdGlvbiguLi5hcmdzOiB1bmtub3duW10pOiBQcm9taXNlPHVua25vd24+IHtcbiAgICAgICAgICByZXR1cm4gc2NoZWR1bGVBY3Rpdml0eShhY3Rpdml0eVR5cGUsIGFyZ3MsIG9wdGlvbnMpO1xuICAgICAgICB9O1xuICAgICAgfSxcbiAgICB9XG4gICkgYXMgYW55O1xufVxuXG4vKipcbiAqIENvbmZpZ3VyZSBMb2NhbCBBY3Rpdml0eSBmdW5jdGlvbnMgd2l0aCBnaXZlbiB7QGxpbmsgTG9jYWxBY3Rpdml0eU9wdGlvbnN9LlxuICpcbiAqIFRoaXMgbWV0aG9kIG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgdG8gc2V0dXAgQWN0aXZpdGllcyB3aXRoIGRpZmZlcmVudCBvcHRpb25zLlxuICpcbiAqIEByZXR1cm4gYSB7QGxpbmsgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvUHJveHkgfCBQcm94eX1cbiAqICAgICAgICAgZm9yIHdoaWNoIGVhY2ggYXR0cmlidXRlIGlzIGEgY2FsbGFibGUgQWN0aXZpdHkgZnVuY3Rpb25cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKlxuICogQHNlZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSBmb3IgZXhhbXBsZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb3h5TG9jYWxBY3Rpdml0aWVzPEEgPSBVbnR5cGVkQWN0aXZpdGllcz4ob3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnMpOiBBY3Rpdml0eUludGVyZmFjZUZvcjxBPiB7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdvcHRpb25zIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIC8vIFZhbGlkYXRlIGFzIGVhcmx5IGFzIHBvc3NpYmxlIGZvciBpbW1lZGlhdGUgdXNlciBmZWVkYmFja1xuICB2YWxpZGF0ZUxvY2FsQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBhY3Rpdml0eVR5cGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpdml0eVR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgT25seSBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIEFjdGl2aXR5IHR5cGVzLCBnb3Q6ICR7U3RyaW5nKGFjdGl2aXR5VHlwZSl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIGxvY2FsQWN0aXZpdHlQcm94eUZ1bmN0aW9uKC4uLmFyZ3M6IHVua25vd25bXSkge1xuICAgICAgICAgIHJldHVybiBzY2hlZHVsZUxvY2FsQWN0aXZpdHkoYWN0aXZpdHlUeXBlLCBhcmdzLCBvcHRpb25zKTtcbiAgICAgICAgfTtcbiAgICAgIH0sXG4gICAgfVxuICApIGFzIGFueTtcbn1cblxuLy8gVE9ETzogZGVwcmVjYXRlIHRoaXMgcGF0Y2ggYWZ0ZXIgXCJlbm91Z2hcIiB0aW1lIGhhcyBwYXNzZWRcbmNvbnN0IEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCA9ICdfX3RlbXBvcmFsX2ludGVybmFsX2Nvbm5lY3RfZXh0ZXJuYWxfaGFuZGxlX2NhbmNlbF90b19zY29wZSc7XG5cbi8qKlxuICogUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGNhbiBiZSB1c2VkIHRvIHNpZ25hbCBhbmQgY2FuY2VsIGFuIGV4aXN0aW5nIFdvcmtmbG93IGV4ZWN1dGlvbi5cbiAqIEl0IHRha2VzIGEgV29ya2Zsb3cgSUQgYW5kIG9wdGlvbmFsIHJ1biBJRC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEV4dGVybmFsV29ya2Zsb3dIYW5kbGUod29ya2Zsb3dJZDogc3RyaW5nLCBydW5JZD86IHN0cmluZyk6IEV4dGVybmFsV29ya2Zsb3dIYW5kbGUge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkLFxuICAgIHJ1bklkLFxuICAgIGNhbmNlbCgpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIC8vIENvbm5lY3QgdGhpcyBjYW5jZWwgb3BlcmF0aW9uIHRvIHRoZSBjdXJyZW50IGNhbmNlbGxhdGlvbiBzY29wZS5cbiAgICAgICAgLy8gVGhpcyBpcyBiZWhhdmlvciB3YXMgaW50cm9kdWNlZCBhZnRlciB2MC4yMi4wIGFuZCBpcyBpbmNvbXBhdGlibGVcbiAgICAgICAgLy8gd2l0aCBoaXN0b3JpZXMgZ2VuZXJhdGVkIHdpdGggcHJldmlvdXMgU0RLIHZlcnNpb25zIGFuZCB0aHVzIHJlcXVpcmVzXG4gICAgICAgIC8vIHBhdGNoaW5nLlxuICAgICAgICAvL1xuICAgICAgICAvLyBXZSB0cnkgdG8gZGVsYXkgcGF0Y2hpbmcgYXMgbXVjaCBhcyBwb3NzaWJsZSB0byBhdm9pZCBwb2xsdXRpbmdcbiAgICAgICAgLy8gaGlzdG9yaWVzIHVubGVzcyBzdHJpY3RseSByZXF1aXJlZC5cbiAgICAgICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgaWYgKHBhdGNoZWQoRVhURVJOQUxfV0ZfQ0FOQ0VMX1BBVENIKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgICAgICBpZiAocGF0Y2hlZChFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0gpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmNhbmNlbFdvcmtmbG93Kys7XG4gICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgcmVxdWVzdENhbmNlbEV4dGVybmFsV29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgIHNlcSxcbiAgICAgICAgICAgIHdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLFxuICAgICAgICAgICAgICB3b3JrZmxvd0lkLFxuICAgICAgICAgICAgICBydW5JZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5jYW5jZWxXb3JrZmxvdy5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgc2lnbmFsPEFyZ3MgZXh0ZW5kcyBhbnlbXT4oZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgc3RyaW5nLCAuLi5hcmdzOiBBcmdzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICByZXR1cm4gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAgICAgJ3NpZ25hbFdvcmtmbG93JyxcbiAgICAgICAgc2lnbmFsV29ya2Zsb3dOZXh0SGFuZGxlclxuICAgICAgKSh7XG4gICAgICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLnNpZ25hbFdvcmtmbG93KyssXG4gICAgICAgIHNpZ25hbE5hbWU6IHR5cGVvZiBkZWYgPT09ICdzdHJpbmcnID8gZGVmIDogZGVmLm5hbWUsXG4gICAgICAgIGFyZ3MsXG4gICAgICAgIHRhcmdldDoge1xuICAgICAgICAgIHR5cGU6ICdleHRlcm5hbCcsXG4gICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHsgd29ya2Zsb3dJZCwgcnVuSWQgfSxcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gQnkgZGVmYXVsdCwgYSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dGdW5jOiBULFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBUaGUgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgKCkgPT4gUHJvbWlzZTxhbnk+Pih3b3JrZmxvd1R5cGU6IHN0cmluZyk6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAqKk92ZXJyaWRlIGZvciBXb3JrZmxvd3MgdGhhdCBhY2NlcHQgbm8gYXJndW1lbnRzKiouXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyAoKSA9PiBQcm9taXNlPGFueT4+KHdvcmtmbG93RnVuYzogVCk6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj47XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZU9yRnVuYzogc3RyaW5nIHwgVCxcbiAgb3B0aW9ucz86IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoRGVmYXVsdHMgPSBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zKG9wdGlvbnMgPz8ge30pO1xuICBjb25zdCB3b3JrZmxvd1R5cGUgPSB0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jID09PSAnc3RyaW5nJyA/IHdvcmtmbG93VHlwZU9yRnVuYyA6IHdvcmtmbG93VHlwZU9yRnVuYy5uYW1lO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IFtzdGFydGVkLCBjb21wbGV0ZWRdID0gYXdhaXQgZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgY29uc3QgZmlyc3RFeGVjdXRpb25SdW5JZCA9IGF3YWl0IHN0YXJ0ZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkOiBvcHRpb25zV2l0aERlZmF1bHRzLndvcmtmbG93SWQsXG4gICAgZmlyc3RFeGVjdXRpb25SdW5JZCxcbiAgICBhc3luYyByZXN1bHQoKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgICAgIHJldHVybiAoYXdhaXQgY29tcGxldGVkKSBhcyBhbnk7XG4gICAgfSxcbiAgICBhc3luYyBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdPihkZWY6IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBzdHJpbmcsIC4uLmFyZ3M6IEFyZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyXG4gICAgICApKHtcbiAgICAgICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuc2lnbmFsV29ya2Zsb3crKyxcbiAgICAgICAgc2lnbmFsTmFtZTogdHlwZW9mIGRlZiA9PT0gJ3N0cmluZycgPyBkZWYgOiBkZWYubmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2NoaWxkJyxcbiAgICAgICAgICBjaGlsZFdvcmtmbG93SWQ6IG9wdGlvbnNXaXRoRGVmYXVsdHMud29ya2Zsb3dJZCxcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGU6IFQsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzICgpID0+IFdvcmtmbG93UmV0dXJuVHlwZT4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nXG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyAoKSA9PiBXb3JrZmxvd1JldHVyblR5cGU+KHdvcmtmbG93RnVuYzogVCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQsXG4gIG9wdGlvbnM/OiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIGNvbnN0IG9wdGlvbnNXaXRoRGVmYXVsdHMgPSBhZGREZWZhdWx0V29ya2Zsb3dPcHRpb25zKG9wdGlvbnMgPz8ge30pO1xuICBjb25zdCB3b3JrZmxvd1R5cGUgPSB0eXBlb2Ygd29ya2Zsb3dUeXBlT3JGdW5jID09PSAnc3RyaW5nJyA/IHdvcmtmbG93VHlwZU9yRnVuYyA6IHdvcmtmbG93VHlwZU9yRnVuYy5uYW1lO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IGV4ZWNQcm9taXNlID0gZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgdW50cmFja1Byb21pc2UoZXhlY1Byb21pc2UpO1xuICBjb25zdCBjb21wbGV0ZWRQcm9taXNlID0gZXhlY1Byb21pc2UudGhlbigoW19zdGFydGVkLCBjb21wbGV0ZWRdKSA9PiBjb21wbGV0ZWQpO1xuICB1bnRyYWNrUHJvbWlzZShjb21wbGV0ZWRQcm9taXNlKTtcbiAgcmV0dXJuIGNvbXBsZXRlZFByb21pc2UgYXMgUHJvbWlzZTxhbnk+O1xufVxuXG4vKipcbiAqIEdldCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvdy5cbiAqXG4gKiDimqDvuI8gV2UgcmVjb21tZW5kIGNhbGxpbmcgYHdvcmtmbG93SW5mbygpYCB3aGVuZXZlciBhY2Nlc3Npbmcge0BsaW5rIFdvcmtmbG93SW5mb30gZmllbGRzLiBTb21lIFdvcmtmbG93SW5mbyBmaWVsZHNcbiAqIGNoYW5nZSBkdXJpbmcgdGhlIGxpZmV0aW1lIG9mIGFuIEV4ZWN1dGlvbuKAlGxpa2Uge0BsaW5rIFdvcmtmbG93SW5mby5oaXN0b3J5TGVuZ3RofSBhbmRcbiAqIHtAbGluayBXb3JrZmxvd0luZm8uc2VhcmNoQXR0cmlidXRlc33igJRhbmQgc29tZSBtYXkgYmUgY2hhbmdlYWJsZSBpbiB0aGUgZnV0dXJl4oCUbGlrZSB7QGxpbmsgV29ya2Zsb3dJbmZvLnRhc2tRdWV1ZX0uXG4gKlxuICogYGBgdHNcbiAqIC8vIEdPT0RcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGRvU29tZXRoaW5nKHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2Uod29ya2Zsb3dJbmZvKCkuc2VhcmNoQXR0cmlidXRlcylcbiAqIH1cbiAqIGBgYFxuICpcbiAqIGBgYHRzXG4gKiAvLyBCQURcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzXG4gKiAgIGRvU29tZXRoaW5nKGF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2UoYXR0cmlidXRlcylcbiAqIH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdvcmtmbG93SW5mbygpOiBXb3JrZmxvd0luZm8ge1xuICByZXR1cm4gZ2V0QWN0aXZhdG9yKCkuaW5mbztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IGNvZGUgaXMgZXhlY3V0aW5nIGluIHdvcmtmbG93IGNvbnRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluV29ya2Zsb3dDb250ZXh0KCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIGdldEFjdGl2YXRvcigpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgIC8vIFVzZSBzdHJpbmcgY29tcGFyaXNvbiBpbiBjYXNlIG11bHRpcGxlIHZlcnNpb25zIG9mIEB0ZW1wb3JhbGlvL2NvbW1vbiBhcmVcbiAgICAvLyBpbnN0YWxsZWQgaW4gd2hpY2ggY2FzZSBhbiBpbnN0YW5jZW9mIGNoZWNrIHdvdWxkIGZhaWwuXG4gICAgaWYgKGVyci5uYW1lID09PSAnSWxsZWdhbFN0YXRlRXJyb3InKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYSByZWZlcmVuY2UgdG8gU2lua3MgZm9yIGV4cG9ydGluZyBkYXRhIG91dCBvZiB0aGUgV29ya2Zsb3cuXG4gKlxuICogVGhlc2UgU2lua3MgKiptdXN0KiogYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBXb3JrZXIgaW4gb3JkZXIgZm9yIHRoaXNcbiAqIG1lY2hhbmlzbSB0byB3b3JrLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlTaW5rcywgU2lua3MgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKlxuICogaW50ZXJmYWNlIE15U2lua3MgZXh0ZW5kcyBTaW5rcyB7XG4gKiAgIGxvZ2dlcjoge1xuICogICAgIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAqICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICogICB9O1xuICogfVxuICpcbiAqIGNvbnN0IHsgbG9nZ2VyIH0gPSBwcm94eVNpbmtzPE15RGVwZW5kZW5jaWVzPigpO1xuICogbG9nZ2VyLmluZm8oJ3NldHRpbmcgdXAnKTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBhc3luYyBleGVjdXRlKCkge1xuICogICAgICAgbG9nZ2VyLmluZm8oJ2hleSBobycpO1xuICogICAgICAgbG9nZ2VyLmVycm9yKCdsZXRzIGdvJyk7XG4gKiAgICAgfVxuICogICB9O1xuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eVNpbmtzPFQgZXh0ZW5kcyBTaW5rcz4oKTogVCB7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGlmYWNlTmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3h5KFxuICAgICAgICAgIHt9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGdldChfLCBmbk5hbWUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAgICAgICAgICAgICAgIGFjdGl2YXRvci5zaW5rQ2FsbHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICBpZmFjZU5hbWU6IGlmYWNlTmFtZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICBmbk5hbWU6IGZuTmFtZSBhcyBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICBhcmdzLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGZ1bmN0aW9uIGBmYCB0aGF0IHdpbGwgY2F1c2UgdGhlIGN1cnJlbnQgV29ya2Zsb3cgdG8gQ29udGludWVBc05ldyB3aGVuIGNhbGxlZC5cbiAqXG4gKiBgZmAgdGFrZXMgdGhlIHNhbWUgYXJndW1lbnRzIGFzIHRoZSBXb3JrZmxvdyBmdW5jdGlvbiBzdXBwbGllZCB0byB0eXBlcGFyYW0gYEZgLlxuICpcbiAqIE9uY2UgYGZgIGlzIGNhbGxlZCwgV29ya2Zsb3cgRXhlY3V0aW9uIGltbWVkaWF0ZWx5IGNvbXBsZXRlcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1ha2VDb250aW51ZUFzTmV3RnVuYzxGIGV4dGVuZHMgV29ya2Zsb3c+KFxuICBvcHRpb25zPzogQ29udGludWVBc05ld09wdGlvbnNcbik6ICguLi5hcmdzOiBQYXJhbWV0ZXJzPEY+KSA9PiBQcm9taXNlPG5ldmVyPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBjb25zdCBpbmZvID0gd29ya2Zsb3dJbmZvKCk7XG4gIGNvbnN0IHsgd29ya2Zsb3dUeXBlLCB0YXNrUXVldWUsIC4uLnJlc3QgfSA9IG9wdGlvbnMgPz8ge307XG4gIGNvbnN0IHJlcXVpcmVkT3B0aW9ucyA9IHtcbiAgICB3b3JrZmxvd1R5cGU6IHdvcmtmbG93VHlwZSA/PyBpbmZvLndvcmtmbG93VHlwZSxcbiAgICB0YXNrUXVldWU6IHRhc2tRdWV1ZSA/PyBpbmZvLnRhc2tRdWV1ZSxcbiAgICAuLi5yZXN0LFxuICB9O1xuXG4gIHJldHVybiAoLi4uYXJnczogUGFyYW1ldGVyczxGPik6IFByb21pc2U8bmV2ZXI+ID0+IHtcbiAgICBjb25zdCBmbiA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ2NvbnRpbnVlQXNOZXcnLCBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgIGNvbnN0IHsgaGVhZGVycywgYXJncywgb3B0aW9ucyB9ID0gaW5wdXQ7XG4gICAgICB0aHJvdyBuZXcgQ29udGludWVBc05ldyh7XG4gICAgICAgIHdvcmtmbG93VHlwZTogb3B0aW9ucy53b3JrZmxvd1R5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXNcbiAgICAgICAgICA/IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB3b3JrZmxvd1J1blRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0KSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBmbih7XG4gICAgICBhcmdzLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgICBvcHRpb25zOiByZXF1aXJlZE9wdGlvbnMsXG4gICAgfSk7XG4gIH07XG59XG5cbi8qKlxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWNvbnRpbnVlLWFzLW5ldy8gfCBDb250aW51ZXMtQXMtTmV3fSB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb25cbiAqIHdpdGggZGVmYXVsdCBvcHRpb25zLlxuICpcbiAqIFNob3J0aGFuZCBmb3IgYG1ha2VDb250aW51ZUFzTmV3RnVuYzxGPigpKC4uLmFyZ3MpYC4gKFNlZToge0BsaW5rIG1ha2VDb250aW51ZUFzTmV3RnVuY30uKVxuICpcbiAqIEBleGFtcGxlXG4gKlxuICpgYGB0c1xuICppbXBvcnQgeyBjb250aW51ZUFzTmV3IH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICpcbiAqZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3cobjogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgLy8gLi4uIFdvcmtmbG93IGxvZ2ljXG4gKiAgYXdhaXQgY29udGludWVBc05ldzx0eXBlb2YgbXlXb3JrZmxvdz4obiArIDEpO1xuICp9XG4gKmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGludWVBc05ldzxGIGV4dGVuZHMgV29ya2Zsb3c+KC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pOiBQcm9taXNlPG5ldmVyPiB7XG4gIHJldHVybiBtYWtlQ29udGludWVBc05ld0Z1bmMoKSguLi5hcmdzKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBSRkMgY29tcGxpYW50IFY0IHV1aWQuXG4gKiBVc2VzIHRoZSB3b3JrZmxvdydzIGRldGVybWluaXN0aWMgUFJORyBtYWtpbmcgaXQgc2FmZSBmb3IgdXNlIHdpdGhpbiBhIHdvcmtmbG93LlxuICogVGhpcyBmdW5jdGlvbiBpcyBjcnlwdG9ncmFwaGljYWxseSBpbnNlY3VyZS5cbiAqIFNlZSB0aGUge0BsaW5rIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9ob3ctdG8tY3JlYXRlLWEtZ3VpZC11dWlkIHwgc3RhY2tvdmVyZmxvdyBkaXNjdXNzaW9ufS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1aWQ0KCk6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgaGV4YWRlY2ltYWwgdGV4dCByZXByZXNlbnRhdGlvbiBvZiBudW1iZXIgYG5gLCBwYWRkZWQgd2l0aCB6ZXJvZXMgdG8gYmUgb2YgbGVuZ3RoIGBwYFxuICBjb25zdCBobyA9IChuOiBudW1iZXIsIHA6IG51bWJlcikgPT4gbi50b1N0cmluZygxNikucGFkU3RhcnQocCwgJzAnKTtcbiAgLy8gQ3JlYXRlIGEgdmlldyBiYWNrZWQgYnkgYSAxNi1ieXRlIGJ1ZmZlclxuICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxNikpO1xuICAvLyBGaWxsIGJ1ZmZlciB3aXRoIHJhbmRvbSB2YWx1ZXNcbiAgdmlldy5zZXRVaW50MzIoMCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMig0LCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDgsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoMTIsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgLy8gUGF0Y2ggdGhlIDZ0aCBieXRlIHRvIHJlZmxlY3QgYSB2ZXJzaW9uIDQgVVVJRFxuICB2aWV3LnNldFVpbnQ4KDYsICh2aWV3LmdldFVpbnQ4KDYpICYgMHhmKSB8IDB4NDApO1xuICAvLyBQYXRjaCB0aGUgOHRoIGJ5dGUgdG8gcmVmbGVjdCBhIHZhcmlhbnQgMSBVVUlEICh2ZXJzaW9uIDQgVVVJRHMgYXJlKVxuICB2aWV3LnNldFVpbnQ4KDgsICh2aWV3LmdldFVpbnQ4KDgpICYgMHgzZikgfCAweDgwKTtcbiAgLy8gQ29tcGlsZSB0aGUgY2Fub25pY2FsIHRleHR1YWwgZm9ybSBmcm9tIHRoZSBhcnJheSBkYXRhXG4gIHJldHVybiBgJHtobyh2aWV3LmdldFVpbnQzMigwKSwgOCl9LSR7aG8odmlldy5nZXRVaW50MTYoNCksIDQpfS0ke2hvKHZpZXcuZ2V0VWludDE2KDYpLCA0KX0tJHtobyhcbiAgICB2aWV3LmdldFVpbnQxNig4KSxcbiAgICA0XG4gICl9LSR7aG8odmlldy5nZXRVaW50MzIoMTApLCA4KX0ke2hvKHZpZXcuZ2V0VWludDE2KDE0KSwgNCl9YDtcbn1cblxuLyoqXG4gKiBQYXRjaCBvciB1cGdyYWRlIHdvcmtmbG93IGNvZGUgYnkgY2hlY2tpbmcgb3Igc3RhdGluZyB0aGF0IHRoaXMgd29ya2Zsb3cgaGFzIGEgY2VydGFpbiBwYXRjaC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIElmIHRoZSB3b3JrZmxvdyBpcyByZXBsYXlpbmcgYW4gZXhpc3RpbmcgaGlzdG9yeSwgdGhlbiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBpZiB0aGF0XG4gKiBoaXN0b3J5IHdhcyBwcm9kdWNlZCBieSBhIHdvcmtlciB3aGljaCBhbHNvIGhhZCBhIGBwYXRjaGVkYCBjYWxsIHdpdGggdGhlIHNhbWUgYHBhdGNoSWRgLlxuICogSWYgdGhlIGhpc3Rvcnkgd2FzIHByb2R1Y2VkIGJ5IGEgd29ya2VyICp3aXRob3V0KiBzdWNoIGEgY2FsbCwgdGhlbiBpdCB3aWxsIHJldHVybiBmYWxzZS5cbiAqXG4gKiBJZiB0aGUgd29ya2Zsb3cgaXMgbm90IGN1cnJlbnRseSByZXBsYXlpbmcsIHRoZW4gdGhpcyBjYWxsICphbHdheXMqIHJldHVybnMgdHJ1ZS5cbiAqXG4gKiBZb3VyIHdvcmtmbG93IGNvZGUgc2hvdWxkIHJ1biB0aGUgXCJuZXdcIiBjb2RlIGlmIHRoaXMgcmV0dXJucyB0cnVlLCBpZiBpdCByZXR1cm5zIGZhbHNlLCB5b3VcbiAqIHNob3VsZCBydW4gdGhlIFwib2xkXCIgY29kZS4gQnkgZG9pbmcgdGhpcywgeW91IGNhbiBtYWludGFpbiBkZXRlcm1pbmlzbS5cbiAqXG4gKiBAcGFyYW0gcGF0Y2hJZCBBbiBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIGJlIHVuaXF1ZSB0byB0aGlzIHBhdGNoLiBJdCBpcyBPSyB0byB1c2UgbXVsdGlwbGVcbiAqIGNhbGxzIHdpdGggdGhlIHNhbWUgSUQsIHdoaWNoIG1lYW5zIGFsbCBzdWNoIGNhbGxzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoZWQocGF0Y2hJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwYXRjaEludGVybmFsKHBhdGNoSWQsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBJbmRpY2F0ZSB0aGF0IGEgcGF0Y2ggaXMgYmVpbmcgcGhhc2VkIG91dC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIFdvcmtmbG93cyB3aXRoIHRoaXMgY2FsbCBtYXkgYmUgZGVwbG95ZWQgYWxvbmdzaWRlIHdvcmtmbG93cyB3aXRoIGEge0BsaW5rIHBhdGNoZWR9IGNhbGwsIGJ1dFxuICogdGhleSBtdXN0ICpub3QqIGJlIGRlcGxveWVkIHdoaWxlIGFueSB3b3JrZXJzIHN0aWxsIGV4aXN0IHJ1bm5pbmcgb2xkIGNvZGUgd2l0aG91dCBhXG4gKiB7QGxpbmsgcGF0Y2hlZH0gY2FsbCwgb3IgYW55IHJ1bnMgd2l0aCBoaXN0b3JpZXMgcHJvZHVjZWQgYnkgc3VjaCB3b3JrZXJzIGV4aXN0LiBJZiBlaXRoZXIga2luZFxuICogb2Ygd29ya2VyIGVuY291bnRlcnMgYSBoaXN0b3J5IHByb2R1Y2VkIGJ5IHRoZSBvdGhlciwgdGhlaXIgYmVoYXZpb3IgaXMgdW5kZWZpbmVkLlxuICpcbiAqIE9uY2UgYWxsIGxpdmUgd29ya2Zsb3cgcnVucyBoYXZlIGJlZW4gcHJvZHVjZWQgYnkgd29ya2VycyB3aXRoIHRoaXMgY2FsbCwgeW91IGNhbiBkZXBsb3kgd29ya2Vyc1xuICogd2hpY2ggYXJlIGZyZWUgb2YgZWl0aGVyIGtpbmQgb2YgcGF0Y2ggY2FsbCBmb3IgdGhpcyBJRC4gV29ya2VycyB3aXRoIGFuZCB3aXRob3V0IHRoaXMgY2FsbFxuICogbWF5IGNvZXhpc3QsIGFzIGxvbmcgYXMgdGhleSBhcmUgYm90aCBydW5uaW5nIHRoZSBcIm5ld1wiIGNvZGUuXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXByZWNhdGVQYXRjaChwYXRjaElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgcGF0Y2hJbnRlcm5hbChwYXRjaElkLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gcGF0Y2hJbnRlcm5hbChwYXRjaElkOiBzdHJpbmcsIGRlcHJlY2F0ZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIC8vIFBhdGNoIG9wZXJhdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGludGVyY2VwdGlvbiBhdCB0aGUgbW9tZW50LCBpZiBpdCBkaWQsXG4gIC8vIHRoaXMgd291bGQgYmUgdGhlIHBsYWNlIHRvIHN0YXJ0IHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cblxuICBpZiAoYWN0aXZhdG9yLndvcmtmbG93ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1BhdGNoZXMgY2Fubm90IGJlIHVzZWQgYmVmb3JlIFdvcmtmbG93IHN0YXJ0cycpO1xuICB9XG4gIGNvbnN0IHVzZVBhdGNoID0gIWFjdGl2YXRvci5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyB8fCBhY3RpdmF0b3Iua25vd25QcmVzZW50UGF0Y2hlcy5oYXMocGF0Y2hJZCk7XG4gIC8vIEF2b2lkIHNlbmRpbmcgY29tbWFuZHMgZm9yIHBhdGNoZXMgY29yZSBhbHJlYWR5IGtub3dzIGFib3V0LlxuICAvLyBUaGlzIG9wdGltaXphdGlvbiBlbmFibGVzIGRldmVsb3BtZW50IG9mIGF1dG9tYXRpYyBwYXRjaGluZyB0b29scy5cbiAgaWYgKHVzZVBhdGNoICYmICFhY3RpdmF0b3Iuc2VudFBhdGNoZXMuaGFzKHBhdGNoSWQpKSB7XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNldFBhdGNoTWFya2VyOiB7IHBhdGNoSWQsIGRlcHJlY2F0ZWQgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3Iuc2VudFBhdGNoZXMuYWRkKHBhdGNoSWQpO1xuICB9XG4gIHJldHVybiB1c2VQYXRjaDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYGZuYCBldmFsdWF0ZXMgdG8gYHRydWVgIG9yIGB0aW1lb3V0YCBleHBpcmVzLlxuICpcbiAqIEBwYXJhbSB0aW1lb3V0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAqXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBjb25kaXRpb24gd2FzIHRydWUgYmVmb3JlIHRoZSB0aW1lb3V0IGV4cGlyZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbiwgdGltZW91dDogbnVtYmVyIHwgc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPjtcblxuLyoqXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYGZuYCBldmFsdWF0ZXMgdG8gYHRydWVgLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuKTogUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbiwgdGltZW91dD86IG51bWJlciB8IHN0cmluZyk6IFByb21pc2U8dm9pZCB8IGJvb2xlYW4+IHtcbiAgLy8gUHJpb3IgdG8gMS41LjAsIGBjb25kaXRpb24oZm4sIDApYCB3YXMgdHJlYXRlZCBhcyBlcXVpdmFsZW50IHRvIGBjb25kaXRpb24oZm4sIHVuZGVmaW5lZClgXG4gIGlmICh0aW1lb3V0ID09PSAwICYmICFnZXRBY3RpdmF0b3IoKS5jaGVja0ludGVybmFsUGF0Y2hBdExlYXN0KDEpKSB7XG4gICAgcmV0dXJuIGNvbmRpdGlvbklubmVyKGZuKTtcbiAgfVxuICBpZiAodHlwZW9mIHRpbWVvdXQgPT09ICdudW1iZXInIHx8IHR5cGVvZiB0aW1lb3V0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBDYW5jZWxsYXRpb25TY29wZS5jYW5jZWxsYWJsZShhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gYXdhaXQgUHJvbWlzZS5yYWNlKFtzbGVlcCh0aW1lb3V0KS50aGVuKCgpID0+IGZhbHNlKSwgY29uZGl0aW9uSW5uZXIoZm4pLnRoZW4oKCkgPT4gdHJ1ZSldKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKS5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICByZXR1cm4gY29uZGl0aW9uSW5uZXIoZm4pO1xufVxuXG5mdW5jdGlvbiBjb25kaXRpb25Jbm5lcihmbjogKCkgPT4gYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5jb25kaXRpb24rKztcbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGFjdGl2YXRvci5ibG9ja2VkQ29uZGl0aW9ucy5kZWxldGUoc2VxKTtcbiAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gRWFnZXIgZXZhbHVhdGlvblxuICAgIGlmIChmbigpKSB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYWN0aXZhdG9yLmJsb2NrZWRDb25kaXRpb25zLnNldChzZXEsIHsgZm4sIHJlc29sdmUgfSk7XG4gIH0pO1xufVxuXG4vKipcbiAqIERlZmluZSBhIHNpZ25hbCBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogRGVmaW5pdGlvbnMgYXJlIHVzZWQgdG8gcmVnaXN0ZXIgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gc2lnbmFsIFdvcmtmbG93cyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0sIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlfSBvciB7QGxpbmsgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZX0uXG4gKiBEZWZpbml0aW9ucyBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10gPSBbXT4obmFtZTogc3RyaW5nKTogU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3NpZ25hbCcsXG4gICAgbmFtZSxcbiAgfTtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBxdWVyeSBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogRGVmaW5pdGlvbnMgYXJlIHVzZWQgdG8gcmVnaXN0ZXIgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gcXVlcnkgV29ya2Zsb3dzIHVzaW5nIGEge0BsaW5rIFdvcmtmbG93SGFuZGxlfS5cbiAqIERlZmluaXRpb25zIGNhbiBiZSByZXVzZWQgaW4gbXVsdGlwbGUgV29ya2Zsb3dzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lUXVlcnk8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10gPSBbXT4obmFtZTogc3RyaW5nKTogUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdxdWVyeScsXG4gICAgbmFtZSxcbiAgfTtcbn1cblxuLyoqXG4gKiBBIGhhbmRsZXIgZnVuY3Rpb24gY2FwYWJsZSBvZiBhY2NlcHRpbmcgdGhlIGFyZ3VtZW50cyBmb3IgYSBnaXZlbiBTaWduYWxEZWZpbml0aW9uIG9yIFF1ZXJ5RGVmaW5pdGlvbi5cbiAqL1xuZXhwb3J0IHR5cGUgSGFuZGxlcjxcbiAgUmV0LFxuICBBcmdzIGV4dGVuZHMgYW55W10sXG4gIFQgZXh0ZW5kcyBTaWduYWxEZWZpbml0aW9uPEFyZ3M+IHwgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz5cbj4gPSBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxpbmZlciBBPlxuICA/ICguLi5hcmdzOiBBKSA9PiB2b2lkIHwgUHJvbWlzZTx2b2lkPlxuICA6IFQgZXh0ZW5kcyBRdWVyeURlZmluaXRpb248aW5mZXIgUiwgaW5mZXIgQT5cbiAgPyAoLi4uYXJnczogQSkgPT4gUlxuICA6IG5ldmVyO1xuXG4vKipcbiAqIFNldCBhIGhhbmRsZXIgZnVuY3Rpb24gZm9yIGEgV29ya2Zsb3cgcXVlcnkgb3Igc2lnbmFsLlxuICpcbiAqIElmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIGdpdmVuIHNpZ25hbCBvciBxdWVyeSBuYW1lIHRoZSBsYXN0IGhhbmRsZXIgd2lsbCBvdmVyd3JpdGUgYW55IHByZXZpb3VzIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBkZWYgYSB7QGxpbmsgU2lnbmFsRGVmaW5pdGlvbn0gb3Ige0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gYXMgcmV0dXJuZWQgYnkge0BsaW5rIGRlZmluZVNpZ25hbH0gb3Ige0BsaW5rIGRlZmluZVF1ZXJ5fSByZXNwZWN0aXZlbHkuXG4gKiBAcGFyYW0gaGFuZGxlciBhIGNvbXBhdGlibGUgaGFuZGxlciBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIGRlZmluaXRpb24gb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+PihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWRcbik6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGRlZi50eXBlID09PSAnc2lnbmFsJykge1xuICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5zZXQoZGVmLm5hbWUsIGhhbmRsZXIgYXMgYW55KTtcbiAgICBjb25zdCBidWZmZXJlZFNpZ25hbHMgPSBhY3RpdmF0b3IuYnVmZmVyZWRTaWduYWxzLmdldChkZWYubmFtZSk7XG4gICAgaWYgKGJ1ZmZlcmVkU2lnbmFscyAhPT0gdW5kZWZpbmVkICYmIGhhbmRsZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYWN0aXZhdG9yLmJ1ZmZlcmVkU2lnbmFscy5kZWxldGUoZGVmLm5hbWUpO1xuICAgICAgZm9yIChjb25zdCBzaWduYWwgb2YgYnVmZmVyZWRTaWduYWxzKSB7XG4gICAgICAgIGFjdGl2YXRvci5zaWduYWxXb3JrZmxvdyhzaWduYWwpO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYudHlwZSA9PT0gJ3F1ZXJ5Jykge1xuICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLnNldChkZWYubmFtZSwgaGFuZGxlciBhcyBhbnkpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgZGVmaW5pdGlvbiB0eXBlOiAkeyhkZWYgYXMgYW55KS50eXBlfWApO1xuICB9XG59XG5cbi8qKlxuICogVXBkYXRlcyB0aGlzIFdvcmtmbG93J3MgU2VhcmNoIEF0dHJpYnV0ZXMgYnkgbWVyZ2luZyB0aGUgcHJvdmlkZWQgYHNlYXJjaEF0dHJpYnV0ZXNgIHdpdGggdGhlIGV4aXN0aW5nIFNlYXJjaFxuICogQXR0cmlidXRlcywgYHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXNgLlxuICpcbiAqIEZvciBleGFtcGxlLCB0aGlzIFdvcmtmbG93IGNvZGU6XG4gKlxuICogYGBgdHNcbiAqIHVwc2VydFNlYXJjaEF0dHJpYnV0ZXMoe1xuICogICBDdXN0b21JbnRGaWVsZDogWzEsIDIsIDNdLFxuICogICBDdXN0b21Cb29sRmllbGQ6IFt0cnVlXVxuICogfSk7XG4gKiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFs0Ml0sXG4gKiAgIEN1c3RvbUtleXdvcmRGaWVsZDogWydkdXJhYmxlIGNvZGUnLCAnaXMgZ3JlYXQnXVxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiB3b3VsZCByZXN1bHQgaW4gdGhlIFdvcmtmbG93IGhhdmluZyB0aGVzZSBTZWFyY2ggQXR0cmlidXRlczpcbiAqXG4gKiBgYGB0c1xuICoge1xuICogICBDdXN0b21JbnRGaWVsZDogWzQyXSxcbiAqICAgQ3VzdG9tQm9vbEZpZWxkOiBbdHJ1ZV0sXG4gKiAgIEN1c3RvbUtleXdvcmRGaWVsZDogWydkdXJhYmxlIGNvZGUnLCAnaXMgZ3JlYXQnXVxuICogfVxuICogYGBgXG4gKlxuICogQHBhcmFtIHNlYXJjaEF0dHJpYnV0ZXMgVGhlIFJlY29yZCB0byBtZXJnZS4gVXNlIGEgdmFsdWUgb2YgYFtdYCB0byBjbGVhciBhIFNlYXJjaCBBdHRyaWJ1dGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHNlYXJjaEF0dHJpYnV0ZXM6IFNlYXJjaEF0dHJpYnV0ZXMpOiB2b2lkIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG5cbiAgY29uc3QgbWVyZ2VkU2VhcmNoQXR0cmlidXRlcyA9IHsgLi4uYWN0aXZhdG9yLmluZm8uc2VhcmNoQXR0cmlidXRlcywgLi4uc2VhcmNoQXR0cmlidXRlcyB9O1xuICBpZiAoIW1lcmdlZFNlYXJjaEF0dHJpYnV0ZXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NlYXJjaEF0dHJpYnV0ZXMgbXVzdCBiZSBhIG5vbi1udWxsIFNlYXJjaEF0dHJpYnV0ZXMnKTtcbiAgfVxuXG4gIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgdXBzZXJ0V29ya2Zsb3dTZWFyY2hBdHRyaWJ1dGVzOiB7XG4gICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBtYXBUb1BheWxvYWRzKHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsIHNlYXJjaEF0dHJpYnV0ZXMpLFxuICAgIH0sXG4gIH0pO1xuXG4gIGFjdGl2YXRvci5pbmZvLnNlYXJjaEF0dHJpYnV0ZXMgPSBtZXJnZWRTZWFyY2hBdHRyaWJ1dGVzO1xufVxuXG5leHBvcnQgY29uc3Qgc3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8c3RyaW5nPignX19zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IGVuaGFuY2VkU3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8RW5oYW5jZWRTdGFja1RyYWNlPignX19lbmhhbmNlZF9zdGFja190cmFjZScpO1xuIiwiLyoqXG4gKiBIZWxwZXJzLlxuICovXG5cbnZhciBzID0gMTAwMDtcbnZhciBtID0gcyAqIDYwO1xudmFyIGggPSBtICogNjA7XG52YXIgZCA9IGggKiAyNDtcbnZhciB3ID0gZCAqIDc7XG52YXIgeSA9IGQgKiAzNjUuMjU7XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAdGhyb3dzIHtFcnJvcn0gdGhyb3cgYW4gZXJyb3IgaWYgdmFsIGlzIG5vdCBhIG5vbi1lbXB0eSBzdHJpbmcgb3IgYSBudW1iZXJcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHZhbCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgdmFsLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gcGFyc2UodmFsKTtcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiBpc0Zpbml0ZSh2YWwpKSB7XG4gICAgcmV0dXJuIG9wdGlvbnMubG9uZyA/IGZtdExvbmcodmFsKSA6IGZtdFNob3J0KHZhbCk7XG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICd2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIHZhbGlkIG51bWJlci4gdmFsPScgK1xuICAgICAgSlNPTi5zdHJpbmdpZnkodmFsKVxuICApO1xufTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgZ2l2ZW4gYHN0cmAgYW5kIHJldHVybiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHN0ciA9IFN0cmluZyhzdHIpO1xuICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbWF0Y2ggPSAvXigtPyg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8d2Vla3M/fHd8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoXG4gICAgc3RyXG4gICk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKTtcbiAgdmFyIHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAneWVhcnMnOlxuICAgIGNhc2UgJ3llYXInOlxuICAgIGNhc2UgJ3lycyc6XG4gICAgY2FzZSAneXInOlxuICAgIGNhc2UgJ3knOlxuICAgICAgcmV0dXJuIG4gKiB5O1xuICAgIGNhc2UgJ3dlZWtzJzpcbiAgICBjYXNlICd3ZWVrJzpcbiAgICBjYXNlICd3JzpcbiAgICAgIHJldHVybiBuICogdztcbiAgICBjYXNlICdkYXlzJzpcbiAgICBjYXNlICdkYXknOlxuICAgIGNhc2UgJ2QnOlxuICAgICAgcmV0dXJuIG4gKiBkO1xuICAgIGNhc2UgJ2hvdXJzJzpcbiAgICBjYXNlICdob3VyJzpcbiAgICBjYXNlICdocnMnOlxuICAgIGNhc2UgJ2hyJzpcbiAgICBjYXNlICdoJzpcbiAgICAgIHJldHVybiBuICogaDtcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG07XG4gICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgY2FzZSAnc2Vjb25kJzpcbiAgICBjYXNlICdzZWNzJzpcbiAgICBjYXNlICdzZWMnOlxuICAgIGNhc2UgJ3MnOlxuICAgICAgcmV0dXJuIG4gKiBzO1xuICAgIGNhc2UgJ21pbGxpc2Vjb25kcyc6XG4gICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgIGNhc2UgJ21zZWNzJzpcbiAgICBjYXNlICdtc2VjJzpcbiAgICBjYXNlICdtcyc6XG4gICAgICByZXR1cm4gbjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbXNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGZtdFNob3J0KG1zKSB7XG4gIHZhciBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgaWYgKG1zQWJzID49IGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO1xuICB9XG4gIGlmIChtc0FicyA+PSBoKSB7XG4gICAgcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztcbiAgfVxuICBpZiAobXNBYnMgPj0gbSkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7XG4gIH1cbiAgaWYgKG1zQWJzID49IHMpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO1xuICB9XG4gIHJldHVybiBtcyArICdtcyc7XG59XG5cbi8qKlxuICogTG9uZyBmb3JtYXQgZm9yIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBmbXRMb25nKG1zKSB7XG4gIHZhciBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgaWYgKG1zQWJzID49IGQpIHtcbiAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgZCwgJ2RheScpO1xuICB9XG4gIGlmIChtc0FicyA+PSBoKSB7XG4gICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIGgsICdob3VyJyk7XG4gIH1cbiAgaWYgKG1zQWJzID49IG0pIHtcbiAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgbSwgJ21pbnV0ZScpO1xuICB9XG4gIGlmIChtc0FicyA+PSBzKSB7XG4gICAgcmV0dXJuIHBsdXJhbChtcywgbXNBYnMsIHMsICdzZWNvbmQnKTtcbiAgfVxuICByZXR1cm4gbXMgKyAnIG1zJztcbn1cblxuLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL1xuXG5mdW5jdGlvbiBwbHVyYWwobXMsIG1zQWJzLCBuLCBuYW1lKSB7XG4gIHZhciBpc1BsdXJhbCA9IG1zQWJzID49IG4gKiAxLjU7XG4gIHJldHVybiBNYXRoLnJvdW5kKG1zIC8gbikgKyAnICcgKyBuYW1lICsgKGlzUGx1cmFsID8gJ3MnIDogJycpO1xufVxuIiwiaW1wb3J0IHsgcHJveHlBY3Rpdml0aWVzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xyXG5pbXBvcnQgKiBhcyBhY3Rpdml0aWVzIGZyb20gXCIuL2FjdGl2aXRpZXMvcHJpY2VBY3Rpb25Qb3NpdGlvblwiO1xyXG5pbXBvcnQgeyBQcmVtYXJrZXREYXRhIH0gZnJvbSBcIi4vaW50ZXJmYWNlcy9wcmVtYXJrZXREYXRhXCI7XHJcbmltcG9ydCB7IFRva2VuSlNPTiB9IGZyb20gJy4vaW50ZXJmYWNlcy90b2tlbic7XHJcblxyXG5jb25zdCB7XHJcbiAgaXNfbWFya2V0X29wZW4sXHJcbiAgZ2V0X2N1cnJlbnRfcHJpY2UsXHJcbiAgZ2V0X3N1cnJvdW5kaW5nX2tleV9sZXZlbHMsXHJcbiAgZ2V0X3Bvc2l0aW9uX3NldHVwLFxyXG4gIGdldE9wdGlvbnNTZWxlY3Rpb24sXHJcbiAgd2FpdFRvU2lnbmFsT3BlblBvc2l0aW9uLFxyXG4gIGNoZWNrSWZQb3NpdGlvbkZpbGxlZCxcclxuICBnZXRPcHRpb25TeW1ib2wsXHJcbiAgd2FpdFRvU2lnbmFsQ3V0UG9zaXRpb24sXHJcbiAgd2FpdFRvU2lnbmFsQ2xvc2VQb3NpdGlvbixcclxuICBnZXRMb2dpbkNyZWRlbnRpYWxzLFxyXG4gIGdldFVzZXJQcmluY2lwbGVzIH0gPSBwcm94eUFjdGl2aXRpZXM8dHlwZW9mIGFjdGl2aXRpZXM+KHtcclxuICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IDI4ODAwMDAwLFxyXG4gIH0pO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaWNlQWN0aW9uKHByZW1hcmtldERhdGE6IFByZW1hcmtldERhdGEpOiBQcm9taXNlPHN0cmluZz4ge1xyXG4gIGlmIChwcmVtYXJrZXREYXRhID09PSB1bmRlZmluZWQgfHwgcHJlbWFya2V0RGF0YSA9PT0gbnVsbCkge1xyXG4gICAgcmV0dXJuICdObyBPcHBvcnR1bml0aWVzJ1xyXG4gIH1cclxuXHJcbiAgY29uc3QgYnVkZ2V0ID0gcHJlbWFya2V0RGF0YS5idWRnZXQ7XHJcbiAgY29uc3QgY2xpZW50SWQgPSBwcmVtYXJrZXREYXRhLmNsaWVudF9pZDtcclxuICBjb25zdCBhY2NvdW50SWQgPSBwcmVtYXJrZXREYXRhLmFjY291bnRfaWQ7XHJcbiAgY29uc3Qga2V5TGV2ZWxzID0gcHJlbWFya2V0RGF0YS5rZXlMZXZlbHM7XHJcbiAgY29uc3QgZGVtYW5kWm9uZXMgPSBwcmVtYXJrZXREYXRhLmRlbWFuZFpvbmVzO1xyXG4gIGNvbnN0IHN1cHBseVpvbmVzID0gcHJlbWFya2V0RGF0YS5zdXBwbHlab25lcztcclxuICBjb25zdCBzeW1ib2wgPSBwcmVtYXJrZXREYXRhLnN5bWJvbDtcclxuXHJcbiAgbGV0IHRva2VuOiBUb2tlbkpTT04gPSB7XHJcbiAgICBhY2Nlc3NfdG9rZW46IG51bGwsXHJcbiAgICByZWZyZXNoX3Rva2VuOiBudWxsLFxyXG4gICAgYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQ6IG51bGwsXHJcbiAgICByZWZyZXNoX3Rva2VuX2V4cGlyZXNfYXQ6IG51bGwsXHJcbiAgICBsb2dnZWRfaW46IG51bGwsXHJcbiAgICBhY2Nlc3NfdG9rZW5fZXhwaXJlc19hdF9kYXRlOiBudWxsLFxyXG4gICAgcmVmcmVzaF90b2tlbl9leHBpcmVzX2F0X2RhdGU6IG51bGxcclxuICB9O1xyXG5cclxuICBsZXQgZ2V0dGluZ1VzZXJQcmluY2lwbGVzID0ge1xyXG4gICAgdXNlclByaW5jaXBsZXM6IG51bGwsXHJcbiAgICBwYXJhbXM6IG51bGwsXHJcbiAgfTtcclxuXHJcbiAgY29uc3QgbWFya2V0T3BlbiA9IGF3YWl0IGlzX21hcmtldF9vcGVuKCk7XHJcblxyXG4gIGlmIChtYXJrZXRPcGVuKSB7XHJcbiAgICB3aGlsZSAoZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnBhcmFtcyA9PT0gbnVsbCkge1xyXG4gICAgICB0b2tlbiA9IGF3YWl0IGdldExvZ2luQ3JlZGVudGlhbHMoY2xpZW50SWQpO1xyXG4gICAgICBnZXR0aW5nVXNlclByaW5jaXBsZXMgPSBhd2FpdCBnZXRVc2VyUHJpbmNpcGxlcyh0b2tlbi5hY2Nlc3NfdG9rZW4pO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBwYXJhbXMgPSBnZXR0aW5nVXNlclByaW5jaXBsZXMucGFyYW1zO1xyXG4gICAgbGV0IGFkbWluQ29uZmlnID0ge1xyXG4gICAgICBcInNlcnZpY2VcIjogXCJBRE1JTlwiLFxyXG4gICAgICBcImNvbW1hbmRcIjogXCJMT0dJTlwiLFxyXG4gICAgICBcInJlcXVlc3RpZFwiOiBcIjBcIixcclxuICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgIFwic291cmNlXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uYXBwSWQsXHJcbiAgICAgIFwicGFyYW1ldGVyc1wiOiB7XHJcbiAgICAgICAgXCJjcmVkZW50aWFsXCI6IHBhcmFtcyxcclxuICAgICAgICBcInRva2VuXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8udG9rZW4sXHJcbiAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMS4wXCIsXHJcbiAgICAgICAgXCJxb3NsZXZlbFwiOiBcIjBcIixcclxuICAgICAgfSxcclxuICAgIH1cclxuICAgIGxldCBxdW90ZUNvbmZpZyA9IHtcclxuICAgICAgXCJzZXJ2aWNlXCI6IFwiUVVPVEVcIixcclxuICAgICAgXCJyZXF1ZXN0aWRcIjogXCIxXCIsXHJcbiAgICAgIFwiY29tbWFuZFwiOiBcIlNVQlNcIixcclxuICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgIFwic291cmNlXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uYXBwSWQsXHJcbiAgICAgIFwicGFyYW1ldGVyc1wiOiB7XHJcbiAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgIFwiZmllbGRzXCI6IFwiMCwxLDIsMyw0LDVcIixcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgICBsZXQgYm9va0NvbmZpZyA9IHtcclxuICAgICAgXCJzZXJ2aWNlXCI6IFwiTkFTREFRX0JPT0tcIixcclxuICAgICAgXCJyZXF1ZXN0aWRcIjogXCIzXCIsXHJcbiAgICAgIFwiY29tbWFuZFwiOiBcIlNVQlNcIixcclxuICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgIFwic291cmNlXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uYXBwSWQsXHJcbiAgICAgIFwicGFyYW1ldGVyc1wiOiB7XHJcbiAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgIFwiZmllbGRzXCI6IFwiMCwxLDIsM1wiLFxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICAgIGxldCB0aW1lU2FsZUNvbmZpZyA9IHtcclxuICAgICAgXCJzZXJ2aWNlXCI6IFwiVElNRVNBTEVfRVFVSVRZXCIsXHJcbiAgICAgIFwicmVxdWVzdGlkXCI6IFwiNFwiLFxyXG4gICAgICBcImNvbW1hbmRcIjogXCJTVUJTXCIsXHJcbiAgICAgIFwiYWNjb3VudFwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuYWNjb3VudHNbMF0uYWNjb3VudElkLFxyXG4gICAgICBcInNvdXJjZVwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuc3RyZWFtZXJJbmZvLmFwcElkLFxyXG4gICAgICBcInBhcmFtZXRlcnNcIjoge1xyXG4gICAgICAgIFwia2V5c1wiOiBwcmVtYXJrZXREYXRhLnN5bWJvbCxcclxuICAgICAgICBcImZpZWxkc1wiOiBcIjAsMSwyLDNcIixcclxuICAgICAgfSxcclxuICAgIH07XHJcbiAgICBsZXQgbG9naW5SZXF1ZXN0ID0ge1xyXG4gICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICBhZG1pbkNvbmZpZyxcclxuICAgICAgXSxcclxuICAgIH07XHJcbiAgICBsZXQgbWFya2V0UmVxdWVzdCA9IHtcclxuICAgICAgXCJyZXF1ZXN0c1wiOiBbXHJcbiAgICAgICAgcXVvdGVDb25maWcsXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG4gICAgbGV0IGJvb2tSZXF1ZXN0ID0ge1xyXG4gICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICBib29rQ29uZmlnLFxyXG4gICAgICBdLFxyXG4gICAgfTtcclxuICAgIGxldCB0aW1lU2FsZXNSZXF1ZXN0ID0ge1xyXG4gICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICB0aW1lU2FsZUNvbmZpZyxcclxuICAgICAgXSxcclxuICAgIH07XHJcblxyXG4gICAgbGV0IHdzVXJpID0gYHdzczovLyR7Z2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby5zdHJlYW1lclNvY2tldFVybH0vd3NgO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRQcmljZSA9IGF3YWl0IGdldF9jdXJyZW50X3ByaWNlKHdzVXJpLCBsb2dpblJlcXVlc3QsIG1hcmtldFJlcXVlc3QsIGRlbWFuZFpvbmVzLCBzdXBwbHlab25lcyk7XHJcbiAgICBjb25zdCBzdXJyb3VuZGluZ0tleUxldmVscyA9IGF3YWl0IGdldF9zdXJyb3VuZGluZ19rZXlfbGV2ZWxzKGN1cnJlbnRQcmljZS5jbG9zZVByaWNlLCBrZXlMZXZlbHMpO1xyXG4gICAgY29uc3QgcG9zaXRpb25TZXR1cCA9IGF3YWl0IGdldF9wb3NpdGlvbl9zZXR1cChzdXJyb3VuZGluZ0tleUxldmVscywgY3VycmVudFByaWNlLmRlbWFuZFpvbmUsIGN1cnJlbnRQcmljZS5zdXBwbHlab25lKTtcclxuICAgIGNvbnN0IG9wdGlvblNlbGVjdGlvbiA9IGF3YWl0IGdldE9wdGlvbnNTZWxlY3Rpb24ocG9zaXRpb25TZXR1cCwgc3ltYm9sLCB0b2tlbi5hY2Nlc3NfdG9rZW4pO1xyXG5cclxuXHJcbiAgICB0b2tlbiA9IHtcclxuICAgICAgYWNjZXNzX3Rva2VuOiBudWxsLFxyXG4gICAgICByZWZyZXNoX3Rva2VuOiBudWxsLFxyXG4gICAgICBhY2Nlc3NfdG9rZW5fZXhwaXJlc19hdDogbnVsbCxcclxuICAgICAgcmVmcmVzaF90b2tlbl9leHBpcmVzX2F0OiBudWxsLFxyXG4gICAgICBsb2dnZWRfaW46IG51bGwsXHJcbiAgICAgIGFjY2Vzc190b2tlbl9leHBpcmVzX2F0X2RhdGU6IG51bGwsXHJcbiAgICAgIHJlZnJlc2hfdG9rZW5fZXhwaXJlc19hdF9kYXRlOiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIGdldHRpbmdVc2VyUHJpbmNpcGxlcyA9IHtcclxuICAgICAgdXNlclByaW5jaXBsZXM6IG51bGwsXHJcbiAgICAgIHBhcmFtczogbnVsbCxcclxuICAgIH07XHJcblxyXG4gICAgd2hpbGUgKGdldHRpbmdVc2VyUHJpbmNpcGxlcy5wYXJhbXMgPT09IG51bGwpIHtcclxuICAgICAgdG9rZW4gPSBhd2FpdCBnZXRMb2dpbkNyZWRlbnRpYWxzKGNsaWVudElkKTtcclxuICAgICAgZ2V0dGluZ1VzZXJQcmluY2lwbGVzID0gYXdhaXQgZ2V0VXNlclByaW5jaXBsZXModG9rZW4uYWNjZXNzX3Rva2VuKTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJhbXMgPSBnZXR0aW5nVXNlclByaW5jaXBsZXMucGFyYW1zO1xyXG4gICAgYWRtaW5Db25maWcgPSB7XHJcbiAgICAgIFwic2VydmljZVwiOiBcIkFETUlOXCIsXHJcbiAgICAgIFwiY29tbWFuZFwiOiBcIkxPR0lOXCIsXHJcbiAgICAgIFwicmVxdWVzdGlkXCI6IFwiMFwiLFxyXG4gICAgICBcImFjY291bnRcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLmFjY291bnRzWzBdLmFjY291bnRJZCxcclxuICAgICAgXCJzb3VyY2VcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby5hcHBJZCxcclxuICAgICAgXCJwYXJhbWV0ZXJzXCI6IHtcclxuICAgICAgICBcImNyZWRlbnRpYWxcIjogcGFyYW1zLFxyXG4gICAgICAgIFwidG9rZW5cIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby50b2tlbixcclxuICAgICAgICBcInZlcnNpb25cIjogXCIxLjBcIixcclxuICAgICAgICBcInFvc2xldmVsXCI6IFwiMFwiLFxyXG4gICAgICB9LFxyXG4gICAgfVxyXG4gICAgcXVvdGVDb25maWcgPSB7XHJcbiAgICAgIFwic2VydmljZVwiOiBcIlFVT1RFXCIsXHJcbiAgICAgIFwicmVxdWVzdGlkXCI6IFwiMVwiLFxyXG4gICAgICBcImNvbW1hbmRcIjogXCJTVUJTXCIsXHJcbiAgICAgIFwiYWNjb3VudFwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuYWNjb3VudHNbMF0uYWNjb3VudElkLFxyXG4gICAgICBcInNvdXJjZVwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuc3RyZWFtZXJJbmZvLmFwcElkLFxyXG4gICAgICBcInBhcmFtZXRlcnNcIjoge1xyXG4gICAgICAgIFwia2V5c1wiOiBwcmVtYXJrZXREYXRhLnN5bWJvbCxcclxuICAgICAgICBcImZpZWxkc1wiOiBcIjAsMSwyLDMsNCw1XCIsXHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gICAgYm9va0NvbmZpZyA9IHtcclxuICAgICAgXCJzZXJ2aWNlXCI6IFwiTkFTREFRX0JPT0tcIixcclxuICAgICAgXCJyZXF1ZXN0aWRcIjogXCIzXCIsXHJcbiAgICAgIFwiY29tbWFuZFwiOiBcIlNVQlNcIixcclxuICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgIFwic291cmNlXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uYXBwSWQsXHJcbiAgICAgIFwicGFyYW1ldGVyc1wiOiB7XHJcbiAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgIFwiZmllbGRzXCI6IFwiMCwxLDIsM1wiLFxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICAgIHRpbWVTYWxlQ29uZmlnID0ge1xyXG4gICAgICBcInNlcnZpY2VcIjogXCJUSU1FU0FMRV9FUVVJVFlcIixcclxuICAgICAgXCJyZXF1ZXN0aWRcIjogXCI0XCIsXHJcbiAgICAgIFwiY29tbWFuZFwiOiBcIlNVQlNcIixcclxuICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgIFwic291cmNlXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uYXBwSWQsXHJcbiAgICAgIFwicGFyYW1ldGVyc1wiOiB7XHJcbiAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgIFwiZmllbGRzXCI6IFwiMCwxLDIsM1wiLFxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICAgIGxvZ2luUmVxdWVzdCA9IHtcclxuICAgICAgXCJyZXF1ZXN0c1wiOiBbXHJcbiAgICAgICAgYWRtaW5Db25maWcsXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG4gICAgbWFya2V0UmVxdWVzdCA9IHtcclxuICAgICAgXCJyZXF1ZXN0c1wiOiBbXHJcbiAgICAgICAgcXVvdGVDb25maWcsXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG4gICAgYm9va1JlcXVlc3QgPSB7XHJcbiAgICAgIFwicmVxdWVzdHNcIjogW1xyXG4gICAgICAgIGJvb2tDb25maWcsXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG4gICAgdGltZVNhbGVzUmVxdWVzdCA9IHtcclxuICAgICAgXCJyZXF1ZXN0c1wiOiBbXHJcbiAgICAgICAgdGltZVNhbGVDb25maWcsXHJcbiAgICAgIF0sXHJcbiAgICB9O1xyXG5cclxuICAgIHdzVXJpID0gYHdzczovLyR7Z2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby5zdHJlYW1lclNvY2tldFVybH0vd3NgO1xyXG5cclxuICAgIGNvbnN0IHNpZ25hbE9wZW5Qb3NpdGlvbiA9IGF3YWl0IHdhaXRUb1NpZ25hbE9wZW5Qb3NpdGlvbih3c1VyaSwgbG9naW5SZXF1ZXN0LCBib29rUmVxdWVzdCwgdGltZVNhbGVzUmVxdWVzdCwgcG9zaXRpb25TZXR1cCwgb3B0aW9uU2VsZWN0aW9uLCBidWRnZXQsIGFjY291bnRJZCwgdG9rZW4uYWNjZXNzX3Rva2VuKTtcclxuXHJcbiAgICB0b2tlbiA9IHtcclxuICAgICAgYWNjZXNzX3Rva2VuOiBudWxsLFxyXG4gICAgICByZWZyZXNoX3Rva2VuOiBudWxsLFxyXG4gICAgICBhY2Nlc3NfdG9rZW5fZXhwaXJlc19hdDogbnVsbCxcclxuICAgICAgcmVmcmVzaF90b2tlbl9leHBpcmVzX2F0OiBudWxsLFxyXG4gICAgICBsb2dnZWRfaW46IG51bGwsXHJcbiAgICAgIGFjY2Vzc190b2tlbl9leHBpcmVzX2F0X2RhdGU6IG51bGwsXHJcbiAgICAgIHJlZnJlc2hfdG9rZW5fZXhwaXJlc19hdF9kYXRlOiBudWxsXHJcbiAgICB9O1xyXG5cclxuICAgIGdldHRpbmdVc2VyUHJpbmNpcGxlcyA9IHtcclxuICAgICAgdXNlclByaW5jaXBsZXM6IG51bGwsXHJcbiAgICAgIHBhcmFtczogbnVsbCxcclxuICAgIH07XHJcblxyXG4gICAgaWYgKHNpZ25hbE9wZW5Qb3NpdGlvbi5wb3NpdGlvbikge1xyXG4gICAgICBjb25zdCBxdWFudGl0eSA9IGF3YWl0IGNoZWNrSWZQb3NpdGlvbkZpbGxlZChzaWduYWxPcGVuUG9zaXRpb24ucG9zaXRpb24sIGFjY291bnRJZCwgdG9rZW4uYWNjZXNzX3Rva2VuKTtcclxuICAgICAgY29uc3Qgb3B0aW9uU3ltYm9sID0gYXdhaXQgZ2V0T3B0aW9uU3ltYm9sKHNpZ25hbE9wZW5Qb3NpdGlvbi5wb3NpdGlvbiwgYWNjb3VudElkLCB0b2tlbi5hY2Nlc3NfdG9rZW4pO1xyXG5cclxuICAgICAgd2hpbGUgKGdldHRpbmdVc2VyUHJpbmNpcGxlcy5wYXJhbXMgPT09IG51bGwpIHtcclxuICAgICAgICB0b2tlbiA9IGF3YWl0IGdldExvZ2luQ3JlZGVudGlhbHMoY2xpZW50SWQpO1xyXG4gICAgICAgIGdldHRpbmdVc2VyUHJpbmNpcGxlcyA9IGF3YWl0IGdldFVzZXJQcmluY2lwbGVzKHRva2VuLmFjY2Vzc190b2tlbik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhcmFtcyA9IGdldHRpbmdVc2VyUHJpbmNpcGxlcy5wYXJhbXM7XHJcbiAgICAgIGFkbWluQ29uZmlnID0ge1xyXG4gICAgICAgIFwic2VydmljZVwiOiBcIkFETUlOXCIsXHJcbiAgICAgICAgXCJjb21tYW5kXCI6IFwiTE9HSU5cIixcclxuICAgICAgICBcInJlcXVlc3RpZFwiOiBcIjBcIixcclxuICAgICAgICBcImFjY291bnRcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLmFjY291bnRzWzBdLmFjY291bnRJZCxcclxuICAgICAgICBcInNvdXJjZVwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuc3RyZWFtZXJJbmZvLmFwcElkLFxyXG4gICAgICAgIFwicGFyYW1ldGVyc1wiOiB7XHJcbiAgICAgICAgICBcImNyZWRlbnRpYWxcIjogcGFyYW1zLFxyXG4gICAgICAgICAgXCJ0b2tlblwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuc3RyZWFtZXJJbmZvLnRva2VuLFxyXG4gICAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMS4wXCIsXHJcbiAgICAgICAgICBcInFvc2xldmVsXCI6IFwiMFwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgICAgcXVvdGVDb25maWcgPSB7XHJcbiAgICAgICAgXCJzZXJ2aWNlXCI6IFwiUVVPVEVcIixcclxuICAgICAgICBcInJlcXVlc3RpZFwiOiBcIjFcIixcclxuICAgICAgICBcImNvbW1hbmRcIjogXCJTVUJTXCIsXHJcbiAgICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgICAgXCJzb3VyY2VcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby5hcHBJZCxcclxuICAgICAgICBcInBhcmFtZXRlcnNcIjoge1xyXG4gICAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgICAgXCJmaWVsZHNcIjogXCIwLDEsMiwzLDQsNVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICAgIGJvb2tDb25maWcgPSB7XHJcbiAgICAgICAgXCJzZXJ2aWNlXCI6IFwiTkFTREFRX0JPT0tcIixcclxuICAgICAgICBcInJlcXVlc3RpZFwiOiBcIjNcIixcclxuICAgICAgICBcImNvbW1hbmRcIjogXCJTVUJTXCIsXHJcbiAgICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgICAgXCJzb3VyY2VcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby5hcHBJZCxcclxuICAgICAgICBcInBhcmFtZXRlcnNcIjoge1xyXG4gICAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgICAgXCJmaWVsZHNcIjogXCIwLDEsMiwzXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgICAgdGltZVNhbGVDb25maWcgPSB7XHJcbiAgICAgICAgXCJzZXJ2aWNlXCI6IFwiVElNRVNBTEVfRVFVSVRZXCIsXHJcbiAgICAgICAgXCJyZXF1ZXN0aWRcIjogXCI0XCIsXHJcbiAgICAgICAgXCJjb21tYW5kXCI6IFwiU1VCU1wiLFxyXG4gICAgICAgIFwiYWNjb3VudFwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuYWNjb3VudHNbMF0uYWNjb3VudElkLFxyXG4gICAgICAgIFwic291cmNlXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uYXBwSWQsXHJcbiAgICAgICAgXCJwYXJhbWV0ZXJzXCI6IHtcclxuICAgICAgICAgIFwia2V5c1wiOiBwcmVtYXJrZXREYXRhLnN5bWJvbCxcclxuICAgICAgICAgIFwiZmllbGRzXCI6IFwiMCwxLDIsM1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICAgIGxvZ2luUmVxdWVzdCA9IHtcclxuICAgICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICAgIGFkbWluQ29uZmlnLFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH07XHJcbiAgICAgIG1hcmtldFJlcXVlc3QgPSB7XHJcbiAgICAgICAgXCJyZXF1ZXN0c1wiOiBbXHJcbiAgICAgICAgICBxdW90ZUNvbmZpZyxcclxuICAgICAgICBdLFxyXG4gICAgICB9O1xyXG4gICAgICBib29rUmVxdWVzdCA9IHtcclxuICAgICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICAgIGJvb2tDb25maWcsXHJcbiAgICAgICAgXSxcclxuICAgICAgfTtcclxuICAgICAgdGltZVNhbGVzUmVxdWVzdCA9IHtcclxuICAgICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICAgIHRpbWVTYWxlQ29uZmlnLFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB3c1VyaSA9IGB3c3M6Ly8ke2dldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uc3RyZWFtZXJTb2NrZXRVcmx9L3dzYDtcclxuXHJcbiAgICAgIGNvbnN0IGN1dEZpbGxlZCA9IGF3YWl0IHdhaXRUb1NpZ25hbEN1dFBvc2l0aW9uKHdzVXJpLCBsb2dpblJlcXVlc3QsIGJvb2tSZXF1ZXN0LCB0aW1lU2FsZXNSZXF1ZXN0LCBvcHRpb25TeW1ib2wsIHF1YW50aXR5LCBzaWduYWxPcGVuUG9zaXRpb24uZGVtYW5kT3JTdXBwbHksIHBvc2l0aW9uU2V0dXAsIGFjY291bnRJZCwgdG9rZW4uYWNjZXNzX3Rva2VuKTtcclxuICAgICAgY29uc3QgcmVtYWluaW5nUXVhbnRpdHkgPSBxdWFudGl0eSAtIGN1dEZpbGxlZFxyXG5cclxuICAgICAgdG9rZW4gPSB7XHJcbiAgICAgICAgYWNjZXNzX3Rva2VuOiBudWxsLFxyXG4gICAgICAgIHJlZnJlc2hfdG9rZW46IG51bGwsXHJcbiAgICAgICAgYWNjZXNzX3Rva2VuX2V4cGlyZXNfYXQ6IG51bGwsXHJcbiAgICAgICAgcmVmcmVzaF90b2tlbl9leHBpcmVzX2F0OiBudWxsLFxyXG4gICAgICAgIGxvZ2dlZF9pbjogbnVsbCxcclxuICAgICAgICBhY2Nlc3NfdG9rZW5fZXhwaXJlc19hdF9kYXRlOiBudWxsLFxyXG4gICAgICAgIHJlZnJlc2hfdG9rZW5fZXhwaXJlc19hdF9kYXRlOiBudWxsXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBnZXR0aW5nVXNlclByaW5jaXBsZXMgPSB7XHJcbiAgICAgICAgdXNlclByaW5jaXBsZXM6IG51bGwsXHJcbiAgICAgICAgcGFyYW1zOiBudWxsLFxyXG4gICAgICB9O1xyXG5cclxuICAgICAgd2hpbGUgKGdldHRpbmdVc2VyUHJpbmNpcGxlcy5wYXJhbXMgPT09IG51bGwpIHtcclxuICAgICAgICB0b2tlbiA9IGF3YWl0IGdldExvZ2luQ3JlZGVudGlhbHMoY2xpZW50SWQpO1xyXG4gICAgICAgIGdldHRpbmdVc2VyUHJpbmNpcGxlcyA9IGF3YWl0IGdldFVzZXJQcmluY2lwbGVzKHRva2VuLmFjY2Vzc190b2tlbik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBhcmFtcyA9IGdldHRpbmdVc2VyUHJpbmNpcGxlcy5wYXJhbXM7XHJcbiAgICAgIGFkbWluQ29uZmlnID0ge1xyXG4gICAgICAgIFwic2VydmljZVwiOiBcIkFETUlOXCIsXHJcbiAgICAgICAgXCJjb21tYW5kXCI6IFwiTE9HSU5cIixcclxuICAgICAgICBcInJlcXVlc3RpZFwiOiBcIjBcIixcclxuICAgICAgICBcImFjY291bnRcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLmFjY291bnRzWzBdLmFjY291bnRJZCxcclxuICAgICAgICBcInNvdXJjZVwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuc3RyZWFtZXJJbmZvLmFwcElkLFxyXG4gICAgICAgIFwicGFyYW1ldGVyc1wiOiB7XHJcbiAgICAgICAgICBcImNyZWRlbnRpYWxcIjogcGFyYW1zLFxyXG4gICAgICAgICAgXCJ0b2tlblwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuc3RyZWFtZXJJbmZvLnRva2VuLFxyXG4gICAgICAgICAgXCJ2ZXJzaW9uXCI6IFwiMS4wXCIsXHJcbiAgICAgICAgICBcInFvc2xldmVsXCI6IFwiMFwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgICAgcXVvdGVDb25maWcgPSB7XHJcbiAgICAgICAgXCJzZXJ2aWNlXCI6IFwiUVVPVEVcIixcclxuICAgICAgICBcInJlcXVlc3RpZFwiOiBcIjFcIixcclxuICAgICAgICBcImNvbW1hbmRcIjogXCJTVUJTXCIsXHJcbiAgICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgICAgXCJzb3VyY2VcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby5hcHBJZCxcclxuICAgICAgICBcInBhcmFtZXRlcnNcIjoge1xyXG4gICAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgICAgXCJmaWVsZHNcIjogXCIwLDEsMiwzLDQsNVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICAgIGJvb2tDb25maWcgPSB7XHJcbiAgICAgICAgXCJzZXJ2aWNlXCI6IFwiTkFTREFRX0JPT0tcIixcclxuICAgICAgICBcInJlcXVlc3RpZFwiOiBcIjNcIixcclxuICAgICAgICBcImNvbW1hbmRcIjogXCJTVUJTXCIsXHJcbiAgICAgICAgXCJhY2NvdW50XCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5hY2NvdW50c1swXS5hY2NvdW50SWQsXHJcbiAgICAgICAgXCJzb3VyY2VcIjogZ2V0dGluZ1VzZXJQcmluY2lwbGVzLnVzZXJQcmluY2lwbGVzLnN0cmVhbWVySW5mby5hcHBJZCxcclxuICAgICAgICBcInBhcmFtZXRlcnNcIjoge1xyXG4gICAgICAgICAgXCJrZXlzXCI6IHByZW1hcmtldERhdGEuc3ltYm9sLFxyXG4gICAgICAgICAgXCJmaWVsZHNcIjogXCIwLDEsMiwzXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgfTtcclxuICAgICAgdGltZVNhbGVDb25maWcgPSB7XHJcbiAgICAgICAgXCJzZXJ2aWNlXCI6IFwiVElNRVNBTEVfRVFVSVRZXCIsXHJcbiAgICAgICAgXCJyZXF1ZXN0aWRcIjogXCI0XCIsXHJcbiAgICAgICAgXCJjb21tYW5kXCI6IFwiU1VCU1wiLFxyXG4gICAgICAgIFwiYWNjb3VudFwiOiBnZXR0aW5nVXNlclByaW5jaXBsZXMudXNlclByaW5jaXBsZXMuYWNjb3VudHNbMF0uYWNjb3VudElkLFxyXG4gICAgICAgIFwic291cmNlXCI6IGdldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uYXBwSWQsXHJcbiAgICAgICAgXCJwYXJhbWV0ZXJzXCI6IHtcclxuICAgICAgICAgIFwia2V5c1wiOiBwcmVtYXJrZXREYXRhLnN5bWJvbCxcclxuICAgICAgICAgIFwiZmllbGRzXCI6IFwiMCwxLDIsM1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH07XHJcbiAgICAgIGxvZ2luUmVxdWVzdCA9IHtcclxuICAgICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICAgIGFkbWluQ29uZmlnLFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH07XHJcbiAgICAgIG1hcmtldFJlcXVlc3QgPSB7XHJcbiAgICAgICAgXCJyZXF1ZXN0c1wiOiBbXHJcbiAgICAgICAgICBxdW90ZUNvbmZpZyxcclxuICAgICAgICBdLFxyXG4gICAgICB9O1xyXG4gICAgICBib29rUmVxdWVzdCA9IHtcclxuICAgICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICAgIGJvb2tDb25maWcsXHJcbiAgICAgICAgXSxcclxuICAgICAgfTtcclxuICAgICAgdGltZVNhbGVzUmVxdWVzdCA9IHtcclxuICAgICAgICBcInJlcXVlc3RzXCI6IFtcclxuICAgICAgICAgIHRpbWVTYWxlQ29uZmlnLFxyXG4gICAgICAgIF0sXHJcbiAgICAgIH07XHJcblxyXG4gICAgICB3c1VyaSA9IGB3c3M6Ly8ke2dldHRpbmdVc2VyUHJpbmNpcGxlcy51c2VyUHJpbmNpcGxlcy5zdHJlYW1lckluZm8uc3RyZWFtZXJTb2NrZXRVcmx9L3dzYDtcclxuXHJcbiAgICAgIGNvbnN0IHNpZ25hbENsb3NlUG9zaXRpb24gPSBhd2FpdCB3YWl0VG9TaWduYWxDbG9zZVBvc2l0aW9uKHdzVXJpLCBsb2dpblJlcXVlc3QsIGJvb2tSZXF1ZXN0LCB0aW1lU2FsZXNSZXF1ZXN0LCBvcHRpb25TeW1ib2wsIHJlbWFpbmluZ1F1YW50aXR5LCBzaWduYWxPcGVuUG9zaXRpb24uZGVtYW5kT3JTdXBwbHksIHBvc2l0aW9uU2V0dXAsIGFjY291bnRJZCwgdG9rZW4uYWNjZXNzX3Rva2VuKTtcclxuXHJcbiAgICAgIHJldHVybiBzaWduYWxDbG9zZVBvc2l0aW9uLm9yZGVySWQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gJ05PR09PRFBPU0lUSU9OUyc7XHJcbiAgICB9XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiAnTUFSS0VUQ0xPU0VEJztcclxuICB9XHJcbn0iLCIvKiAoaWdub3JlZCkgKi8iLCIvKiAoaWdub3JlZCkgKi8iLCIvLyBHRU5FUkFURUQgRklMRS4gRE8gTk9UIEVESVQuXG52YXIgTG9uZyA9IChmdW5jdGlvbihleHBvcnRzKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuICBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gICAgdmFsdWU6IHRydWVcbiAgfSk7XG4gIGV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcbiAgXG4gIC8qKlxuICAgKiBAbGljZW5zZVxuICAgKiBDb3B5cmlnaHQgMjAwOSBUaGUgQ2xvc3VyZSBMaWJyYXJ5IEF1dGhvcnNcbiAgICogQ29weXJpZ2h0IDIwMjAgRGFuaWVsIFdpcnR6IC8gVGhlIGxvbmcuanMgQXV0aG9ycy5cbiAgICpcbiAgICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAgICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICAgKiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2YgdGhlIExpY2Vuc2UgYXRcbiAgICpcbiAgICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICAgKlxuICAgKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gICAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gICAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAgICogbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG4gICAqXG4gICAqIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBBcGFjaGUtMi4wXG4gICAqL1xuICAvLyBXZWJBc3NlbWJseSBvcHRpbWl6YXRpb25zIHRvIGRvIG5hdGl2ZSBpNjQgbXVsdGlwbGljYXRpb24gYW5kIGRpdmlkZVxuICB2YXIgd2FzbSA9IG51bGw7XG4gIFxuICB0cnkge1xuICAgIHdhc20gPSBuZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UobmV3IFdlYkFzc2VtYmx5Lk1vZHVsZShuZXcgVWludDhBcnJheShbMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCAxMywgMiwgOTYsIDAsIDEsIDEyNywgOTYsIDQsIDEyNywgMTI3LCAxMjcsIDEyNywgMSwgMTI3LCAzLCA3LCA2LCAwLCAxLCAxLCAxLCAxLCAxLCA2LCA2LCAxLCAxMjcsIDEsIDY1LCAwLCAxMSwgNywgNTAsIDYsIDMsIDEwOSwgMTE3LCAxMDgsIDAsIDEsIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTUsIDAsIDIsIDUsIDEwMCwgMTA1LCAxMTgsIDk1LCAxMTcsIDAsIDMsIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTUsIDAsIDQsIDUsIDExNCwgMTAxLCAxMDksIDk1LCAxMTcsIDAsIDUsIDgsIDEwMywgMTAxLCAxMTYsIDk1LCAxMDQsIDEwNSwgMTAzLCAxMDQsIDAsIDAsIDEwLCAxOTEsIDEsIDYsIDQsIDAsIDM1LCAwLCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI2LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjcsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyOCwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI5LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMzAsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTFdKSksIHt9KS5leHBvcnRzO1xuICB9IGNhdGNoIChlKSB7Ly8gbm8gd2FzbSBzdXBwb3J0IDooXG4gIH1cbiAgLyoqXG4gICAqIENvbnN0cnVjdHMgYSA2NCBiaXQgdHdvJ3MtY29tcGxlbWVudCBpbnRlZ2VyLCBnaXZlbiBpdHMgbG93IGFuZCBoaWdoIDMyIGJpdCB2YWx1ZXMgYXMgKnNpZ25lZCogaW50ZWdlcnMuXG4gICAqICBTZWUgdGhlIGZyb20qIGZ1bmN0aW9ucyBiZWxvdyBmb3IgbW9yZSBjb252ZW5pZW50IHdheXMgb2YgY29uc3RydWN0aW5nIExvbmdzLlxuICAgKiBAZXhwb3J0cyBMb25nXG4gICAqIEBjbGFzcyBBIExvbmcgY2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIDY0IGJpdCB0d28ncy1jb21wbGVtZW50IGludGVnZXIgdmFsdWUuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3cgVGhlIGxvdyAoc2lnbmVkKSAzMiBiaXRzIG9mIHRoZSBsb25nXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoIFRoZSBoaWdoIChzaWduZWQpIDMyIGJpdHMgb2YgdGhlIGxvbmdcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAY29uc3RydWN0b3JcbiAgICovXG4gIFxuICBcbiAgZnVuY3Rpb24gTG9uZyhsb3csIGhpZ2gsIHVuc2lnbmVkKSB7XG4gICAgLyoqXG4gICAgICogVGhlIGxvdyAzMiBiaXRzIGFzIGEgc2lnbmVkIHZhbHVlLlxuICAgICAqIEB0eXBlIHtudW1iZXJ9XG4gICAgICovXG4gICAgdGhpcy5sb3cgPSBsb3cgfCAwO1xuICAgIC8qKlxuICAgICAqIFRoZSBoaWdoIDMyIGJpdHMgYXMgYSBzaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgXG4gICAgdGhpcy5oaWdoID0gaGlnaCB8IDA7XG4gICAgLyoqXG4gICAgICogV2hldGhlciB1bnNpZ25lZCBvciBub3QuXG4gICAgICogQHR5cGUge2Jvb2xlYW59XG4gICAgICovXG4gIFxuICAgIHRoaXMudW5zaWduZWQgPSAhIXVuc2lnbmVkO1xuICB9IC8vIFRoZSBpbnRlcm5hbCByZXByZXNlbnRhdGlvbiBvZiBhIGxvbmcgaXMgdGhlIHR3byBnaXZlbiBzaWduZWQsIDMyLWJpdCB2YWx1ZXMuXG4gIC8vIFdlIHVzZSAzMi1iaXQgcGllY2VzIGJlY2F1c2UgdGhlc2UgYXJlIHRoZSBzaXplIG9mIGludGVnZXJzIG9uIHdoaWNoXG4gIC8vIEphdmFzY3JpcHQgcGVyZm9ybXMgYml0LW9wZXJhdGlvbnMuICBGb3Igb3BlcmF0aW9ucyBsaWtlIGFkZGl0aW9uIGFuZFxuICAvLyBtdWx0aXBsaWNhdGlvbiwgd2Ugc3BsaXQgZWFjaCBudW1iZXIgaW50byAxNiBiaXQgcGllY2VzLCB3aGljaCBjYW4gZWFzaWx5IGJlXG4gIC8vIG11bHRpcGxpZWQgd2l0aGluIEphdmFzY3JpcHQncyBmbG9hdGluZy1wb2ludCByZXByZXNlbnRhdGlvbiB3aXRob3V0IG92ZXJmbG93XG4gIC8vIG9yIGNoYW5nZSBpbiBzaWduLlxuICAvL1xuICAvLyBJbiB0aGUgYWxnb3JpdGhtcyBiZWxvdywgd2UgZnJlcXVlbnRseSByZWR1Y2UgdGhlIG5lZ2F0aXZlIGNhc2UgdG8gdGhlXG4gIC8vIHBvc2l0aXZlIGNhc2UgYnkgbmVnYXRpbmcgdGhlIGlucHV0KHMpIGFuZCB0aGVuIHBvc3QtcHJvY2Vzc2luZyB0aGUgcmVzdWx0LlxuICAvLyBOb3RlIHRoYXQgd2UgbXVzdCBBTFdBWVMgY2hlY2sgc3BlY2lhbGx5IHdoZXRoZXIgdGhvc2UgdmFsdWVzIGFyZSBNSU5fVkFMVUVcbiAgLy8gKC0yXjYzKSBiZWNhdXNlIC1NSU5fVkFMVUUgPT0gTUlOX1ZBTFVFIChzaW5jZSAyXjYzIGNhbm5vdCBiZSByZXByZXNlbnRlZCBhc1xuICAvLyBhIHBvc2l0aXZlIG51bWJlciwgaXQgb3ZlcmZsb3dzIGJhY2sgaW50byBhIG5lZ2F0aXZlKS4gIE5vdCBoYW5kbGluZyB0aGlzXG4gIC8vIGNhc2Ugd291bGQgb2Z0ZW4gcmVzdWx0IGluIGluZmluaXRlIHJlY3Vyc2lvbi5cbiAgLy9cbiAgLy8gQ29tbW9uIGNvbnN0YW50IHZhbHVlcyBaRVJPLCBPTkUsIE5FR19PTkUsIGV0Yy4gYXJlIGRlZmluZWQgYmVsb3cgdGhlIGZyb20qXG4gIC8vIG1ldGhvZHMgb24gd2hpY2ggdGhleSBkZXBlbmQuXG4gIFxuICAvKipcbiAgICogQW4gaW5kaWNhdG9yIHVzZWQgdG8gcmVsaWFibHkgZGV0ZXJtaW5lIGlmIGFuIG9iamVjdCBpcyBhIExvbmcgb3Igbm90LlxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGNvbnN0XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBcbiAgXG4gIExvbmcucHJvdG90eXBlLl9faXNMb25nX187XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShMb25nLnByb3RvdHlwZSwgXCJfX2lzTG9uZ19fXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9KTtcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGlzTG9uZyhvYmopIHtcbiAgICByZXR1cm4gKG9iaiAmJiBvYmpbXCJfX2lzTG9uZ19fXCJdKSA9PT0gdHJ1ZTtcbiAgfVxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gdmFsdWUgbnVtYmVyXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIFxuICBmdW5jdGlvbiBjdHozMih2YWx1ZSkge1xuICAgIHZhciBjID0gTWF0aC5jbHozMih2YWx1ZSAmIC12YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlID8gMzEgLSBjIDogYztcbiAgfVxuICAvKipcbiAgICogVGVzdHMgaWYgdGhlIHNwZWNpZmllZCBvYmplY3QgaXMgYSBMb25nLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSBvYmogT2JqZWN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmlzTG9uZyA9IGlzTG9uZztcbiAgLyoqXG4gICAqIEEgY2FjaGUgb2YgdGhlIExvbmcgcmVwcmVzZW50YXRpb25zIG9mIHNtYWxsIGludGVnZXIgdmFsdWVzLlxuICAgKiBAdHlwZSB7IU9iamVjdH1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIElOVF9DQUNIRSA9IHt9O1xuICAvKipcbiAgICogQSBjYWNoZSBvZiB0aGUgTG9uZyByZXByZXNlbnRhdGlvbnMgb2Ygc21hbGwgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuXG4gICAqIEB0eXBlIHshT2JqZWN0fVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVUlOVF9DQUNIRSA9IHt9O1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbUludCh2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICB2YXIgb2JqLCBjYWNoZWRPYmosIGNhY2hlO1xuICBcbiAgICBpZiAodW5zaWduZWQpIHtcbiAgICAgIHZhbHVlID4+Pj0gMDtcbiAgXG4gICAgICBpZiAoY2FjaGUgPSAwIDw9IHZhbHVlICYmIHZhbHVlIDwgMjU2KSB7XG4gICAgICAgIGNhY2hlZE9iaiA9IFVJTlRfQ0FDSEVbdmFsdWVdO1xuICAgICAgICBpZiAoY2FjaGVkT2JqKSByZXR1cm4gY2FjaGVkT2JqO1xuICAgICAgfVxuICBcbiAgICAgIG9iaiA9IGZyb21CaXRzKHZhbHVlLCAwLCB0cnVlKTtcbiAgICAgIGlmIChjYWNoZSkgVUlOVF9DQUNIRVt2YWx1ZV0gPSBvYmo7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSB8PSAwO1xuICBcbiAgICAgIGlmIChjYWNoZSA9IC0xMjggPD0gdmFsdWUgJiYgdmFsdWUgPCAxMjgpIHtcbiAgICAgICAgY2FjaGVkT2JqID0gSU5UX0NBQ0hFW3ZhbHVlXTtcbiAgICAgICAgaWYgKGNhY2hlZE9iaikgcmV0dXJuIGNhY2hlZE9iajtcbiAgICAgIH1cbiAgXG4gICAgICBvYmogPSBmcm9tQml0cyh2YWx1ZSwgdmFsdWUgPCAwID8gLTEgOiAwLCBmYWxzZSk7XG4gICAgICBpZiAoY2FjaGUpIElOVF9DQUNIRVt2YWx1ZV0gPSBvYmo7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH1cbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiAzMiBiaXQgaW50ZWdlciB2YWx1ZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgMzIgYml0IGludGVnZXIgaW4gcXVlc3Rpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tSW50ID0gZnJvbUludDtcbiAgLyoqXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21OdW1iZXIodmFsdWUsIHVuc2lnbmVkKSB7XG4gICAgaWYgKGlzTmFOKHZhbHVlKSkgcmV0dXJuIHVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICBcbiAgICBpZiAodW5zaWduZWQpIHtcbiAgICAgIGlmICh2YWx1ZSA8IDApIHJldHVybiBVWkVSTztcbiAgICAgIGlmICh2YWx1ZSA+PSBUV09fUFdSXzY0X0RCTCkgcmV0dXJuIE1BWF9VTlNJR05FRF9WQUxVRTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZhbHVlIDw9IC1UV09fUFdSXzYzX0RCTCkgcmV0dXJuIE1JTl9WQUxVRTtcbiAgICAgIGlmICh2YWx1ZSArIDEgPj0gVFdPX1BXUl82M19EQkwpIHJldHVybiBNQVhfVkFMVUU7XG4gICAgfVxuICBcbiAgICBpZiAodmFsdWUgPCAwKSByZXR1cm4gZnJvbU51bWJlcigtdmFsdWUsIHVuc2lnbmVkKS5uZWcoKTtcbiAgICByZXR1cm4gZnJvbUJpdHModmFsdWUgJSBUV09fUFdSXzMyX0RCTCB8IDAsIHZhbHVlIC8gVFdPX1BXUl8zMl9EQkwgfCAwLCB1bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgZ2l2ZW4gdmFsdWUsIHByb3ZpZGVkIHRoYXQgaXQgaXMgYSBmaW5pdGUgbnVtYmVyLiBPdGhlcndpc2UsIHplcm8gaXMgcmV0dXJuZWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgVGhlIG51bWJlciBpbiBxdWVzdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21OdW1iZXIgPSBmcm9tTnVtYmVyO1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvd0JpdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2hCaXRzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbUJpdHMobG93Qml0cywgaGlnaEJpdHMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGxvd0JpdHMsIGhpZ2hCaXRzLCB1bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIFJldHVybnMgYSBMb25nIHJlcHJlc2VudGluZyB0aGUgNjQgYml0IGludGVnZXIgdGhhdCBjb21lcyBieSBjb25jYXRlbmF0aW5nIHRoZSBnaXZlbiBsb3cgYW5kIGhpZ2ggYml0cy4gRWFjaCBpc1xuICAgKiAgYXNzdW1lZCB0byB1c2UgMzIgYml0cy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsb3dCaXRzIFRoZSBsb3cgMzIgYml0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaEJpdHMgVGhlIGhpZ2ggMzIgYml0c1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CaXRzID0gZnJvbUJpdHM7XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGJhc2VcbiAgICogQHBhcmFtIHtudW1iZXJ9IGV4cG9uZW50XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBwb3dfZGJsID0gTWF0aC5wb3c7IC8vIFVzZWQgNCB0aW1lcyAoNCo4IHRvIDE1KzQpXG4gIFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcik9fSB1bnNpZ25lZFxuICAgKiBAcGFyYW0ge251bWJlcj19IHJhZGl4XG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbVN0cmluZyhzdHIsIHVuc2lnbmVkLCByYWRpeCkge1xuICAgIGlmIChzdHIubGVuZ3RoID09PSAwKSB0aHJvdyBFcnJvcignZW1wdHkgc3RyaW5nJyk7XG4gIFxuICAgIGlmICh0eXBlb2YgdW5zaWduZWQgPT09ICdudW1iZXInKSB7XG4gICAgICAvLyBGb3IgZ29vZy5tYXRoLmxvbmcgY29tcGF0aWJpbGl0eVxuICAgICAgcmFkaXggPSB1bnNpZ25lZDtcbiAgICAgIHVuc2lnbmVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuc2lnbmVkID0gISF1bnNpZ25lZDtcbiAgICB9XG4gIFxuICAgIGlmIChzdHIgPT09IFwiTmFOXCIgfHwgc3RyID09PSBcIkluZmluaXR5XCIgfHwgc3RyID09PSBcIitJbmZpbml0eVwiIHx8IHN0ciA9PT0gXCItSW5maW5pdHlcIikgcmV0dXJuIHVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIHJhZGl4ID0gcmFkaXggfHwgMTA7XG4gICAgaWYgKHJhZGl4IDwgMiB8fCAzNiA8IHJhZGl4KSB0aHJvdyBSYW5nZUVycm9yKCdyYWRpeCcpO1xuICAgIHZhciBwO1xuICAgIGlmICgocCA9IHN0ci5pbmRleE9mKCctJykpID4gMCkgdGhyb3cgRXJyb3IoJ2ludGVyaW9yIGh5cGhlbicpO2Vsc2UgaWYgKHAgPT09IDApIHtcbiAgICAgIHJldHVybiBmcm9tU3RyaW5nKHN0ci5zdWJzdHJpbmcoMSksIHVuc2lnbmVkLCByYWRpeCkubmVnKCk7XG4gICAgfSAvLyBEbyBzZXZlcmFsICg4KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgLy8gbWluaW1pemUgdGhlIGNhbGxzIHRvIHRoZSB2ZXJ5IGV4cGVuc2l2ZSBlbXVsYXRlZCBkaXYuXG4gIFxuICAgIHZhciByYWRpeFRvUG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIDgpKTtcbiAgICB2YXIgcmVzdWx0ID0gWkVSTztcbiAgXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpICs9IDgpIHtcbiAgICAgIHZhciBzaXplID0gTWF0aC5taW4oOCwgc3RyLmxlbmd0aCAtIGkpLFxuICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnQoc3RyLnN1YnN0cmluZyhpLCBpICsgc2l6ZSksIHJhZGl4KTtcbiAgXG4gICAgICBpZiAoc2l6ZSA8IDgpIHtcbiAgICAgICAgdmFyIHBvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCBzaXplKSk7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWwocG93ZXIpLmFkZChmcm9tTnVtYmVyKHZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSByZXN1bHQubXVsKHJhZGl4VG9Qb3dlcik7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5hZGQoZnJvbU51bWJlcih2YWx1ZSkpO1xuICAgICAgfVxuICAgIH1cbiAgXG4gICAgcmVzdWx0LnVuc2lnbmVkID0gdW5zaWduZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdpdmVuIHN0cmluZywgd3JpdHRlbiB1c2luZyB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtzdHJpbmd9IHN0ciBUaGUgdGV4dHVhbCByZXByZXNlbnRhdGlvbiBvZiB0aGUgTG9uZ1xuICAgKiBAcGFyYW0geyhib29sZWFufG51bWJlcik9fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXggVGhlIHJhZGl4IGluIHdoaWNoIHRoZSB0ZXh0IGlzIHdyaXR0ZW4gKDItMzYpLCBkZWZhdWx0cyB0byAxMFxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tU3RyaW5nID0gZnJvbVN0cmluZztcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd8IXtsb3c6IG51bWJlciwgaGlnaDogbnVtYmVyLCB1bnNpZ25lZDogYm9vbGVhbn19IHZhbFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIGZ1bmN0aW9uIGZyb21WYWx1ZSh2YWwsIHVuc2lnbmVkKSB7XG4gICAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSByZXR1cm4gZnJvbU51bWJlcih2YWwsIHVuc2lnbmVkKTtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHJldHVybiBmcm9tU3RyaW5nKHZhbCwgdW5zaWduZWQpOyAvLyBUaHJvd3MgZm9yIG5vbi1vYmplY3RzLCBjb252ZXJ0cyBub24taW5zdGFuY2VvZiBMb25nOlxuICBcbiAgICByZXR1cm4gZnJvbUJpdHModmFsLmxvdywgdmFsLmhpZ2gsIHR5cGVvZiB1bnNpZ25lZCA9PT0gJ2Jvb2xlYW4nID8gdW5zaWduZWQgOiB2YWwudW5zaWduZWQpO1xuICB9XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgc3BlY2lmaWVkIHZhbHVlIHRvIGEgTG9uZyB1c2luZyB0aGUgYXBwcm9wcmlhdGUgZnJvbSogZnVuY3Rpb24gZm9yIGl0cyB0eXBlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfCF7bG93OiBudW1iZXIsIGhpZ2g6IG51bWJlciwgdW5zaWduZWQ6IGJvb2xlYW59fSB2YWwgVmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbVZhbHVlID0gZnJvbVZhbHVlOyAvLyBOT1RFOiB0aGUgY29tcGlsZXIgc2hvdWxkIGlubGluZSB0aGVzZSBjb25zdGFudCB2YWx1ZXMgYmVsb3cgYW5kIHRoZW4gcmVtb3ZlIHRoZXNlIHZhcmlhYmxlcywgc28gdGhlcmUgc2hvdWxkIGJlXG4gIC8vIG5vIHJ1bnRpbWUgcGVuYWx0eSBmb3IgdGhlc2UuXG4gIFxuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzE2X0RCTCA9IDEgPDwgMTY7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMjRfREJMID0gMSA8PCAyNDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8zMl9EQkwgPSBUV09fUFdSXzE2X0RCTCAqIFRXT19QV1JfMTZfREJMO1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzY0X0RCTCA9IFRXT19QV1JfMzJfREJMICogVFdPX1BXUl8zMl9EQkw7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfNjNfREJMID0gVFdPX1BXUl82NF9EQkwgLyAyO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMjQgPSBmcm9tSW50KFRXT19QV1JfMjRfREJMKTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFpFUk8gPSBmcm9tSW50KDApO1xuICAvKipcbiAgICogU2lnbmVkIHplcm8uXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLlpFUk8gPSBaRVJPO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVVpFUk8gPSBmcm9tSW50KDAsIHRydWUpO1xuICAvKipcbiAgICogVW5zaWduZWQgemVyby5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuVVpFUk8gPSBVWkVSTztcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE9ORSA9IGZyb21JbnQoMSk7XG4gIC8qKlxuICAgKiBTaWduZWQgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5PTkUgPSBPTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVT05FID0gZnJvbUludCgxLCB0cnVlKTtcbiAgLyoqXG4gICAqIFVuc2lnbmVkIG9uZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuVU9ORSA9IFVPTkU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBORUdfT05FID0gZnJvbUludCgtMSk7XG4gIC8qKlxuICAgKiBTaWduZWQgbmVnYXRpdmUgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5ORUdfT05FID0gTkVHX09ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1BWF9WQUxVRSA9IGZyb21CaXRzKDB4RkZGRkZGRkYgfCAwLCAweDdGRkZGRkZGIHwgMCwgZmFsc2UpO1xuICAvKipcbiAgICogTWF4aW11bSBzaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1BWF9WQUxVRSA9IE1BWF9WQUxVRTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1BWF9VTlNJR05FRF9WQUxVRSA9IGZyb21CaXRzKDB4RkZGRkZGRkYgfCAwLCAweEZGRkZGRkZGIHwgMCwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBNYXhpbXVtIHVuc2lnbmVkIHZhbHVlLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5NQVhfVU5TSUdORURfVkFMVUUgPSBNQVhfVU5TSUdORURfVkFMVUU7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBNSU5fVkFMVUUgPSBmcm9tQml0cygwLCAweDgwMDAwMDAwIHwgMCwgZmFsc2UpO1xuICAvKipcbiAgICogTWluaW11bSBzaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1JTl9WQUxVRSA9IE1JTl9WQUxVRTtcbiAgLyoqXG4gICAqIEBhbGlhcyBMb25nLnByb3RvdHlwZVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTG9uZ1Byb3RvdHlwZSA9IExvbmcucHJvdG90eXBlO1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSAzMiBiaXQgaW50ZWdlciwgYXNzdW1pbmcgaXQgaXMgYSAzMiBiaXQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUudG9JbnQgPSBmdW5jdGlvbiB0b0ludCgpIHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZCA/IHRoaXMubG93ID4+PiAwIDogdGhpcy5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIHRoZSBuZWFyZXN0IGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgdmFsdWUgKGRvdWJsZSwgNTMgYml0IG1hbnRpc3NhKS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvTnVtYmVyID0gZnVuY3Rpb24gdG9OdW1iZXIoKSB7XG4gICAgaWYgKHRoaXMudW5zaWduZWQpIHJldHVybiAodGhpcy5oaWdoID4+PiAwKSAqIFRXT19QV1JfMzJfREJMICsgKHRoaXMubG93ID4+PiAwKTtcbiAgICByZXR1cm4gdGhpcy5oaWdoICogVFdPX1BXUl8zMl9EQkwgKyAodGhpcy5sb3cgPj4+IDApO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhlIExvbmcgdG8gYSBzdHJpbmcgd3JpdHRlbiBpbiB0aGUgc3BlY2lmaWVkIHJhZGl4LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXggUmFkaXggKDItMzYpLCBkZWZhdWx0cyB0byAxMFxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKiBAb3ZlcnJpZGVcbiAgICogQHRocm93cyB7UmFuZ2VFcnJvcn0gSWYgYHJhZGl4YCBpcyBvdXQgb2YgcmFuZ2VcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKHJhZGl4KSB7XG4gICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICBpZiAocmFkaXggPCAyIHx8IDM2IDwgcmFkaXgpIHRocm93IFJhbmdlRXJyb3IoJ3JhZGl4Jyk7XG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiAnMCc7XG4gIFxuICAgIGlmICh0aGlzLmlzTmVnYXRpdmUoKSkge1xuICAgICAgLy8gVW5zaWduZWQgTG9uZ3MgYXJlIG5ldmVyIG5lZ2F0aXZlXG4gICAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSB7XG4gICAgICAgIC8vIFdlIG5lZWQgdG8gY2hhbmdlIHRoZSBMb25nIHZhbHVlIGJlZm9yZSBpdCBjYW4gYmUgbmVnYXRlZCwgc28gd2UgcmVtb3ZlXG4gICAgICAgIC8vIHRoZSBib3R0b20tbW9zdCBkaWdpdCBpbiB0aGlzIGJhc2UgYW5kIHRoZW4gcmVjdXJzZSB0byBkbyB0aGUgcmVzdC5cbiAgICAgICAgdmFyIHJhZGl4TG9uZyA9IGZyb21OdW1iZXIocmFkaXgpLFxuICAgICAgICAgICAgZGl2ID0gdGhpcy5kaXYocmFkaXhMb25nKSxcbiAgICAgICAgICAgIHJlbTEgPSBkaXYubXVsKHJhZGl4TG9uZykuc3ViKHRoaXMpO1xuICAgICAgICByZXR1cm4gZGl2LnRvU3RyaW5nKHJhZGl4KSArIHJlbTEudG9JbnQoKS50b1N0cmluZyhyYWRpeCk7XG4gICAgICB9IGVsc2UgcmV0dXJuICctJyArIHRoaXMubmVnKCkudG9TdHJpbmcocmFkaXgpO1xuICAgIH0gLy8gRG8gc2V2ZXJhbCAoNikgZGlnaXRzIGVhY2ggdGltZSB0aHJvdWdoIHRoZSBsb29wLCBzbyBhcyB0b1xuICAgIC8vIG1pbmltaXplIHRoZSBjYWxscyB0byB0aGUgdmVyeSBleHBlbnNpdmUgZW11bGF0ZWQgZGl2LlxuICBcbiAgXG4gICAgdmFyIHJhZGl4VG9Qb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgNiksIHRoaXMudW5zaWduZWQpLFxuICAgICAgICByZW0gPSB0aGlzO1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgXG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciByZW1EaXYgPSByZW0uZGl2KHJhZGl4VG9Qb3dlciksXG4gICAgICAgICAgaW50dmFsID0gcmVtLnN1YihyZW1EaXYubXVsKHJhZGl4VG9Qb3dlcikpLnRvSW50KCkgPj4+IDAsXG4gICAgICAgICAgZGlnaXRzID0gaW50dmFsLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgIHJlbSA9IHJlbURpdjtcbiAgICAgIGlmIChyZW0uaXNaZXJvKCkpIHJldHVybiBkaWdpdHMgKyByZXN1bHQ7ZWxzZSB7XG4gICAgICAgIHdoaWxlIChkaWdpdHMubGVuZ3RoIDwgNikgZGlnaXRzID0gJzAnICsgZGlnaXRzO1xuICBcbiAgICAgICAgcmVzdWx0ID0gJycgKyBkaWdpdHMgKyByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgaGlnaCAzMiBiaXRzIGFzIGEgc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGhpZ2ggYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldEhpZ2hCaXRzID0gZnVuY3Rpb24gZ2V0SGlnaEJpdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGhpZ2ggMzIgYml0cyBhcyBhbiB1bnNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFVuc2lnbmVkIGhpZ2ggYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldEhpZ2hCaXRzVW5zaWduZWQgPSBmdW5jdGlvbiBnZXRIaWdoQml0c1Vuc2lnbmVkKCkge1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPj4+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBsb3cgMzIgYml0cyBhcyBhIHNpZ25lZCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IFNpZ25lZCBsb3cgYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldExvd0JpdHMgPSBmdW5jdGlvbiBnZXRMb3dCaXRzKCkge1xuICAgIHJldHVybiB0aGlzLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGxvdyAzMiBiaXRzIGFzIGFuIHVuc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gVW5zaWduZWQgbG93IGJpdHNcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXRMb3dCaXRzVW5zaWduZWQgPSBmdW5jdGlvbiBnZXRMb3dCaXRzVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93ID4+PiAwO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbnVtYmVyIG9mIGJpdHMgbmVlZGVkIHRvIHJlcHJlc2VudCB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TnVtQml0c0FicyA9IGZ1bmN0aW9uIGdldE51bUJpdHNBYnMoKSB7XG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSAvLyBVbnNpZ25lZCBMb25ncyBhcmUgbmV2ZXIgbmVnYXRpdmVcbiAgICAgIHJldHVybiB0aGlzLmVxKE1JTl9WQUxVRSkgPyA2NCA6IHRoaXMubmVnKCkuZ2V0TnVtQml0c0FicygpO1xuICAgIHZhciB2YWwgPSB0aGlzLmhpZ2ggIT0gMCA/IHRoaXMuaGlnaCA6IHRoaXMubG93O1xuICBcbiAgICBmb3IgKHZhciBiaXQgPSAzMTsgYml0ID4gMDsgYml0LS0pIGlmICgodmFsICYgMSA8PCBiaXQpICE9IDApIGJyZWFrO1xuICBcbiAgICByZXR1cm4gdGhpcy5oaWdoICE9IDAgPyBiaXQgKyAzMyA6IGJpdCArIDE7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgemVyby5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc1plcm8gPSBmdW5jdGlvbiBpc1plcm8oKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA9PT0gMCAmJiB0aGlzLmxvdyA9PT0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB6ZXJvLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2lzWmVyb30uXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxeiA9IExvbmdQcm90b3R5cGUuaXNaZXJvO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbmVnYXRpdmUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc05lZ2F0aXZlID0gZnVuY3Rpb24gaXNOZWdhdGl2ZSgpIHtcbiAgICByZXR1cm4gIXRoaXMudW5zaWduZWQgJiYgdGhpcy5oaWdoIDwgMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIHBvc2l0aXZlIG9yIHplcm8uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNQb3NpdGl2ZSA9IGZ1bmN0aW9uIGlzUG9zaXRpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMudW5zaWduZWQgfHwgdGhpcy5oaWdoID49IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBvZGQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNPZGQgPSBmdW5jdGlvbiBpc09kZCgpIHtcbiAgICByZXR1cm4gKHRoaXMubG93ICYgMSkgPT09IDE7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBldmVuLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzRXZlbiA9IGZ1bmN0aW9uIGlzRXZlbigpIHtcbiAgICByZXR1cm4gKHRoaXMubG93ICYgMSkgPT09IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgaWYgKHRoaXMudW5zaWduZWQgIT09IG90aGVyLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA+Pj4gMzEgPT09IDEgJiYgb3RoZXIuaGlnaCA+Pj4gMzEgPT09IDEpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdGhpcy5oaWdoID09PSBvdGhlci5oaWdoICYmIHRoaXMubG93ID09PSBvdGhlci5sb3c7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBlcXVhbHMgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2VxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmVxID0gTG9uZ1Byb3RvdHlwZS5lcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHMgPSBmdW5jdGlvbiBub3RFcXVhbHMob3RoZXIpIHtcbiAgICByZXR1cm4gIXRoaXMuZXEoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNub3RFcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZXEgPSBMb25nUHJvdG90eXBlLm5vdEVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbm90RXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZSA9IExvbmdQcm90b3R5cGUubm90RXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubGVzc1RoYW4gPSBmdW5jdGlvbiBsZXNzVGhhbihvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpIDwgMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW59LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5sdCA9IExvbmdQcm90b3R5cGUubGVzc1RoYW47XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWwgPSBmdW5jdGlvbiBsZXNzVGhhbk9yRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA8PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5sdGUgPSBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbGVzc1RoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZSA9IExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW4gPSBmdW5jdGlvbiBncmVhdGVyVGhhbihvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpID4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW59LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5ndCA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW47XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWwgPSBmdW5jdGlvbiBncmVhdGVyVGhhbk9yRXF1YWwob3RoZXIpIHtcbiAgICByZXR1cm4gdGhpcy5jb21wKFxuICAgIC8qIHZhbGlkYXRlcyAqL1xuICAgIG90aGVyKSA+PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5ndGUgPSBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbDtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZ3JlYXRlclRoYW5PckVxdWFsfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuICAvKipcbiAgICogQ29tcGFyZXMgdGhpcyBMb25nJ3MgdmFsdWUgd2l0aCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCAxIGlmIHRoZSB0aGlzIGlzIGdyZWF0ZXIgYW5kIC0xXG4gICAqICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgaWYgKHRoaXMuZXEob3RoZXIpKSByZXR1cm4gMDtcbiAgICB2YXIgdGhpc05lZyA9IHRoaXMuaXNOZWdhdGl2ZSgpLFxuICAgICAgICBvdGhlck5lZyA9IG90aGVyLmlzTmVnYXRpdmUoKTtcbiAgICBpZiAodGhpc05lZyAmJiAhb3RoZXJOZWcpIHJldHVybiAtMTtcbiAgICBpZiAoIXRoaXNOZWcgJiYgb3RoZXJOZWcpIHJldHVybiAxOyAvLyBBdCB0aGlzIHBvaW50IHRoZSBzaWduIGJpdHMgYXJlIHRoZSBzYW1lXG4gIFxuICAgIGlmICghdGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXMuc3ViKG90aGVyKS5pc05lZ2F0aXZlKCkgPyAtMSA6IDE7IC8vIEJvdGggYXJlIHBvc2l0aXZlIGlmIGF0IGxlYXN0IG9uZSBpcyB1bnNpZ25lZFxuICBcbiAgICByZXR1cm4gb3RoZXIuaGlnaCA+Pj4gMCA+IHRoaXMuaGlnaCA+Pj4gMCB8fCBvdGhlci5oaWdoID09PSB0aGlzLmhpZ2ggJiYgb3RoZXIubG93ID4+PiAwID4gdGhpcy5sb3cgPj4+IDAgPyAtMSA6IDE7XG4gIH07XG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGlzIExvbmcncyB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb21wYXJlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge251bWJlcn0gMCBpZiB0aGV5IGFyZSB0aGUgc2FtZSwgMSBpZiB0aGUgdGhpcyBpcyBncmVhdGVyIGFuZCAtMVxuICAgKiAgaWYgdGhlIGdpdmVuIG9uZSBpcyBncmVhdGVyXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY29tcCA9IExvbmdQcm90b3R5cGUuY29tcGFyZTtcbiAgLyoqXG4gICAqIE5lZ2F0ZXMgdGhpcyBMb25nJ3MgdmFsdWUuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBOZWdhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5lZ2F0ZSA9IGZ1bmN0aW9uIG5lZ2F0ZSgpIHtcbiAgICBpZiAoIXRoaXMudW5zaWduZWQgJiYgdGhpcy5lcShNSU5fVkFMVUUpKSByZXR1cm4gTUlOX1ZBTFVFO1xuICAgIHJldHVybiB0aGlzLm5vdCgpLmFkZChPTkUpO1xuICB9O1xuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNuZWdhdGV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHJldHVybnMgeyFMb25nfSBOZWdhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5uZWcgPSBMb25nUHJvdG90eXBlLm5lZ2F0ZTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN1bSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBhZGRlbmQgQWRkZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU3VtXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBhZGQoYWRkZW5kKSB7XG4gICAgaWYgKCFpc0xvbmcoYWRkZW5kKSkgYWRkZW5kID0gZnJvbVZhbHVlKGFkZGVuZCk7IC8vIERpdmlkZSBlYWNoIG51bWJlciBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIHN1bSB0aGUgY2h1bmtzLlxuICBcbiAgICB2YXIgYTQ4ID0gdGhpcy5oaWdoID4+PiAxNjtcbiAgICB2YXIgYTMyID0gdGhpcy5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBhMTYgPSB0aGlzLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGEwMCA9IHRoaXMubG93ICYgMHhGRkZGO1xuICAgIHZhciBiNDggPSBhZGRlbmQuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGIzMiA9IGFkZGVuZC5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBiMTYgPSBhZGRlbmQubG93ID4+PiAxNjtcbiAgICB2YXIgYjAwID0gYWRkZW5kLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYzQ4ID0gMCxcbiAgICAgICAgYzMyID0gMCxcbiAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgYzAwID0gMDtcbiAgICBjMDAgKz0gYTAwICsgYjAwO1xuICAgIGMxNiArPSBjMDAgPj4+IDE2O1xuICAgIGMwMCAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGExNiArIGIxNjtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMzIgKyBiMzI7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjNDggKz0gYTQ4ICsgYjQ4O1xuICAgIGM0OCAmPSAweEZGRkY7XG4gICAgcmV0dXJuIGZyb21CaXRzKGMxNiA8PCAxNiB8IGMwMCwgYzQ4IDw8IDE2IHwgYzMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gRGlmZmVyZW5jZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24gc3VidHJhY3Qoc3VidHJhaGVuZCkge1xuICAgIGlmICghaXNMb25nKHN1YnRyYWhlbmQpKSBzdWJ0cmFoZW5kID0gZnJvbVZhbHVlKHN1YnRyYWhlbmQpO1xuICAgIHJldHVybiB0aGlzLmFkZChzdWJ0cmFoZW5kLm5lZygpKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRpZmZlcmVuY2Ugb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3N1YnRyYWN0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gc3VidHJhaGVuZCBTdWJ0cmFoZW5kXG4gICAqIEByZXR1cm5zIHshTG9uZ30gRGlmZmVyZW5jZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnN1YiA9IExvbmdQcm90b3R5cGUuc3VidHJhY3Q7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBwcm9kdWN0IG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG11bHRpcGxpZXIgTXVsdGlwbGllclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFByb2R1Y3RcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm11bHRpcGx5ID0gZnVuY3Rpb24gbXVsdGlwbHkobXVsdGlwbGllcikge1xuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gdGhpcztcbiAgICBpZiAoIWlzTG9uZyhtdWx0aXBsaWVyKSkgbXVsdGlwbGllciA9IGZyb21WYWx1ZShtdWx0aXBsaWVyKTsgLy8gdXNlIHdhc20gc3VwcG9ydCBpZiBwcmVzZW50XG4gIFxuICAgIGlmICh3YXNtKSB7XG4gICAgICB2YXIgbG93ID0gd2FzbVtcIm11bFwiXSh0aGlzLmxvdywgdGhpcy5oaWdoLCBtdWx0aXBsaWVyLmxvdywgbXVsdGlwbGllci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIGlmIChtdWx0aXBsaWVyLmlzWmVybygpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICBpZiAodGhpcy5lcShNSU5fVkFMVUUpKSByZXR1cm4gbXVsdGlwbGllci5pc09kZCgpID8gTUlOX1ZBTFVFIDogWkVSTztcbiAgICBpZiAobXVsdGlwbGllci5lcShNSU5fVkFMVUUpKSByZXR1cm4gdGhpcy5pc09kZCgpID8gTUlOX1ZBTFVFIDogWkVSTztcbiAgXG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICBpZiAobXVsdGlwbGllci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm5lZygpLm11bChtdWx0aXBsaWVyLm5lZygpKTtlbHNlIHJldHVybiB0aGlzLm5lZygpLm11bChtdWx0aXBsaWVyKS5uZWcoKTtcbiAgICB9IGVsc2UgaWYgKG11bHRpcGxpZXIuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5tdWwobXVsdGlwbGllci5uZWcoKSkubmVnKCk7IC8vIElmIGJvdGggbG9uZ3MgYXJlIHNtYWxsLCB1c2UgZmxvYXQgbXVsdGlwbGljYXRpb25cbiAgXG4gIFxuICAgIGlmICh0aGlzLmx0KFRXT19QV1JfMjQpICYmIG11bHRpcGxpZXIubHQoVFdPX1BXUl8yNCkpIHJldHVybiBmcm9tTnVtYmVyKHRoaXMudG9OdW1iZXIoKSAqIG11bHRpcGxpZXIudG9OdW1iZXIoKSwgdGhpcy51bnNpZ25lZCk7IC8vIERpdmlkZSBlYWNoIGxvbmcgaW50byA0IGNodW5rcyBvZiAxNiBiaXRzLCBhbmQgdGhlbiBhZGQgdXAgNHg0IHByb2R1Y3RzLlxuICAgIC8vIFdlIGNhbiBza2lwIHByb2R1Y3RzIHRoYXQgd291bGQgb3ZlcmZsb3cuXG4gIFxuICAgIHZhciBhNDggPSB0aGlzLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBhMzIgPSB0aGlzLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGExNiA9IHRoaXMubG93ID4+PiAxNjtcbiAgICB2YXIgYTAwID0gdGhpcy5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGI0OCA9IG11bHRpcGxpZXIuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGIzMiA9IG11bHRpcGxpZXIuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYjE2ID0gbXVsdGlwbGllci5sb3cgPj4+IDE2O1xuICAgIHZhciBiMDAgPSBtdWx0aXBsaWVyLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYzQ4ID0gMCxcbiAgICAgICAgYzMyID0gMCxcbiAgICAgICAgYzE2ID0gMCxcbiAgICAgICAgYzAwID0gMDtcbiAgICBjMDAgKz0gYTAwICogYjAwO1xuICAgIGMxNiArPSBjMDAgPj4+IDE2O1xuICAgIGMwMCAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGExNiAqIGIwMDtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMxNiArPSBhMDAgKiBiMTY7XG4gICAgYzMyICs9IGMxNiA+Pj4gMTY7XG4gICAgYzE2ICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTMyICogYjAwO1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGExNiAqIGIxNjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMDAgKiBiMzI7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjNDggKz0gYTQ4ICogYjAwICsgYTMyICogYjE2ICsgYTE2ICogYjMyICsgYTAwICogYjQ4O1xuICAgIGM0OCAmPSAweEZGRkY7XG4gICAgcmV0dXJuIGZyb21CaXRzKGMxNiA8PCAxNiB8IGMwMCwgYzQ4IDw8IDE2IHwgYzMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI211bHRpcGx5fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gbXVsdGlwbGllciBNdWx0aXBsaWVyXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUHJvZHVjdFxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm11bCA9IExvbmdQcm90b3R5cGUubXVsdGlwbHk7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBkaXZpZGVkIGJ5IHRoZSBzcGVjaWZpZWQuIFRoZSByZXN1bHQgaXMgc2lnbmVkIGlmIHRoaXMgTG9uZyBpcyBzaWduZWQgb3JcbiAgICogIHVuc2lnbmVkIGlmIHRoaXMgTG9uZyBpcyB1bnNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFF1b3RpZW50XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbiBkaXZpZGUoZGl2aXNvcikge1xuICAgIGlmICghaXNMb25nKGRpdmlzb3IpKSBkaXZpc29yID0gZnJvbVZhbHVlKGRpdmlzb3IpO1xuICAgIGlmIChkaXZpc29yLmlzWmVybygpKSB0aHJvdyBFcnJvcignZGl2aXNpb24gYnkgemVybycpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIC8vIGd1YXJkIGFnYWluc3Qgc2lnbmVkIGRpdmlzaW9uIG92ZXJmbG93OiB0aGUgbGFyZ2VzdFxuICAgICAgLy8gbmVnYXRpdmUgbnVtYmVyIC8gLTEgd291bGQgYmUgMSBsYXJnZXIgdGhhbiB0aGUgbGFyZ2VzdFxuICAgICAgLy8gcG9zaXRpdmUgbnVtYmVyLCBkdWUgdG8gdHdvJ3MgY29tcGxlbWVudC5cbiAgICAgIGlmICghdGhpcy51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPT09IC0weDgwMDAwMDAwICYmIGRpdmlzb3IubG93ID09PSAtMSAmJiBkaXZpc29yLmhpZ2ggPT09IC0xKSB7XG4gICAgICAgIC8vIGJlIGNvbnNpc3RlbnQgd2l0aCBub24td2FzbSBjb2RlIHBhdGhcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gIFxuICAgICAgdmFyIGxvdyA9ICh0aGlzLnVuc2lnbmVkID8gd2FzbVtcImRpdl91XCJdIDogd2FzbVtcImRpdl9zXCJdKSh0aGlzLmxvdywgdGhpcy5oaWdoLCBkaXZpc29yLmxvdywgZGl2aXNvci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIGlmICh0aGlzLmlzWmVybygpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgICB2YXIgYXBwcm94LCByZW0sIHJlcztcbiAgXG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSB7XG4gICAgICAvLyBUaGlzIHNlY3Rpb24gaXMgb25seSByZWxldmFudCBmb3Igc2lnbmVkIGxvbmdzIGFuZCBpcyBkZXJpdmVkIGZyb20gdGhlXG4gICAgICAvLyBjbG9zdXJlIGxpYnJhcnkgYXMgYSB3aG9sZS5cbiAgICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHtcbiAgICAgICAgaWYgKGRpdmlzb3IuZXEoT05FKSB8fCBkaXZpc29yLmVxKE5FR19PTkUpKSByZXR1cm4gTUlOX1ZBTFVFOyAvLyByZWNhbGwgdGhhdCAtTUlOX1ZBTFVFID09IE1JTl9WQUxVRVxuICAgICAgICBlbHNlIGlmIChkaXZpc29yLmVxKE1JTl9WQUxVRSkpIHJldHVybiBPTkU7ZWxzZSB7XG4gICAgICAgICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgaGF2ZSB8b3RoZXJ8ID49IDIsIHNvIHx0aGlzL290aGVyfCA8IHxNSU5fVkFMVUV8LlxuICAgICAgICAgIHZhciBoYWxmVGhpcyA9IHRoaXMuc2hyKDEpO1xuICAgICAgICAgIGFwcHJveCA9IGhhbGZUaGlzLmRpdihkaXZpc29yKS5zaGwoMSk7XG4gIFxuICAgICAgICAgIGlmIChhcHByb3guZXEoWkVSTykpIHtcbiAgICAgICAgICAgIHJldHVybiBkaXZpc29yLmlzTmVnYXRpdmUoKSA/IE9ORSA6IE5FR19PTkU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlbSA9IHRoaXMuc3ViKGRpdmlzb3IubXVsKGFwcHJveCkpO1xuICAgICAgICAgICAgcmVzID0gYXBwcm94LmFkZChyZW0uZGl2KGRpdmlzb3IpKTtcbiAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGRpdmlzb3IuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIHRoaXMudW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gIFxuICAgICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAgIGlmIChkaXZpc29yLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubmVnKCkuZGl2KGRpdmlzb3IubmVnKCkpO1xuICAgICAgICByZXR1cm4gdGhpcy5uZWcoKS5kaXYoZGl2aXNvcikubmVnKCk7XG4gICAgICB9IGVsc2UgaWYgKGRpdmlzb3IuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5kaXYoZGl2aXNvci5uZWcoKSkubmVnKCk7XG4gIFxuICAgICAgcmVzID0gWkVSTztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVGhlIGFsZ29yaXRobSBiZWxvdyBoYXMgbm90IGJlZW4gbWFkZSBmb3IgdW5zaWduZWQgbG9uZ3MuIEl0J3MgdGhlcmVmb3JlXG4gICAgICAvLyByZXF1aXJlZCB0byB0YWtlIHNwZWNpYWwgY2FyZSBvZiB0aGUgTVNCIHByaW9yIHRvIHJ1bm5pbmcgaXQuXG4gICAgICBpZiAoIWRpdmlzb3IudW5zaWduZWQpIGRpdmlzb3IgPSBkaXZpc29yLnRvVW5zaWduZWQoKTtcbiAgICAgIGlmIChkaXZpc29yLmd0KHRoaXMpKSByZXR1cm4gVVpFUk87XG4gICAgICBpZiAoZGl2aXNvci5ndCh0aGlzLnNocnUoMSkpKSAvLyAxNSA+Pj4gMSA9IDcgOyB3aXRoIGRpdmlzb3IgPSA4IDsgdHJ1ZVxuICAgICAgICByZXR1cm4gVU9ORTtcbiAgICAgIHJlcyA9IFVaRVJPO1xuICAgIH0gLy8gUmVwZWF0IHRoZSBmb2xsb3dpbmcgdW50aWwgdGhlIHJlbWFpbmRlciBpcyBsZXNzIHRoYW4gb3RoZXI6ICBmaW5kIGFcbiAgICAvLyBmbG9hdGluZy1wb2ludCB0aGF0IGFwcHJveGltYXRlcyByZW1haW5kZXIgLyBvdGhlciAqZnJvbSBiZWxvdyosIGFkZCB0aGlzXG4gICAgLy8gaW50byB0aGUgcmVzdWx0LCBhbmQgc3VidHJhY3QgaXQgZnJvbSB0aGUgcmVtYWluZGVyLiAgSXQgaXMgY3JpdGljYWwgdGhhdFxuICAgIC8vIHRoZSBhcHByb3hpbWF0ZSB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHJlYWwgdmFsdWUgc28gdGhhdCB0aGVcbiAgICAvLyByZW1haW5kZXIgbmV2ZXIgYmVjb21lcyBuZWdhdGl2ZS5cbiAgXG4gIFxuICAgIHJlbSA9IHRoaXM7XG4gIFxuICAgIHdoaWxlIChyZW0uZ3RlKGRpdmlzb3IpKSB7XG4gICAgICAvLyBBcHByb3hpbWF0ZSB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uLiBUaGlzIG1heSBiZSBhIGxpdHRsZSBncmVhdGVyIG9yXG4gICAgICAvLyBzbWFsbGVyIHRoYW4gdGhlIGFjdHVhbCB2YWx1ZS5cbiAgICAgIGFwcHJveCA9IE1hdGgubWF4KDEsIE1hdGguZmxvb3IocmVtLnRvTnVtYmVyKCkgLyBkaXZpc29yLnRvTnVtYmVyKCkpKTsgLy8gV2Ugd2lsbCB0d2VhayB0aGUgYXBwcm94aW1hdGUgcmVzdWx0IGJ5IGNoYW5naW5nIGl0IGluIHRoZSA0OC10aCBkaWdpdCBvclxuICAgICAgLy8gdGhlIHNtYWxsZXN0IG5vbi1mcmFjdGlvbmFsIGRpZ2l0LCB3aGljaGV2ZXIgaXMgbGFyZ2VyLlxuICBcbiAgICAgIHZhciBsb2cyID0gTWF0aC5jZWlsKE1hdGgubG9nKGFwcHJveCkgLyBNYXRoLkxOMiksXG4gICAgICAgICAgZGVsdGEgPSBsb2cyIDw9IDQ4ID8gMSA6IHBvd19kYmwoMiwgbG9nMiAtIDQ4KSxcbiAgICAgICAgICAvLyBEZWNyZWFzZSB0aGUgYXBwcm94aW1hdGlvbiB1bnRpbCBpdCBpcyBzbWFsbGVyIHRoYW4gdGhlIHJlbWFpbmRlci4gIE5vdGVcbiAgICAgIC8vIHRoYXQgaWYgaXQgaXMgdG9vIGxhcmdlLCB0aGUgcHJvZHVjdCBvdmVyZmxvd3MgYW5kIGlzIG5lZ2F0aXZlLlxuICAgICAgYXBwcm94UmVzID0gZnJvbU51bWJlcihhcHByb3gpLFxuICAgICAgICAgIGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWwoZGl2aXNvcik7XG4gIFxuICAgICAgd2hpbGUgKGFwcHJveFJlbS5pc05lZ2F0aXZlKCkgfHwgYXBwcm94UmVtLmd0KHJlbSkpIHtcbiAgICAgICAgYXBwcm94IC09IGRlbHRhO1xuICAgICAgICBhcHByb3hSZXMgPSBmcm9tTnVtYmVyKGFwcHJveCwgdGhpcy51bnNpZ25lZCk7XG4gICAgICAgIGFwcHJveFJlbSA9IGFwcHJveFJlcy5tdWwoZGl2aXNvcik7XG4gICAgICB9IC8vIFdlIGtub3cgdGhlIGFuc3dlciBjYW4ndCBiZSB6ZXJvLi4uIGFuZCBhY3R1YWxseSwgemVybyB3b3VsZCBjYXVzZVxuICAgICAgLy8gaW5maW5pdGUgcmVjdXJzaW9uIHNpbmNlIHdlIHdvdWxkIG1ha2Ugbm8gcHJvZ3Jlc3MuXG4gIFxuICBcbiAgICAgIGlmIChhcHByb3hSZXMuaXNaZXJvKCkpIGFwcHJveFJlcyA9IE9ORTtcbiAgICAgIHJlcyA9IHJlcy5hZGQoYXBwcm94UmVzKTtcbiAgICAgIHJlbSA9IHJlbS5zdWIoYXBwcm94UmVtKTtcbiAgICB9XG4gIFxuICAgIHJldHVybiByZXM7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBkaXZpZGVkIGJ5IHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZGl2aWRlfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUXVvdGllbnRcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5kaXYgPSBMb25nUHJvdG90eXBlLmRpdmlkZTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5tb2R1bG8gPSBmdW5jdGlvbiBtb2R1bG8oZGl2aXNvcikge1xuICAgIGlmICghaXNMb25nKGRpdmlzb3IpKSBkaXZpc29yID0gZnJvbVZhbHVlKGRpdmlzb3IpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIHZhciBsb3cgPSAodGhpcy51bnNpZ25lZCA/IHdhc21bXCJyZW1fdVwiXSA6IHdhc21bXCJyZW1fc1wiXSkodGhpcy5sb3csIHRoaXMuaGlnaCwgZGl2aXNvci5sb3csIGRpdmlzb3IuaGlnaCk7XG4gICAgICByZXR1cm4gZnJvbUJpdHMobG93LCB3YXNtW1wiZ2V0X2hpZ2hcIl0oKSwgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICByZXR1cm4gdGhpcy5zdWIodGhpcy5kaXYoZGl2aXNvcikubXVsKGRpdmlzb3IpKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIG1vZHVsbyB0aGUgc3BlY2lmaWVkLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI21vZHVsb30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGRpdmlzb3IgRGl2aXNvclxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJlbWFpbmRlclxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm1vZCA9IExvbmdQcm90b3R5cGUubW9kdWxvO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbW9kdWxvfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yZW0gPSBMb25nUHJvdG90eXBlLm1vZHVsbztcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgTk9UIG9mIHRoaXMgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ub3QgPSBmdW5jdGlvbiBub3QoKSB7XG4gICAgcmV0dXJuIGZyb21CaXRzKH50aGlzLmxvdywgfnRoaXMuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IGxlYWRpbmcgemVyb3Mgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmNvdW50TGVhZGluZ1plcm9zID0gZnVuY3Rpb24gY291bnRMZWFkaW5nWmVyb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA/IE1hdGguY2x6MzIodGhpcy5oaWdoKSA6IE1hdGguY2x6MzIodGhpcy5sb3cpICsgMzI7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIGNvdW50IGxlYWRpbmcgemVyb3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY291bnRMZWFkaW5nWmVyb3N9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY2x6ID0gTG9uZ1Byb3RvdHlwZS5jb3VudExlYWRpbmdaZXJvcztcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgdHJhaWxpbmcgemVyb3Mgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuY291bnRUcmFpbGluZ1plcm9zID0gZnVuY3Rpb24gY291bnRUcmFpbGluZ1plcm9zKCkge1xuICAgIHJldHVybiB0aGlzLmxvdyA/IGN0ejMyKHRoaXMubG93KSA6IGN0ejMyKHRoaXMuaGlnaCkgKyAzMjtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgdHJhaWxpbmcgemVyb3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjY291bnRUcmFpbGluZ1plcm9zfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshbnVtYmVyfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmN0eiA9IExvbmdQcm90b3R5cGUuY291bnRUcmFpbGluZ1plcm9zO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBBTkQgb2YgdGhpcyBMb25nIGFuZCB0aGUgc3BlY2lmaWVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5hbmQgPSBmdW5jdGlvbiBhbmQob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgJiBvdGhlci5sb3csIHRoaXMuaGlnaCAmIG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBPUiBvZiB0aGlzIExvbmcgYW5kIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5vciA9IGZ1bmN0aW9uIG9yKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IHwgb3RoZXIubG93LCB0aGlzLmhpZ2ggfCBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJpdHdpc2UgWE9SIG9mIHRoaXMgTG9uZyBhbmQgdGhlIGdpdmVuIG9uZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnhvciA9IGZ1bmN0aW9uIHhvcihvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyBeIG90aGVyLmxvdywgdGhpcy5oaWdoIF4gb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgc2hpZnRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRMZWZ0ID0gZnVuY3Rpb24gc2hpZnRMZWZ0KG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO2Vsc2UgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IG51bUJpdHMsIHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IDMyIC0gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7ZWxzZSByZXR1cm4gZnJvbUJpdHMoMCwgdGhpcy5sb3cgPDwgbnVtQml0cyAtIDMyLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRMZWZ0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hsID0gTG9uZ1Byb3RvdHlwZS5zaGlmdExlZnQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgYXJpdGhtZXRpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRSaWdodCA9IGZ1bmN0aW9uIHNoaWZ0UmlnaHQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7ZWxzZSBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPj4+IG51bUJpdHMgfCB0aGlzLmhpZ2ggPDwgMzIgLSBudW1CaXRzLCB0aGlzLmhpZ2ggPj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7ZWxzZSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoID4+IG51bUJpdHMgLSAzMiwgdGhpcy5oaWdoID49IDAgPyAwIDogLTEsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGFyaXRobWV0aWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNociA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkID0gZnVuY3Rpb24gc2hpZnRSaWdodFVuc2lnbmVkKG51bUJpdHMpIHtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA+Pj4gbnVtQml0cyB8IHRoaXMuaGlnaCA8PCAzMiAtIG51bUJpdHMsIHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCAwLCB0aGlzLnVuc2lnbmVkKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoID4+PiBudW1CaXRzIC0gMzIsIDAsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHRVbnNpZ25lZH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnNocnUgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBsb2dpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0VW5zaWduZWR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnNocl91ID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUm90YXRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RhdGVMZWZ0ID0gZnVuY3Rpb24gcm90YXRlTGVmdChudW1CaXRzKSB7XG4gICAgdmFyIGI7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIHRoaXMubG93LCB0aGlzLnVuc2lnbmVkKTtcbiAgXG4gICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA8PCBudW1CaXRzIHwgdGhpcy5oaWdoID4+PiBiLCB0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiBiLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIG51bUJpdHMgLT0gMzI7XG4gICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gYiwgdGhpcy5sb3cgPDwgbnVtQml0cyB8IHRoaXMuaGlnaCA+Pj4gYiwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgbGVmdCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3JvdGF0ZUxlZnR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RsID0gTG9uZ1Byb3RvdHlwZS5yb3RhdGVMZWZ0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGF0ZVJpZ2h0ID0gZnVuY3Rpb24gcm90YXRlUmlnaHQobnVtQml0cykge1xuICAgIHZhciBiO1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPT09IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoLCB0aGlzLmxvdywgdGhpcy51bnNpZ25lZCk7XG4gIFxuICAgIGlmIChudW1CaXRzIDwgMzIpIHtcbiAgICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgICByZXR1cm4gZnJvbUJpdHModGhpcy5oaWdoIDw8IGIgfCB0aGlzLmxvdyA+Pj4gbnVtQml0cywgdGhpcy5sb3cgPDwgYiB8IHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gICAgfVxuICBcbiAgICBudW1CaXRzIC09IDMyO1xuICAgIGIgPSAzMiAtIG51bUJpdHM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IGIgfCB0aGlzLmhpZ2ggPj4+IG51bUJpdHMsIHRoaXMuaGlnaCA8PCBiIHwgdGhpcy5sb3cgPj4+IG51bUJpdHMsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHJvdGF0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjcm90YXRlUmlnaHR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5yb3RyID0gTG9uZ1Byb3RvdHlwZS5yb3RhdGVSaWdodDtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBzaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBTaWduZWQgbG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUudG9TaWduZWQgPSBmdW5jdGlvbiB0b1NpZ25lZCgpIHtcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCBmYWxzZSk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gdW5zaWduZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFMb25nfSBVbnNpZ25lZCBsb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9VbnNpZ25lZCA9IGZ1bmN0aW9uIHRvVW5zaWduZWQoKSB7XG4gICAgaWYgKHRoaXMudW5zaWduZWQpIHJldHVybiB0aGlzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdywgdGhpcy5oaWdoLCB0cnVlKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byBpdHMgYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHtib29sZWFuPX0gbGUgV2hldGhlciBsaXR0bGUgb3IgYmlnIGVuZGlhbiwgZGVmYXVsdHMgdG8gYmlnIGVuZGlhblxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshQXJyYXkuPG51bWJlcj59IEJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzID0gZnVuY3Rpb24gdG9CeXRlcyhsZSkge1xuICAgIHJldHVybiBsZSA/IHRoaXMudG9CeXRlc0xFKCkgOiB0aGlzLnRvQnl0ZXNCRSgpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBsaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gTGl0dGxlIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlc0xFID0gZnVuY3Rpb24gdG9CeXRlc0xFKCkge1xuICAgIHZhciBoaSA9IHRoaXMuaGlnaCxcbiAgICAgICAgbG8gPSB0aGlzLmxvdztcbiAgICByZXR1cm4gW2xvICYgMHhmZiwgbG8gPj4+IDggJiAweGZmLCBsbyA+Pj4gMTYgJiAweGZmLCBsbyA+Pj4gMjQsIGhpICYgMHhmZiwgaGkgPj4+IDggJiAweGZmLCBoaSA+Pj4gMTYgJiAweGZmLCBoaSA+Pj4gMjRdO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBiaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9CeXRlc0JFID0gZnVuY3Rpb24gdG9CeXRlc0JFKCkge1xuICAgIHZhciBoaSA9IHRoaXMuaGlnaCxcbiAgICAgICAgbG8gPSB0aGlzLmxvdztcbiAgICByZXR1cm4gW2hpID4+PiAyNCwgaGkgPj4+IDE2ICYgMHhmZiwgaGkgPj4+IDggJiAweGZmLCBoaSAmIDB4ZmYsIGxvID4+PiAyNCwgbG8gPj4+IDE2ICYgMHhmZiwgbG8gPj4+IDggJiAweGZmLCBsbyAmIDB4ZmZdO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIEJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBsZSBXaGV0aGVyIGxpdHRsZSBvciBiaWcgZW5kaWFuLCBkZWZhdWx0cyB0byBiaWcgZW5kaWFuXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzID0gZnVuY3Rpb24gZnJvbUJ5dGVzKGJ5dGVzLCB1bnNpZ25lZCwgbGUpIHtcbiAgICByZXR1cm4gbGUgPyBMb25nLmZyb21CeXRlc0xFKGJ5dGVzLCB1bnNpZ25lZCkgOiBMb25nLmZyb21CeXRlc0JFKGJ5dGVzLCB1bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBsaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb24uXG4gICAqIEBwYXJhbSB7IUFycmF5LjxudW1iZXI+fSBieXRlcyBMaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWQgV2hldGhlciB1bnNpZ25lZCBvciBub3QsIGRlZmF1bHRzIHRvIHNpZ25lZFxuICAgKiBAcmV0dXJucyB7TG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21CeXRlc0xFID0gZnVuY3Rpb24gZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKSB7XG4gICAgcmV0dXJuIG5ldyBMb25nKGJ5dGVzWzBdIHwgYnl0ZXNbMV0gPDwgOCB8IGJ5dGVzWzJdIDw8IDE2IHwgYnl0ZXNbM10gPDwgMjQsIGJ5dGVzWzRdIHwgYnl0ZXNbNV0gPDwgOCB8IGJ5dGVzWzZdIDw8IDE2IHwgYnl0ZXNbN10gPDwgMjQsIHVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIEJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzQkUgPSBmdW5jdGlvbiBmcm9tQnl0ZXNCRShieXRlcywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcoYnl0ZXNbNF0gPDwgMjQgfCBieXRlc1s1XSA8PCAxNiB8IGJ5dGVzWzZdIDw8IDggfCBieXRlc1s3XSwgYnl0ZXNbMF0gPDwgMjQgfCBieXRlc1sxXSA8PCAxNiB8IGJ5dGVzWzJdIDw8IDggfCBieXRlc1szXSwgdW5zaWduZWQpO1xuICB9O1xuICBcbiAgdmFyIF9kZWZhdWx0ID0gTG9uZztcbiAgZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4gIHJldHVybiBcImRlZmF1bHRcIiBpbiBleHBvcnRzID8gZXhwb3J0cy5kZWZhdWx0IDogZXhwb3J0cztcbn0pKHt9KTtcbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShbXSwgZnVuY3Rpb24oKSB7IHJldHVybiBMb25nOyB9KTtcbmVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBleHBvcnRzPT09J29iamVjdCcpIG1vZHVsZS5leHBvcnRzID0gTG9uZztcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gKG1vZHVsZSkgPT4ge1xuXHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cblx0XHQoKSA9PiAobW9kdWxlWydkZWZhdWx0J10pIDpcblx0XHQoKSA9PiAobW9kdWxlKTtcblx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgeyBhOiBnZXR0ZXIgfSk7XG5cdHJldHVybiBnZXR0ZXI7XG59OyIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJcbmNvbnN0IGFwaSA9IHJlcXVpcmUoJ0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYi93b3JrZXItaW50ZXJmYWNlLmpzJyk7XG5cbmFwaS5vdmVycmlkZUdsb2JhbHMoKTtcblxuZXhwb3J0cy5hcGkgPSBhcGk7XG5cbmV4cG9ydHMuaW1wb3J0V29ya2Zsb3dzID0gZnVuY3Rpb24gaW1wb3J0V29ya2Zsb3dzKCkge1xuICByZXR1cm4gcmVxdWlyZSgvKiB3ZWJwYWNrTW9kZTogXCJlYWdlclwiICovIFwiRDpcXFxcQnVzaW5lc3NcXFxcTXkgUG9ydGZvbGlvXFxcXFByb2plY3RzXFxcXFRpY2tyXFxcXFRpY2tyLXdvcmtmbG93XFxcXHNyY1xcXFx3b3JrZmxvd3MudHNcIik7XG59XG5cbmV4cG9ydHMuaW1wb3J0SW50ZXJjZXB0b3JzID0gZnVuY3Rpb24gaW1wb3J0SW50ZXJjZXB0b3JzKCkge1xuICByZXR1cm4gW1xuICAgIHJlcXVpcmUoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIkQ6XFxcXEJ1c2luZXNzXFxcXE15IFBvcnRmb2xpb1xcXFxQcm9qZWN0c1xcXFxUaWNrclxcXFxUaWNrci13b3JrZmxvd1xcXFxub2RlX21vZHVsZXNcXFxcQHRlbXBvcmFsaW9cXFxcd29ya2VyXFxcXGxpYlxcXFx3b3JrZmxvdy1sb2ctaW50ZXJjZXB0b3IuanNcIilcbiAgXTtcbn1cbiJdLCJuYW1lcyI6WyJwcm94eUFjdGl2aXRpZXMiLCJpc19tYXJrZXRfb3BlbiIsImdldF9jdXJyZW50X3ByaWNlIiwiZ2V0X3N1cnJvdW5kaW5nX2tleV9sZXZlbHMiLCJnZXRfcG9zaXRpb25fc2V0dXAiLCJnZXRPcHRpb25zU2VsZWN0aW9uIiwid2FpdFRvU2lnbmFsT3BlblBvc2l0aW9uIiwiY2hlY2tJZlBvc2l0aW9uRmlsbGVkIiwiZ2V0T3B0aW9uU3ltYm9sIiwid2FpdFRvU2lnbmFsQ3V0UG9zaXRpb24iLCJ3YWl0VG9TaWduYWxDbG9zZVBvc2l0aW9uIiwiZ2V0TG9naW5DcmVkZW50aWFscyIsImdldFVzZXJQcmluY2lwbGVzIiwic3RhcnRUb0Nsb3NlVGltZW91dCIsInByaWNlQWN0aW9uIiwicHJlbWFya2V0RGF0YSIsInVuZGVmaW5lZCIsImJ1ZGdldCIsImNsaWVudElkIiwiY2xpZW50X2lkIiwiYWNjb3VudElkIiwiYWNjb3VudF9pZCIsImtleUxldmVscyIsImRlbWFuZFpvbmVzIiwic3VwcGx5Wm9uZXMiLCJzeW1ib2wiLCJ0b2tlbiIsImFjY2Vzc190b2tlbiIsInJlZnJlc2hfdG9rZW4iLCJhY2Nlc3NfdG9rZW5fZXhwaXJlc19hdCIsInJlZnJlc2hfdG9rZW5fZXhwaXJlc19hdCIsImxvZ2dlZF9pbiIsImFjY2Vzc190b2tlbl9leHBpcmVzX2F0X2RhdGUiLCJyZWZyZXNoX3Rva2VuX2V4cGlyZXNfYXRfZGF0ZSIsImdldHRpbmdVc2VyUHJpbmNpcGxlcyIsInVzZXJQcmluY2lwbGVzIiwicGFyYW1zIiwibWFya2V0T3BlbiIsImFkbWluQ29uZmlnIiwiYWNjb3VudHMiLCJzdHJlYW1lckluZm8iLCJhcHBJZCIsInF1b3RlQ29uZmlnIiwiYm9va0NvbmZpZyIsInRpbWVTYWxlQ29uZmlnIiwibG9naW5SZXF1ZXN0IiwibWFya2V0UmVxdWVzdCIsImJvb2tSZXF1ZXN0IiwidGltZVNhbGVzUmVxdWVzdCIsIndzVXJpIiwic3RyZWFtZXJTb2NrZXRVcmwiLCJjdXJyZW50UHJpY2UiLCJzdXJyb3VuZGluZ0tleUxldmVscyIsImNsb3NlUHJpY2UiLCJwb3NpdGlvblNldHVwIiwiZGVtYW5kWm9uZSIsInN1cHBseVpvbmUiLCJvcHRpb25TZWxlY3Rpb24iLCJzaWduYWxPcGVuUG9zaXRpb24iLCJwb3NpdGlvbiIsInF1YW50aXR5Iiwib3B0aW9uU3ltYm9sIiwiY3V0RmlsbGVkIiwiZGVtYW5kT3JTdXBwbHkiLCJyZW1haW5pbmdRdWFudGl0eSIsInNpZ25hbENsb3NlUG9zaXRpb24iLCJvcmRlcklkIl0sInNvdXJjZVJvb3QiOiIifQ==