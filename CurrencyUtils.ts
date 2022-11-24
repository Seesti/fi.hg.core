// Copyright (c) 2022. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Currency } from "./types/Currency";
import { get } from "./modules/lodash";
import { CurrencyRates } from "./types/CurrencyRates";

export class CurrencyUtils {

    public static stringifySum (
        sum : number
    ) : string {
        return (Math.round(sum*100)/100).toFixed(2);
    }

    public static getSum (
        price  : number,
        amount : number
    ): number {
        return amount * price;
    }

    public static getSumWithVat (
        price      : number,
        amount     : number,
        vatPercent : number
    ): number {
        return amount * price * (1+vatPercent);
    }

    public static getSumWithDiscount (
        price           : number,
        discountPercent : number | undefined
    ): number {
        return discountPercent ? price - price * discountPercent : price;
    }

    public static getVatlessSum (
        sum: number,
        vatPercent: number
    ) : number {
        return sum / (1+vatPercent);
    }

    public static roundByAccuracy (
        value: number,
        accuracy: number
    ) {
        const m = Math.pow(10, accuracy);
        return Math.round(value * m) / m;
    }

    public static convertCurrencyAmount (
        rates     : CurrencyRates,
        amount    : number,
        from      : Currency,
        to        : Currency,
        accuracy  : number = 10
    ) : number {
        const toRate = get(rates, to);
        if (toRate === undefined) throw new TypeError(`CurrencyService: To: No exchange rate found: ${to}`);
        const fromRate = get(rates, from);
        if (fromRate === undefined) throw new TypeError(`CurrencyService: From: No exchange rate found: ${from}`);
        return CurrencyUtils.roundByAccuracy( (amount / fromRate) * toRate, accuracy);
    }

}
