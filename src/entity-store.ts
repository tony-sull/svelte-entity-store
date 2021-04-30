import { writable } from 'svelte/store'
import { normalize } from './internal/normalize'
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

    const store = writable(normalizeT(initial))

    const reset = () => store.set(normalizeT([]))

    return {
        reset,
        subscribe: store.subscribe,
    }
}
