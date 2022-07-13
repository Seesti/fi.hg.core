// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { hasNoOtherKeysInDevelopment, isNull, isNumber, isRegularObject, isString } from "../../modules/lodash";
import { HeadersObject, isHeadersObject } from "../../request/types/HeadersObject";

export interface MailHogContentDTO {
    readonly Body : string;
    readonly Headers : HeadersObject;
    readonly MIME : null;
    readonly Size : number;
}

export function isMailHogContentDTO (value: any): value is MailHogContentDTO {
    return (
        isRegularObject(value)
        && hasNoOtherKeysInDevelopment(value, [
            'Body'
            , 'Headers'
            , 'MIME'
            , 'Size'
        ])
        && isString(value?.Body)
        && isHeadersObject(value?.Headers)
        && isNull(value?.MIME)
        && isNumber(value?.Size)
    );
}

export function stringifyMailHogContentDTO (value: MailHogContentDTO): string {
    return `MailHogContentDTO(${value})`;
}

export function parseMailHogContentDTO (value: any): MailHogContentDTO | undefined {
    if ( isMailHogContentDTO(value) ) return value;
    return undefined;
}
