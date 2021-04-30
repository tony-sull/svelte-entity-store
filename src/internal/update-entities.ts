import { getEntities } from './get-entities'
import { isID } from '..'
import type { Updater } from 'svelte/store'
import type { Normalized } from './normalize'
import type { GetID, ID, Predicate } from '..'

export function updateEntities<T>(
    getId: GetID<T>,
): (updater: Updater<T>) => (input: ID | ID[] | T | T[] | Predicate<T>) => (state: Normalized<T>) => Normalized<T> {
    return function withUpdater(updater: Updater<T>) {
        function withInput(id: ID): (state: Normalized<T>) => Normalized<T>
        function withInput(ids: ID[]): (state: Normalized<T>) => Normalized<T>
        function withInput(entity: T): (state: Normalized<T>) => Normalized<T>
        function withInput(entities: T[]): (state: Normalized<T>) => Normalized<T>
        function withInput(pred: Predicate<T>): (state: Normalized<T>) => Normalized<T>

        function withInput(input: ID | ID[] | T | T[] | Predicate<T>) {
            return function fromState(state: Normalized<T>): Normalized<T> {
                let toUpdate: T[]

                if (Array.isArray(input)) {
                    const ids = input.map((i: ID | T) => (isID(i) ? i : getId(i)))
                    toUpdate = getEntities<T>(ids)(state)
                } else if (input instanceof Function) {
                    toUpdate = getEntities<T>(input)(state)
                } else {
                    const id = isID(input) ? input : getId(input)
                    toUpdate = [].concat(getEntities<T>(id)(state))
                }

                return toUpdate.reduce(({ byId, allIds }, next) => {
                    const id = getId(next)

                    return {
                        byId: {
                            ...byId,
                            [id]: updater(next),
                        },
                        allIds,
                    }
                }, state)
            }
        }

        return withInput
    }
}
