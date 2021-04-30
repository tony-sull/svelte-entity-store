import { writable } from 'svelte/store'
import { normalize } from './internal/normalize'
import type { Normalized } from './internal/normalize'

import type { Subscriber, Unsubscriber } from 'svelte/store'

declare type Invalidator<T> = (value?: T) => void
declare type Subscribe<T> = (this: void, run: Subscriber<T>, invalidate?: Invalidator<T>) => Unsubscriber

export type ID = string | number
export type GetID<T> = (t: T) => ID

export type EntityStore<T> = {
    subscribe: Subscribe<Normalized<T>>
}

export function entityStore<T>(getID: GetID<T>, initial: T[] = []): EntityStore<T> {
    const normalizeT = normalize(getID)

    const store = writable(normalizeT(initial))

    return {
        subscribe: store.subscribe,
    }
}
