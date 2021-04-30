import { derived, writable } from 'svelte/store'
import { getEntities } from './internal/get-entities'
import { normalize } from './internal/normalize'
import { setEntities } from './internal/set-entities'
import type { Readable, Subscriber, Unsubscriber } from 'svelte/store'
import type { Normalized } from './internal/normalize'

declare type Invalidator<T> = (value?: T) => void
declare type Subscribe<T> = (this: void, run: Subscriber<T>, invalidate?: Invalidator<T>) => Unsubscriber

export type Predicate<T> = (t: T) => boolean

/**
 * EntityStore supports `string` and `number` values for unique IDs
 */
export type ID = string | number

/**
 * Function used to get the unique ID of an entity
 */
export type GetID<T> = (t: T) => ID

/**
 * Simple Svelte store that normalized data by ID and provides helpers for common data access patterns.
 */
export type EntityStore<T> = {
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
    const setEntitiesT = setEntities(getID)

    const store = writable(normalizeT(initial))

    const reset = () => store.set(normalizeT([]))

    const set = (entities: T | T[]) => {
        const toAdd = [].concat(entities)

        if (toAdd.length > 0) {
            store.update(setEntitiesT(toAdd))
        }
    }

    function get(id: ID): Readable<T | undefined>
    function get(ids: ID[]): Readable<T[]>
    function get(pred: Predicate<T>): Readable<T[]>
    function get(input: ID | ID[] | Predicate<T>): Readable<T | undefined> | Readable<T[]> {
        if (Array.isArray(input)) {
            return derived(store, getEntities<T>(input))
        } else if (input instanceof Function) {
            return derived(store, getEntities<T>(input))
        } else {
            return derived(store, getEntities<T>(input))
        }
    }

    return {
        get,
        reset,
        set,
        subscribe: store.subscribe,
    }
}
