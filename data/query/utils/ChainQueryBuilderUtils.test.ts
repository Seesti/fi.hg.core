// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { ChainQueryBuilder, ChainQueryBuilderFactory } from "../types/ChainQueryBuilder";
import { ChainQueryBuilderUtils } from "./ChainQueryBuilderUtils";
import { EntityField } from "../../types/EntityField";
import { Where } from "../../Where";
import { TemporalProperty } from "../../types/TemporalProperty";

describe('ChainQueryBuilderUtils', () => {

    describe('#buildChain', () => {

        let mockAndBuilder: ChainQueryBuilder;
        let mockOrBuilder: ChainQueryBuilder;

        let mockAndBuilderFactory: ChainQueryBuilderFactory;
        let mockOrBuilderFactory: ChainQueryBuilderFactory;

        beforeEach(() => {
            mockAndBuilder = {
                valueOf: jest.fn().mockReturnValue('and'),
                toString: jest.fn().mockReturnValue('and'),
                setColumnInList: jest.fn(),
                setColumnEquals: jest.fn(),
                setColumnEqualsAsJson: jest.fn(),
                setColumnIsNull: jest.fn(),
                setColumnBetween: jest.fn(),
                setColumnAfter: jest.fn(),
                setColumnBefore: jest.fn(),
                setColumnInListAsTime: jest.fn(),
                setColumnEqualsAsTime: jest.fn(),
                setColumnBetweenAsTime: jest.fn(),
                setColumnAfterAsTime: jest.fn(),
                setColumnBeforeAsTime: jest.fn(),
                setFromQueryBuilder: jest.fn(),
                build: jest.fn().mockReturnValue(['and', []]),
                buildQueryString: jest.fn().mockReturnValue('and'),
                buildQueryValues: jest.fn().mockReturnValue([]),
                getQueryValueFactories: jest.fn().mockReturnValue([]),
            };
            mockAndBuilderFactory = jest.fn().mockReturnValue(mockAndBuilder);

            mockOrBuilder = {
                valueOf: jest.fn().mockReturnValue('or'),
                toString: jest.fn().mockReturnValue('or'),
                setColumnInList: jest.fn(),
                setColumnEquals: jest.fn(),
                setColumnEqualsAsJson: jest.fn(),
                setColumnIsNull: jest.fn(),
                setColumnBetween: jest.fn(),
                setColumnAfter: jest.fn(),
                setColumnBefore: jest.fn(),
                setColumnInListAsTime: jest.fn(),
                setColumnEqualsAsTime: jest.fn(),
                setColumnBetweenAsTime: jest.fn(),
                setColumnAfterAsTime: jest.fn(),
                setColumnBeforeAsTime: jest.fn(),
                setFromQueryBuilder: jest.fn(),
                build: jest.fn().mockReturnValue(['or', []]),
                buildQueryString: jest.fn().mockReturnValue('or'),
                buildQueryValues: jest.fn().mockReturnValue([]),
                getQueryValueFactories: jest.fn().mockReturnValue([]),
            };

            mockOrBuilderFactory = jest.fn().mockReturnValue(mockOrBuilder);
        });

        it('builds chain for equal condition', () => {
            const where = Where.propertyEquals('city', 'New York');
            const completeTableName = 'tableName';
            const fields: EntityField[] = [{ propertyName: 'city', columnName: 'city_column' } as EntityField];
            const temporalProperties : TemporalProperty[] = [];

            ChainQueryBuilderUtils.buildChain(mockAndBuilder, where, completeTableName, fields, temporalProperties, mockAndBuilderFactory, mockOrBuilderFactory);

            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledWith(completeTableName, 'city_column', 'New York');
            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledTimes(1);

            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledTimes(0);
            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenCalledTimes(0);
            expect(mockOrBuilderFactory).toHaveBeenCalledTimes(0);
            expect(mockAndBuilderFactory).toHaveBeenCalledTimes(0);

        });

        it('builds chain for before condition', () => {
            const where = Where.propertyBefore('age', 30);
            const completeTableName = 'tableName';
            const fields: EntityField[] = [{ propertyName: 'age', columnName: 'age_column' } as EntityField];
            const temporalProperties : TemporalProperty[] = [];

            ChainQueryBuilderUtils.buildChain(mockAndBuilder, where, completeTableName, fields, temporalProperties, mockAndBuilderFactory, mockOrBuilderFactory);

            expect(mockAndBuilder.setColumnBefore).toHaveBeenCalledWith(completeTableName, 'age_column', 30);
            expect(mockAndBuilder.setColumnBefore).toHaveBeenCalledTimes(1);

            expect(mockAndBuilder.setColumnAfter).toHaveBeenCalledTimes(0);
            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledTimes(0);
            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledTimes(0);
            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenCalledTimes(0);
            expect(mockOrBuilderFactory).toHaveBeenCalledTimes(0);
            expect(mockAndBuilderFactory).toHaveBeenCalledTimes(0);

        });

        it('builds chain for after condition', () => {
            const where = Where.propertyAfter('age', 30);
            const completeTableName = 'tableName';
            const fields: EntityField[] = [{ propertyName: 'age', columnName: 'age_column' } as EntityField];
            const temporalProperties : TemporalProperty[] = [];

            ChainQueryBuilderUtils.buildChain(mockAndBuilder, where, completeTableName, fields, temporalProperties, mockAndBuilderFactory, mockOrBuilderFactory);

            expect(mockAndBuilder.setColumnAfter).toHaveBeenCalledWith(completeTableName, 'age_column', 30);
            expect(mockAndBuilder.setColumnAfter).toHaveBeenCalledTimes(1);

            expect(mockAndBuilder.setColumnBefore).toHaveBeenCalledTimes(0);
            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledTimes(0);
            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledTimes(0);
            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenCalledTimes(0);
            expect(mockOrBuilderFactory).toHaveBeenCalledTimes(0);
            expect(mockAndBuilderFactory).toHaveBeenCalledTimes(0);

        });

        it('builds chain for between condition', () => {
            const where = Where.propertyBetween('age', 18, 30);
            const completeTableName = 'tableName';
            const fields: EntityField[] = [{ propertyName: 'age', columnName: 'age_column' } as EntityField];
            const temporalProperties : TemporalProperty[] = [];

            ChainQueryBuilderUtils.buildChain(mockAndBuilder, where, completeTableName, fields, temporalProperties, mockAndBuilderFactory, mockOrBuilderFactory);

            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledWith(completeTableName, 'age_column', 18, 30);
            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledTimes(1);

            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledTimes(0);
            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenCalledTimes(0);
            expect(mockOrBuilderFactory).toHaveBeenCalledTimes(0);
            expect(mockAndBuilderFactory).toHaveBeenCalledTimes(0);
        });

        it('builds chain for AndCondition', () => {

            const where = Where.and(
                Where.propertyEquals('city', 'New York'),
                Where.propertyEquals('age', 25)
            );
            const completeTableName = 'tableName';
            const fields: EntityField[] = [
                { propertyName: 'city', columnName: 'city_column' } as EntityField,
                { propertyName: 'age', columnName: 'age_column' } as EntityField
            ];
            const temporalProperties : TemporalProperty[] = [];

            ChainQueryBuilderUtils.buildChain(mockAndBuilder, where, completeTableName, fields, temporalProperties, mockAndBuilderFactory, mockOrBuilderFactory);

            expect(mockAndBuilder.setColumnEquals).toHaveBeenNthCalledWith(1, "tableName", "city_column", "New York");
            expect(mockAndBuilder.setColumnEquals).toHaveBeenNthCalledWith(2, "tableName", "age_column", 25);
            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledTimes(2);

            expect(mockAndBuilder.setFromQueryBuilder).toHaveBeenCalledTimes(0);
            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledTimes(0);
            expect(mockOrBuilderFactory).toHaveBeenCalledTimes(0);
            expect(mockAndBuilderFactory).toHaveBeenCalledTimes(0);

        });

        it('builds chain for OrCondition', () => {
            const where = Where.or(
                Where.propertyEquals('city', 'New York'),
                Where.propertyEquals('city', 'Los Angeles')
            );
            const completeTableName = 'tableName';
            const fields: EntityField[] = [{ propertyName: 'city', columnName: 'city_column' } as EntityField];
            const temporalProperties : TemporalProperty[] = [];

            ChainQueryBuilderUtils.buildChain(mockOrBuilder, where, completeTableName, fields,temporalProperties, mockAndBuilderFactory, mockOrBuilderFactory);

            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenCalledTimes(1);
            expect(mockOrBuilderFactory).toHaveBeenCalledTimes(1);

            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledTimes(0);
            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledTimes(0);
            expect(mockAndBuilderFactory).toHaveBeenCalledTimes(0);

        });

        it('builds chain for OrCondition', () => {
            const where = Where.or(
                Where.and(
                    Where.propertyEquals('city', 'New York'),
                    Where.propertyEquals('city', 'Los Angeles')
                ),
                Where.and(
                    Where.propertyEquals('age', 18),
                    Where.propertyEquals('age', 30)
                )
            );
            const completeTableName = 'tableName';
            const fields: EntityField[] = [
                { propertyName: 'age', columnName: 'age_column' } as EntityField,
                { propertyName: 'city', columnName: 'city_column' } as EntityField
            ];
            const temporalProperties : TemporalProperty[] = [];

            ChainQueryBuilderUtils.buildChain(mockOrBuilder, where, completeTableName, fields, temporalProperties, mockAndBuilderFactory, mockOrBuilderFactory);

            expect(mockAndBuilder.setColumnEquals).toHaveBeenNthCalledWith(1, "tableName", "city_column", "New York");
            expect(mockAndBuilder.setColumnEquals).toHaveBeenNthCalledWith(2, "tableName", "city_column", "Los Angeles");
            expect(mockAndBuilder.setColumnEquals).toHaveBeenNthCalledWith(3, "tableName", "age_column", 18);
            expect(mockAndBuilder.setColumnEquals).toHaveBeenNthCalledWith(4, "tableName", "age_column", 30);
            expect(mockAndBuilder.setColumnEquals).toHaveBeenCalledTimes(4);

            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenNthCalledWith(1, mockAndBuilder);
            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenNthCalledWith(2, mockAndBuilder);
            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenNthCalledWith(3, mockOrBuilder);
            expect(mockOrBuilder.setFromQueryBuilder).toHaveBeenCalledTimes(3);

            expect(mockAndBuilderFactory).toHaveBeenNthCalledWith(1);
            expect(mockAndBuilderFactory).toHaveBeenNthCalledWith(2);
            expect(mockAndBuilderFactory).toHaveBeenCalledTimes(2);

            expect(mockOrBuilderFactory).toHaveBeenNthCalledWith(1);
            expect(mockOrBuilderFactory).toHaveBeenCalledTimes(1);

            expect(mockAndBuilder.setColumnBetween).toHaveBeenCalledTimes(0);

        });

    });

});
