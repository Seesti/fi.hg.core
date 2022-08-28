// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    explain,
    explainNoOtherKeys,
    explainProperty,
    explainRegularObject, explainString, explainStringArray,
    hasNoOtherKeys,
    isRegularObject, isString, isStringArray
} from "../../../modules/lodash";
import { explainJokerStringObject, isJokerStringObject, JokerStringObject } from "../../../../node/com/joker/dmapi/types/JokerStringObject";

/**
 *
 * @see https://joker.com/faq/content/79/455/en/query_whois.html
 */
export interface JokerComApiWhoisContactDTO {
    readonly headers      : JokerStringObject;
    readonly body         : JokerStringObject;
    readonly name         : string;
    readonly organization : string;
    readonly address      : readonly string[];
    readonly city         : string;
    readonly postalCode   : string;
    readonly country      : string;
    readonly email        : string;
    readonly phone        : string;
    readonly handle       : string;
    readonly created      : string;
    readonly modified     : string;
}

export function createJokerComApiWhoisContactDTO (
    name         : string,
    organization : string,
    address      : readonly string[],
    city         : string,
    postalCode   : string,
    country      : string,
    email        : string,
    phone        : string,
    handle       : string,
    created      : string,
    modified     : string,
    headers      : JokerStringObject,
    body         : JokerStringObject
) : JokerComApiWhoisContactDTO {
    return {
        name,
        organization,
        address,
        city,
        postalCode,
        country,
        email,
        phone,
        handle,
        created,
        modified,
        headers,
        body
    };
}

export function isJokerComApiWhoisContactDTO (value: any) : value is JokerComApiWhoisContactDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'name',
            'organization',
            'address',
            'city',
            'postalCode',
            'country',
            'email',
            'phone',
            'handle',
            'created',
            'modified',
            'headers',
            'body'
        ])
        && isString(value?.name)
        && isString(value?.organization)
        && isStringArray(value?.address)
        && isString(value?.city)
        && isString(value?.postalCode)
        && isString(value?.country)
        && isString(value?.email)
        && isString(value?.phone)
        && isString(value?.handle)
        && isString(value?.created)
        && isString(value?.modified)
        && isJokerStringObject(value?.headers)
        && isJokerStringObject(value?.body)
    );
}

export function explainJokerComApiWhoisContactDTO (value: any) : string {
    return explain(
        [
            explainRegularObject(value),
            explainNoOtherKeys(value, [
                'name',
                'organization',
                'address',
                'city',
                'postalCode',
                'country',
                'email',
                'phone',
                'handle',
                'created',
                'modified',
                'headers',
                'body'
            ]),
            explainProperty("organization", explainString(value?.organization)),
            explainProperty("address", explainStringArray(value?.address)),
            explainProperty("city", explainString(value?.city)),
            explainProperty("postalCode", explainString(value?.postalCode)),
            explainProperty("country", explainString(value?.country)),
            explainProperty("email", explainString(value?.email)),
            explainProperty("phone", explainString(value?.phone)),
            explainProperty("handle", explainString(value?.handle)),
            explainProperty("created", explainString(value?.created)),
            explainProperty("modified", explainString(value?.modified)),
            explainProperty("headers", explainJokerStringObject(value?.headers)),
            explainProperty("body", explainJokerStringObject(value?.body))
        ]
    );
}

export function stringifyJokerComApiWhoisContactDTO (value : JokerComApiWhoisContactDTO) : string {
    return `JokerComApiWhoisContactDTO(${value})`;
}

export function parseJokerComApiWhoisContactDTO (value: any) : JokerComApiWhoisContactDTO | undefined {
    if (isJokerComApiWhoisContactDTO(value)) return value;
    return undefined;
}
