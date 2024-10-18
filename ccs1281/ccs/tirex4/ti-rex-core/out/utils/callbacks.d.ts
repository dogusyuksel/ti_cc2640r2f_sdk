export declare function isError<ErrorType, ResultType>(err: null | ErrorType, _result?: ResultType): _result is undefined;
export declare function isOk<ErrorType, ResultType>(err: null | ErrorType, _result?: ResultType): _result is ResultType;
export declare type CallbackFn<ErrorType, ResultType> = (err: null | ErrorType, result?: ResultType) => void;
