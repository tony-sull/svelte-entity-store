import { derived, Updater, writable } from 'svelte/store'
import { getEntities } from './internal/get-entities'
import { normalize } from './internal/normalize'
import { removeEntities } from './internal/remove-entities'
import { setEntities } from './internal/set-entities'
import { updateEntities } from './internal/update-entities'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'
import type { Normalized } from './internal/normalize'

declare type Invalidator<T> = (value?: T) => void
declare type Subscribe<T> = (this: void, run: Subscriber<T>, invalidate?: Invalidator<T>) => Unsubscriber

export type Predicate<T> = (t: T) => boolean

/**
 * EntityStore supports `string` and `number` values for unique IDs
 */
export type ID = string | number

export function isID(value: unknown): value is ID {
    const type = typeof value

    return type === 'string' || type === 'number'
}

/**
 * Function used to get the unique ID of an entity
 */
export type GetID<T> = (t: T) => ID

/**
 * Simple Svelte store that normalized data by ID and provides helpers for common data access patterns.
 */
export type EntityStore<T> = {
    /**
     * Gets a derived store containing every entity in the store.
     *
     * @returns Array of all entities
     */
    get(): Readable<T[]>

    /**
     * Gets a derived store containing the entity if the ID is found, or undefined otherwise.
     *
     @param id ID of the entity to find
     * @returns Entity object if found, undefined otherwise
     */
    get(id: ID): Readable<T | undefined>

    /**
     * Gets a derived store containing a list of all entities found by ID.
     * IDs that aren't found in the store are ignored. The list of entities is not guaranteed to be the same length as the list of IDs.
     *
     * @param ids Array of IDs to find
     * @returns Array of found entities
     */
    get(ids: ID[]): Readable<T[]>

    /**
     * Gets a derived store containing a list of all entities in the store that match
     * the filter function.
     *
     * @param pred {@link Predicate<T>} filter function
     * @returns Array of all entities matching the filter function
     */
    get(pred: Predicate<T>): Readable<T[]>

    /**
     * Removes the entity from the store, if found
     *
     * @param id {ID} ID of the entity to remove
     */
    remove(id: ID): void

    /**
     * Removes the given entities from the store, if found
     *
     * @param ids Array of {@link ID}s to remove from the store
     */
    remove(ids: ID[]): void

    /**
     * Removes all entities that match the filter function
     *
     * @param pred {@link Predicate<T>} filter function which returns true for each entity to be removed
     */
    remove(pred: Predicate<T>): void

    /**
     * Removes all entities
     */
    reset(): void

    /**
     * Adds the given entity to the store. If the entity is already in the store, their old value is replaced.
     *
     * @param entity Entity to be added or updated
     */
    set(entity: T): void

    /**
     * Adds the given entities to the store. For entities that are already in the store, their old value is replaced.
     *
     * @param entities Entity or entities to be added or updated
     */
    set(entities: T | T[]): void

    /**
     * See (Svelte's docs)[https://svelte.dev/docs#svelte_store] for details on the Store contract and `subscribe` function
     */
    subscribe: Subscribe<Normalized<T>>

    /**
     * If found, runs the entity through the updater function and stores the new state
     *
     * @param updater {@link Updater<T>} Callback to update the entity
     * @param id {@link ID} of the entity to update
     */
    update(updater: Updater<T>, id: ID): void

    /**
     * Runs the matching entity through the updater function and stores the new state
     *
     * @param updater {@link Updater<T>} Callback to update each entity
     * @param ids {@link ID}s of the entities to update
     */
    update(updater: Updater<T>, ids: ID[]): void

    /**
     * If found, runs the entity through the updater function and stores the new state
     *
     * @param updater {@link Updater<T>} Callback to update the entity
     * @param entity The entity to update
     */
    update(updater: Updater<T>, entity: T): void

    /**
     * Runs each existing entity through the updater function and stores the new state
     *
     * @param updater {@link Updater<T>} Callback to update each entity
     * @param entities Array of the entities to update
     */
    update(updater: Updater<T>, entities: T[]): void

    /**
     * Runs each matching entity through the updater function and stores the new state
     *
     * @param updater {@link Updater<T>} Callback to update each entity
     * @param pred {@link Predicate<T>} filter function that returns true for each entity to update
     */
    update(updater: Updater<T>, pred: Predicate<T>): void
}

/**
 * Creates a new entity store
 *
 * @typeParam T Entity type being stored
 * @param getID {@link GetID<T>}
 * @param initial (optional) Initial array of items to be stored
 * @returns {@link EntityStore}
 */
export function entityStore<T>(getID: GetID<T>, initial: T[] = []): EntityStore<T> {
    const normalizeT = normalize(getID)
    const removeEntitiesT = removeEntities(getID)
    const setEntitiesT = setEntities(getID)
    const updateEntitiesT = updateEntities(getID)

    const store = writable(normalizeT(initial))

    const reset = () => store.set(normalizeT([]))

    const set = (entities: T | T[]) => {
        const toAdd = [].concat(entities)

        if (toAdd.length > 0) {
            store.update(setEntitiesT(toAdd))
        }
    }

    function get(): Readable<T[]>
    function get(id: ID): Readable<T | undefined>
    function get(ids: ID[]): Readable<T[]>
    function get(pred: Predicate<T>): Readable<T[]>
    function get(input?: ID | ID[] | Predicate<T>): Readable<T | undefined> | Readable<T[]> {
        if (!input) {
            return derived(store, getEntities<T>())
        } else if (Array.isArray(input)) {
            return derived(store, getEntities<T>(input))
        } else if (input instanceof Function) {
            return derived(store, getEntities<T>(input))
        } else {
            return derived(store, getEntities<T>(input))
        }
    }

    function remove(id: ID): void
    function remove(ids: ID[]): void
    function remove(pred: Predicate<T>): void
    function remove(input: ID | ID[] | Predicate<T>): void {
        store.update(removeEntitiesT(input))
    }

    function update(updater: Updater<T>, id: ID): void
    function update(updater: Updater<T>, ids: ID[]): void
    function update(updater: Updater<T>, entity: T): void
    function update(updater: Updater<T>, entiites: T[]): void
    function update(updater: Updater<T>, pred: Predicate<T>): void
    function update(updater: Updater<T>, input: ID | ID[] | T | T[] | Predicate<T>): void {
        store.update(updateEntitiesT(updater)(input))
    }

    return {
        get,
        remove,
        reset,
        set,
        subscribe: store.subscribe,
        update,
    }
}
