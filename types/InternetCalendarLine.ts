// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { hasNoOtherKeys, isArrayOf, isRegularObject, isString } from "../modules/lodash";
import { InternetCalendarParam, isInternetCalendarParam } from "./InternetCalendarParam";

export interface InternetCalendarLine {
    readonly name   : string;
    readonly params : InternetCalendarParam[];
    readonly value  : string;
}

export function createInternetCalendarLine (
    name: string,
    value : string,
    params : InternetCalendarParam[] = []
): InternetCalendarLine {
    return {
        name,
        value,
        params
    };
}

export function isInternetCalendarLine (value: any): value is InternetCalendarLine {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'name',
            'params',
            'value'
        ])
        && isString(value?.name)
        && isArrayOf<InternetCalendarParam>(value?.params, isInternetCalendarParam)
        && isString(value?.value)
    );
}

export function stringifyInternetCalendarLine (value: InternetCalendarLine): string {
    return `InternetCalendarLine(${value})`;
}

export function parseInternetCalendarLine (value: any): InternetCalendarLine | undefined {
    if ( isInternetCalendarLine(value) ) return value;
    return undefined;
}
