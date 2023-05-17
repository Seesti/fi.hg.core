// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { PgFunctionBuilder } from "./PgFunctionBuilder";
import { QueryBuilder } from "../../../query/types/QueryBuilder";

/**
 * This generates formulas like `array_agg([DISTINCT] formula)`
 */
export class PgJsonAggBuilder extends PgFunctionBuilder {

    protected constructor (
        distinct : boolean,
        name     : string
    ) {
        super(distinct, name);
    }

    public static create (
        builder: QueryBuilder,
        distinct: boolean
    ) : PgJsonAggBuilder {
        const f = new PgJsonAggBuilder(distinct, 'jsonb_agg');
        f.setFormulaFromQueryBuilder(builder);
        return f;
    }

    public valueOf () {
        return this.toString();
    }

    public toString () : string {
        return `PgJsonAggBuilder "${this.buildQueryString()}" with ${this.buildQueryValues().map(item=>item()).join(' ')}`;
    }

}
