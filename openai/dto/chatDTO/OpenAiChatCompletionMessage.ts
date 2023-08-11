// Copyright (c) 2022. Heusala Group <info@heusalagroup.fi>. All rights reserved.



import {explainOpenAiUserType, isOpenAiUserType, OpenAiUserType, parseOpenAiUserType} from "../../types/OpenAiUserType";
import {explainRegularObject, isRegularObject} from "../../../types/RegularObject";
import {explainNoOtherKeys, hasNoOtherKeysInDevelopment} from "../../../types/OtherKeys";
import {explainString, explainStringOrUndefined, isString, isStringOrUndefined} from "../../../types/String";
import {explain, explainProperty} from "../../../types/explain";
import {
     explainOpenAiChatCompletionFunctionCallOrUndefined,
    isOpenAiChatCompletionFunctionCall, isOpenAiChatCompletionFunctionCallOrUndefined,
    OpenAiChatCompletionFunctionCall
} from "./OpenAiChatCompletionFunctionCall";

export interface OpenAiChatCompletionMessage {

    /**
     * The role of the messages author. One of system, user, assistant, or function.
     */
    role                    : OpenAiUserType;

    /**
     * The contents of the message.
     * content is required for all messages, and may be null for assistant messages with function calls.
     */
    content                 : string;

    /**
     * The name of the author of this message.
     * name is required if role is function, and it should be the name of the function
     * whose response is in the content
     */
    name                   ?: string;

    /**
     * The name and arguments of a function that should be called, as generated by the model.
     */
    function_call          ?: OpenAiChatCompletionFunctionCall
}

export function createOpenAiChatCompletionMessage (
    role                    :OpenAiUserType,
    content                 :string,
    name                   ?:string,
    function_call          ?:OpenAiChatCompletionFunctionCall,
) : OpenAiChatCompletionMessage {
    return {
        role,
        content,
        ...(isString(name) ? {name} : {}),
        ...(isOpenAiChatCompletionFunctionCall(function_call) ? {function_call} : {})
    }
}

export function isOpenAiChatCompletionMessage (value: unknown): value is OpenAiChatCompletionMessage {
    return (
        isRegularObject(value)
        && hasNoOtherKeysInDevelopment(value, [
            "role",
            "content",
            "name",
            "function_call"
        ])
        && isOpenAiUserType(parseOpenAiUserType(value?.role))
        && isString(value?.content)
        && isStringOrUndefined(value?.name)
        && isOpenAiChatCompletionFunctionCallOrUndefined(value?.function_call)
    )
};

/**
 * Explain why the given value is not an `OpenAiCompletionRequest` object.
 *
 * @param {unknown} value - The value to test.
 * @returns {string} A human-readable message explaining why the value is not an `OpenAiCompletionRequest` object, or `'ok'` if it is.
 */
export function explainOpenAiChatCompletionMessage (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeys(value, [
                "role",
                "content",
                "name",
                "function_call"
            ])
            , explainProperty("role", explainOpenAiUserType(parseOpenAiUserType(value.role)))
            , explainProperty("content", explainString(value.content))
            , explainProperty("name", explainStringOrUndefined(value?.name))
            , explainProperty("function_call", explainOpenAiChatCompletionFunctionCallOrUndefined(value?.function_call))
        ]
    );
}