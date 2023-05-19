// Copyright (c) 2023. Heusala Group Oy <info@heusalagroup.fi>. All rights reserved.

import { Persister } from "../../types/Persister";
import { Entity, EntityIdTypes } from "../../Entity";
import { EntityMetadata } from "../../types/EntityMetadata";
import { first } from "../../../functions/first";
import { isArray } from "../../../types/Array";
import { has } from "../../../functions/has";
import { filter } from "../../../functions/filter";
import { some } from "../../../functions/some";
import { map } from "../../../functions/map";
import { find } from "../../../functions/find";
import { forEach } from "../../../functions/forEach";
import { EntityRelationOneToMany } from "../../types/EntityRelationOneToMany";
import { PersisterMetadataManager } from "../types/PersisterMetadataManager";
import { PersisterMetadataManagerImpl } from "../types/PersisterMetadataManagerImpl";
import { LogLevel } from "../../../types/LogLevel";
import { LogService } from "../../../LogService";
import { EntityUtils } from "../../utils/EntityUtils";
import { EntityField } from "../../types/EntityField";
import { EntityRelationManyToOne } from "../../types/EntityRelationManyToOne";
import { Sort } from "../../Sort";
import { Where } from "../../Where";
import { createMemoryItem, MemoryItem } from "./types/MemoryItem";
import { createMemoryTable, MemoryTable } from "./types/MemoryTable";
import { MemoryIdType } from "./types/MemoryIdType";
import { MemoryValueUtils } from "./utils/MemoryValueUtils";
import { PersisterType } from "../types/PersisterType";
import { PersisterEntityManager } from "../types/PersisterEntityManager";
import { PersisterEntityManagerImpl } from "../types/PersisterEntityManagerImpl";

const LOG = LogService.createLogger('MemoryPersister');

/**
 * Internal ID sequencer for memory items
 */
let ID_SEQUENCER = 0;

/**
 * This persister stores everything in the process memory. It is useful for
 * development purposes.
 *
 * @see {@link Persister}
 */
export class MemoryPersister implements Persister {

    /**
     * Set log level
     * @param level
     */
    public static setLogLevel (level: LogLevel) {
        LOG.setLogLevel(level);
    }

    private readonly _idType : MemoryIdType;
    private readonly _data : { [tableName: string] : MemoryTable };
    private readonly _metadataManager : PersisterMetadataManager;
    private readonly _entityManager : PersisterEntityManager;

    /**
     *
     * @param idType
     * @FIXME: The `idType` should probably be detected from metadata and changeable through annotations
     */
    constructor (
        idType ?: MemoryIdType
    ) {
        this._data = {};
        this._idType = idType ?? MemoryIdType.STRING;
        this._metadataManager = new PersisterMetadataManagerImpl();
        this._entityManager = PersisterEntityManagerImpl.create();
    }

    /**
     * @inheritDoc
     * @see {@link Persister.getPersisterType}
     */
    public getPersisterType (): PersisterType {
        return PersisterType.MEMORY;
    }

    /**
     * @inheritDoc
     * @see {@link Persister.destroy}
     */
    public destroy (): void {
    }

    /**
     * @inheritDoc
     * @see {@link Persister.setupEntityMetadata}
     * @see {@link PersisterMetadataManager.setupEntityMetadata}
     */
    public setupEntityMetadata (metadata: EntityMetadata) : void {
        this._metadataManager.setupEntityMetadata(metadata);
    }

    /**
     * @inheritDoc
     * @see {@link Persister.count}
     */
    public async count<T extends Entity, ID extends EntityIdTypes> (
        metadata : EntityMetadata,
        where    : Where | undefined,
    ): Promise<number> {
        const tableName = metadata.tableName;
        if (!has(this._data, tableName)) return 0;
        const matcher = where !== undefined ? MemoryValueUtils.buildMatcherFunctionFromWhereUsingAnd(where) : undefined;
        if (matcher) {
            return filter(
                this._data[tableName].items,
                (item: MemoryItem) : boolean => matcher(item.value)
            ).length;
        }
        return this._data[tableName].items.length;
    }

    /**
     * @inheritDoc
     * @see {@link Persister.existsBy}
     */
    public async existsBy<T extends Entity, ID extends EntityIdTypes> (
        metadata : EntityMetadata,
        where    : Where,
    ): Promise<boolean> {
        const tableName = metadata.tableName;
        if (!has(this._data, tableName)) return false;
        const matcher = MemoryValueUtils.buildMatcherFunctionFromWhereUsingAnd(where);
        return some(
            this._data[tableName].items,
            (item: MemoryItem) : boolean => matcher(item.value)
        );
    }

    /**
     * @inheritDoc
     * @see {@link Persister.deleteAll}
     */
    public async deleteAll<T extends Entity, ID extends EntityIdTypes> (
        metadata : EntityMetadata,
        where    : Where | undefined,
    ): Promise<void> {
        const tableName = metadata.tableName;
        if (!has(this._data, tableName)) return;
        const matcher = where !== undefined ? MemoryValueUtils.buildMatcherFunctionFromWhereUsingAnd(where) : undefined;
        if ( matcher !== undefined ) {
            this._data[tableName].items = filter(
                this._data[tableName].items,
                (item: MemoryItem) : boolean => !matcher(item.value)
            );
            return;
        }
        delete this._data[tableName];
    }

    /**
     * @inheritDoc
     * @see {@link Persister.findAll}
     */
    public async findAll<T extends Entity, ID extends EntityIdTypes> (
        metadata : EntityMetadata,
        where    : Where | undefined,
        sort     : Sort | undefined
    ): Promise<T[]> {
        LOG.debug(`findAll: `, metadata, where, sort);
        const tableName = metadata.tableName;
        if (!has(this._data, tableName)) return [];
        const matcher = where !== undefined ? MemoryValueUtils.buildMatcherFunctionFromWhereUsingAnd(where) : undefined;
        const allItems = this._data[tableName].items;
        const matchedItems = matcher !== undefined ? filter(allItems, (item: MemoryItem) : boolean => matcher(item.value)) : allItems;
        const items : T[] = this._prepareItemList(matchedItems, metadata, true, sort);
        const ret : T[] = this._populateRelationsToList(items, metadata);
        LOG.debug(`findAll: returns: items 2: ${ret.length}`);
        this._entityManager.saveLastEntityListState<T>(ret);
        return ret;
    }

    /**
     * @inheritDoc
     * @see {@link Persister.findBy}
     */
    public async findBy<T extends Entity, ID extends EntityIdTypes> (
        metadata : EntityMetadata,
        where    : Where,
        sort     : Sort | undefined
    ): Promise<T | undefined> {
        const tableName = metadata.tableName;
        if (!has(this._data, tableName)) return undefined;
        const matcher = MemoryValueUtils.buildMatcherFunctionFromWhereUsingAnd(where);
        const allItems = this._data[tableName].items;
        const matchedItems = matcher !== undefined ? filter(allItems, (item: MemoryItem) : boolean => matcher(item.value)) : allItems;
        const items : T[] = this._prepareItemList(matchedItems, metadata, true, sort);
        const item : T | undefined = first(items);
        if (item === undefined) return undefined;
        const entity = this._populateRelations( item, metadata );
        this._entityManager.saveLastEntityState<T>(entity);
        return entity;
    }

    /**
     * @inheritDoc
     * @see {@link Persister.insert}
     */
    public async insert<T extends Entity, ID extends EntityIdTypes> (
        metadata: EntityMetadata,
        entity: T | readonly T[],
    ): Promise<T> {

        const list = map(
            isArray(entity) ? entity : [entity],
            (item : T) : T => item.clone() as T
        );

        const tableName = metadata.tableName;
        const idPropertyName = metadata.idPropertyName;
        if(!has(this._data, tableName)) {
            this._data[tableName] = createMemoryTable();
        }
        const allIds = map(this._data[tableName].items, (item) => item.id);

        const newItems : MemoryItem[] = map(
            list,
            (item: T) : MemoryItem => {
                if ( !( has(item, idPropertyName) && (item as any)[idPropertyName]) ) {
                    const newId : number = ++ID_SEQUENCER;
                    (item as any)[idPropertyName] = this._idType === MemoryIdType.STRING ? `${newId}` : newId;
                }
                const id = (item as any)[idPropertyName];
                if (!id) {
                    throw new TypeError(`Entity cannot be saved with id as "${id}"`);
                }
                if (allIds.includes(id)) {
                    throw new TypeError(`Entity already stored with id "${id}"`);
                }
                allIds.push(id);
                return createMemoryItem(id, item);
            }
        );

        // Let's call this outside above loop for better error management
        forEach(
            newItems,
            (item) => {
                this._data[tableName].items.push(item);
            }
        );

        // FIXME: We should return more than one if there were more than one
        const firstItem = first(newItems);
        if (!firstItem) throw new TypeError(`Could not add items`);
        const addedEntity = this._populateRelations( this._prepareItem<T>(firstItem, metadata, true), metadata);
        this._entityManager.saveLastEntityState<T>(addedEntity);
        return addedEntity;
    }

    /**
     * @inheritDoc
     * @see {@link Persister.update}
     */
    public async update<T extends Entity, ID extends EntityIdTypes> (
        metadata: EntityMetadata,
        entity: T,
    ): Promise<T> {

        const { tableName, fields, idPropertyName } = metadata;

        const idField = find(fields, item => item.propertyName === idPropertyName);
        if (!idField) throw new TypeError(`Could not find id field using property "${idPropertyName}"`);
        const entityId = has(entity,idPropertyName) ? (entity as any)[idPropertyName] : undefined;
        if (!entityId) throw new TypeError(`Could not find entity id column using property "${idPropertyName}"`);

        const updateFields = this._entityManager.getChangedFields(
            entity,
            fields
        );

        if (updateFields.length === 0) {
            LOG.debug(`Entity did not any updatable properties changed. Saved nothing.`);
            const item : T | undefined = await this.findBy(
                metadata,
                Where.propertyEquals(idPropertyName, entityId),
                Sort.by(idPropertyName)
            );
            if (!item) {
                throw new TypeError(`Entity was not stored in this persister for ID: ${entityId}`);
            }
            return item;
        }

        entity = entity.clone() as T;

        if (!has(this._data, tableName)) {
            this._data[tableName] = createMemoryTable();
        }

        let savedItem : MemoryItem | undefined = find(
            this._data[tableName].items,
            (item: MemoryItem) : boolean => item.id === entityId
        );
        if (savedItem) {
            const savedValue = savedItem.value.clone() as T;
            forEach(
                updateFields,
                (field: EntityField) : void => {
                    const { propertyName } = field;
                    (savedValue as any)[propertyName] = (entity as any)[propertyName];
                }
            );
            savedItem.value = savedValue;
        } else {
            savedItem = createMemoryItem(entityId, entity);
            this._data[tableName].items.push( savedItem );
        }

        const savedEntity = this._populateRelations(savedItem.value.clone(), metadata);
        this._entityManager.saveLastEntityState<T>(savedEntity);
        return savedEntity as unknown as T;
    }

    /**
     * Find previously saved memory item from internal memory.
     *
     * @param callback The match callback
     * @param tableName The table to use for
     * @returns The item if found, otherwise `undefined`
     * @private
     */
    private _findItem<T extends Entity, ID extends EntityIdTypes> (
        callback: (item: MemoryItem) => boolean,
        tableName: string
    ) : MemoryItem | undefined {
        if (!has(this._data, tableName)) return undefined;
        const item = find(this._data[tableName].items, callback);
        if (!item) return undefined;
        return item;
    }

    /**
     * Filters memory items based on the callback result
     *
     * @param callback The test callback
     * @param tableName The table to use
     * @returns The filtered items
     * @private
     */
    private _filterItems (
        callback : (item: MemoryItem) => boolean,
        tableName : string
    ): MemoryItem[] {
        if (!has(this._data, tableName)) return [];
        return filter(this._data[tableName].items, callback);
    }

    /**
     * Returns cloned entities, save to pass outside.
     *
     * @param items
     * @param metadata
     * @param simplify If true, any external relations will be nullified.
     * @param sort
     * @private
     */
    private _prepareItemList<T extends Entity> (
        items    : readonly MemoryItem[],
        metadata : EntityMetadata,
        simplify : boolean,
        sort     : Sort | undefined
    ) : T[] {
        const sortFunction = sort ? sort.getSortFunction() : undefined;
        const list = map(items, (item: MemoryItem) : T => this._prepareItem(item, metadata, simplify));
        if (sortFunction) {
            list.sort(sortFunction);
        }
        return list;
    }

    /**
     * Returns the cloned entity, save to pass outside.
     *
     * This will also populate relate linked resources.
     *
     * @param item The item to clone
     * @param metadata
     * @param simplify If true, any external relations will be nullified.
     * @private
     */
    private _prepareItem<T extends Entity> (
        item: MemoryItem,
        metadata: EntityMetadata,
        simplify: boolean
    ) : T {
        if (simplify) {
            return EntityUtils.removeEntityRelations<T>(item.value as T, metadata);
        }
        return item.value.clone() as T;
    }

    /**
     * Populates relations to complete list of entities
     */
    private _populateRelationsToList<T extends Entity> (
        list: readonly T[],
        metadata: EntityMetadata
    ) : T[] {
        return map(
            list,
            (item) => this._populateRelations(item, metadata)
        );
    }

    /**
     * Returns the cloned entity, save to pass outside.
     *
     * This will also populate relate linked resources.
     *
     * @param entity The item to populate.
     * @param metadata
     * @private
     */
    private _populateRelations<T extends Entity> (
        entity: T,
        metadata: EntityMetadata
    ) : T {
        entity = entity.clone() as T;
        LOG.debug(`_populateRelations: entity = `, entity);
        entity = this._populateOneToManyRelations(entity, metadata);
        LOG.debug(`_populateRelations: oneToMany: `, entity);
        entity = this._populateManyToOneRelations(entity, metadata);
        LOG.debug(`_populateRelations: returns: `, entity);
        return entity;
    }

    /**
     * Returns the cloned entity, save to pass outside.
     *
     * This will also populate relate linked resources.
     *
     * @param entity The item to populate. Note! We don't clone this!
     * @param metadata
     * @private
     */
    private _populateOneToManyRelations<T extends Entity> (
        entity: T,
        metadata: EntityMetadata
    ) : T {
        const tableName = metadata.tableName;
        const idPropertyName = metadata.idPropertyName;
        const entityId : string | number | undefined = has(entity, idPropertyName) ? (entity as any)[idPropertyName] as string|number : undefined;
        LOG.debug(`_populateOneToManyRelations: 0. entityId = `, entityId, entity, idPropertyName, tableName);
        const oneToManyRelations = metadata?.oneToManyRelations;

        if (oneToManyRelations?.length) {
            forEach(
                oneToManyRelations,
                (oneToMany: EntityRelationOneToMany) => {

                    let { propertyName, mappedBy, mappedTable } = oneToMany;
                    LOG.debug(`_populateOneToManyRelations: "${propertyName}": 1. oneToMany = `, mappedBy, mappedTable);

                    if ( !(mappedTable && mappedBy) ) {
                        throw new TypeError( `No link to table exists to populate property "${propertyName}" in table "${tableName}"` );
                    }

                    const manyToOneMetadata = this._metadataManager.getMetadataByTable( mappedTable );
                    LOG.debug( `_populateOneToManyRelations: "${propertyName}": 2. mappedToMetadata = `, manyToOneMetadata );
                    if ( !manyToOneMetadata ) {
                        throw new TypeError( `Could not find metadata for linked table "${mappedTable} to populate property "${propertyName}" in table "${tableName}"` );
                    }

                    const manyToOneFieldInfo: EntityField | undefined = find( manyToOneMetadata.fields, (field: EntityField): boolean => field.propertyName === mappedBy );
                    LOG.debug( `_populateOneToManyRelations: "${propertyName}": 3. joinColumn = `, manyToOneFieldInfo );
                    if ( !manyToOneFieldInfo ) {
                        LOG.debug( `_populateOneToManyRelations: "${propertyName}": No field definition found for matching ManyToOne relation` );
                        return;
                    }

                    const joinColumnName = manyToOneFieldInfo.columnName;
                    LOG.debug( `_populateOneToManyRelations: "${propertyName}": 4. joinColumnName = `, joinColumnName, metadata.fields );
                    const joinPropertyName = EntityUtils.getPropertyName( joinColumnName, manyToOneMetadata.fields );
                    LOG.debug( `_populateOneToManyRelations: "${propertyName}": 5. joinPropertyName = `, joinPropertyName );

                    LOG.debug( `_populateOneToManyRelations: "${propertyName}": 6. Searching related items for column name "${joinColumnName}" and inner property "${joinPropertyName}" mapped to table "${mappedTable}" by id "${entityId}"` );
                    const linkedEntities: MemoryItem[] = this._filterItems(
                        (relatedItem: MemoryItem): boolean => {
                            const relatedEntity = relatedItem.value;
                            LOG.debug( `_populateOneToManyRelations: "${propertyName}": 7. relatedEntity = `, relatedEntity );
                            LOG.debug( `_populateOneToManyRelations: "${propertyName}": 7. joinPropertyName = `, joinPropertyName );
                            const innerId: string | number | undefined = has( relatedEntity, joinPropertyName ) ? (relatedEntity as any)[joinPropertyName] : undefined;
                            LOG.debug( `_populateOneToManyRelations: "${propertyName}": 10. innerId = `, innerId );
                            LOG.debug( `_populateOneToManyRelations: "${propertyName}": 10. entityId = `, entityId );
                            return !!innerId && innerId === entityId;
                        },
                        mappedTable
                    );
                    LOG.debug( `_populateOneToManyRelations: "${propertyName}": linkedEntities = `, linkedEntities );
                    const preparedEntities = this._prepareItemList(
                        linkedEntities,
                        manyToOneMetadata,
                        true,
                        undefined
                    );
                    LOG.debug( `_populateOneToManyRelations: "${propertyName}": PREPARED: linkedEntities = `, linkedEntities );
                    (entity as any)[propertyName] = preparedEntities;
                }
            );
        }

        return entity;
    }

    /**
     * Returns the cloned entity, save to pass outside.
     *
     * This will also populate relate linked resources.
     *
     * @param entity The item to populate. Note! We don't clone this!
     * @param metadata
     * @private
     */
    private _populateManyToOneRelations<T extends Entity> (
        entity: T,
        metadata: EntityMetadata
    ) : T {
        const tableName = metadata.tableName;
        const manyToOneRelations = metadata?.manyToOneRelations;

        LOG.debug(`ManyToOneRelations: 0. tableName = `, tableName, manyToOneRelations);

        if (manyToOneRelations?.length) {
            forEach(
                manyToOneRelations,
                (manyToOne: EntityRelationManyToOne) => {

                    let { propertyName, mappedTable } = manyToOne;
                    LOG.debug(`ManyToOneRelations: 1. propertyName = `, propertyName, mappedTable);

                    const joinColumn : EntityField | undefined = find(metadata.fields, (field: EntityField) : boolean => field.propertyName === propertyName);
                    LOG.debug(`ManyToOneRelations: 2. joinColumn = `, joinColumn);
                    if (joinColumn) {

                        const joinColumnName = joinColumn.columnName;
                        LOG.debug(`ManyToOneRelations: 3. joinColumnName = `, joinColumnName, metadata.fields);

                        if ( !mappedTable ) {
                            throw new TypeError(`No link to table exists to populate property "${propertyName}" in table "${tableName}"`);
                        }

                        const mappedToMetadata = this._metadataManager.getMetadataByTable(mappedTable);
                        LOG.debug(`ManyToOneRelations: 4. mappedToMetadata = `, mappedToMetadata);
                        if ( !mappedToMetadata ) {
                            throw new TypeError(`Could not find metadata for linked table "${mappedTable} to populate property "${propertyName}" in table "${tableName}"`);
                        }

                        const joinPropertyName = EntityUtils.getPropertyName(joinColumnName, metadata.fields);
                        LOG.debug(`ManyToOneRelations: 5. joinPropertyName = `, joinPropertyName);
                        LOG.debug(`ManyToOneRelations: 5. entity = `, entity);

                        const mappedId : string = has(entity, joinPropertyName) ? (entity as any)[joinPropertyName] : undefined;
                        if ( !mappedId ) throw new TypeError(`Could not find related entity id ("${joinPropertyName}" from "${joinColumnName}") by property "${propertyName}"`);
                        LOG.debug(`ManyToOneRelations: 5. mappedId = `, mappedId);

                        const relatedMemoryItem : MemoryItem | undefined = find(this._data[mappedTable].items, (item: MemoryItem) : boolean => item.id === mappedId);
                        if ( !relatedMemoryItem ) {
                            (entity as any)[propertyName] = undefined;
                            return;
                        }

                        LOG.debug(`ManyToOneRelations: 5. relatedMemoryItem = `, relatedMemoryItem);

                        const relatedEntity = relatedMemoryItem.value;
                        LOG.debug(`ManyToOneRelations: 5. relatedEntity = `, relatedEntity);
                        if ( !relatedEntity ) throw new TypeError(`Could not find related entity by property "${propertyName}"`);

                        LOG.debug(`ManyToOneRelations: 6. Entity = `, entity);
                        LOG.debug(`ManyToOneRelations: 6. Related Entity = `, relatedMemoryItem);

                        // const relatedId : string | undefined = has(relatedEntity, joinPropertyName) ? (relatedEntity as any)[joinPropertyName] : undefined;
                        // LOG.debug(`ManyToOneRelations: 7. relatedId = `, relatedId);
                        // if ( !relatedId ) throw new TypeError(`Could not find related entity id by property "${joinPropertyName}"`);

                        // const relatedTableName = mappedToMetadata.tableName;
                        LOG.debug(`ManyToOneRelations: 8. Searching for #${mappedId} from tableq ${mappedTable}`);
                        const storedRelatedItem : MemoryItem | undefined = this._findItem(
                            (item: MemoryItem) : boolean => item.id === mappedId,
                            mappedTable
                        );
                        LOG.debug(`ManyToOneRelations: 9. storedRelatedItem = `, storedRelatedItem);
                        if (!storedRelatedItem) throw new TypeError(`Could not find related entity by id "${mappedId}" from table "${mappedTable}"`);

                        const preparedItem = this._prepareItem(
                            storedRelatedItem,
                            mappedToMetadata,
                            true
                        );
                        LOG.debug(`ManyToOneRelations: 1. PREPARED = `, preparedItem);
                        (entity as any)[propertyName] = preparedItem;

                    }
                }
            );
        }

        return entity;
    }

}
