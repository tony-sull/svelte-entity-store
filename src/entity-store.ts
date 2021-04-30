import { writable } from 'svelte/store'
import { normalize } from './internal/normalize'
import { setEntities } from './internal/set-entities'
import type { Subscriber, Unsubscriber } from 'svelte/store'
import type { Normalized } from './internal/normalize'

declare type Invalidator<T> = (value?: T) => void
declare type Subscribe<T> = (this: void, run: Subscriber<T>, invalidate?: Invalidator<T>) => Unsubscriber

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

    return {
        reset,
        set,
        subscribe: store.subscribe,
    }
}
