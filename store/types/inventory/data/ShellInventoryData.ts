// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import {
    explain,
    explainNoOtherKeys,
    explainNumber,
    explainProperty,
    explainRegularObject,
    explainString,
    hasNoOtherKeys,
    isNumber,
    isRegularObject,
    isString
} from "../../../../modules/lodash";
import { InventoryData } from "./InventoryData";

export interface ShellInventoryData extends InventoryData {

    readonly hostname  : string;

    /**
     * SSH Port, defaults to 22.
     */
    readonly port      : number;

    readonly username  : string;

    /**
     * Note! Other users of the server may see this
     */
    readonly realName  : string;

}

export function createShellInventoryData (
    hostname: string,
    username: string,
    realName: string,
    port ?: number
): ShellInventoryData {
    return {
        hostname,
        username,
        realName,
        port: port ?? 22
    };
}

export function isShellInventoryData (value: any): value is ShellInventoryData {
    return (
        isRegularObject(value)
        && hasNoOtherKeys(value, [
            'hostname',
            'port',
            'username',
            'realName'
        ])
        && isString(value?.hostname)
        && isString(value?.username)
        && isString(value?.realName)
        && isNumber(value?.port)
    );
}

export function explainShellInventoryData (value: any): string {
    return explain(
        [
            explainRegularObject(value)
            && explainNoOtherKeys(value, [
                'hostname',
                'port',
                'username',
                'realName'
            ])
            && explainProperty("hostname", explainString(value?.hostname))
            && explainProperty("port", explainNumber(value?.port))
            && explainProperty("username", explainString(value?.username))
            && explainProperty("realName", explainString(value?.realName))
        ]
    );
}

export function stringifyShellInventoryData (value: ShellInventoryData): string {
    return `ShellInventoryData(${value})`;
}

export function parseShellInventoryData (value: any): ShellInventoryData | undefined {
    if ( isShellInventoryData(value) ) return value;
    return undefined;
}
