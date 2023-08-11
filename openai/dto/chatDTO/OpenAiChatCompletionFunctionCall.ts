// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.



import {explainRegularObject, explainRegularObjectOrUndefined, isRegularObject} from "../../../types/RegularObject";
import {explainNoOtherKeys, hasNoOtherKeysInDevelopment} from "../../../types/OtherKeys";
import {explainString, explainStringOrUndefined, isString} from "../../../types/String";
import {explain, explainNot, explainOk, explainProperty} from "../../../types/explain";
import {isUndefined} from "../../../types/undefined";
import {OpenAiChatCompletionFunctions} from "./OpenAiChatCompletionFunctions";

export interface OpenAiChatCompletionFunctionCall {
    /**
     * The name of the function to call.
     */
    name                        : string;

    /**
     * The arguments to call the function with, as generated by the model in JSON format.
     * Note that the model does not always generate valid JSON,
     * and may hallucinate parameters not defined by your function schema.
     * Validate the arguments in your code before calling your function.
     */
    args                        : string;
}

export function createOpenAiChatCompletionFunctionCall (
    name                        :string,
    args                        :string
) : OpenAiChatCompletionFunctionCall {
    return {
        name,
        args,
    }
}

export function isOpenAiChatCompletionFunctionCall (value: unknown): value is OpenAiChatCompletionFunctionCall {
    return (
        isRegularObject(value)
        && hasNoOtherKeysInDevelopment(value, [
            "name",
            "args",
        ])
        && isString(value?.name)
        && isString(value?.args)
    )
};

/**
 * Explain why the given value is not an `OpenAiCompletionRequestDTO` object.
 *
 * @param {unknown} value - The value to test.
 * @returns {string} A human-readable message explaining why the value is not an `OpenAiCompletionRequestDTO` object, or `'ok'` if it is.
 */
export function explainOpenAiChatCompletionFunctionCall (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeys(value, [
                "name",
                "args",
            ])
            , explainProperty("name", explainString((value as any)?.name))
            , explainProperty("args", explainString((value as any)?.args))
        ]
    );
}

export function isOpenAiChatCompletionFunctionCallOrUndefined (value: unknown): value is OpenAiChatCompletionFunctions | undefined {
    return isOpenAiChatCompletionFunctionCall(value) || isUndefined(value);
}

export function explainOpenAiChatCompletionFunctionCallOrUndefined (value: any): string {
    return isOpenAiChatCompletionFunctionCallOrUndefined(value) ? explainOk() : explainNot('OpenAiChatCompletionFunctionCall or undefined');
}