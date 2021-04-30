import type { Normalized } from './normalize'
import type { GetID } from '..'

/**
 * Adds or updates the given entities to the normalized state. Entities already in the state or replaced, new entities are added.
 */
export const setEntities = <T>(getId: GetID<T>) => (items: T | T[]) => (state: Normalized<T>): Normalized<T> => {
    return [].concat(items).reduce(({ byId, allIds }, next) => {
        const id = getId(next)
        const exists = id in byId

        return {
            byId: { ...byId, [id]: next },
            allIds: exists ? allIds : allIds.concat(id),
        }
    }, state)
}
