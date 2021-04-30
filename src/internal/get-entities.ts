import type { Normalized } from './normalize'
import type { ID } from '..'

/**
 * Finds an entity by ID
 *
 * @param id ID of the entity to find
 * @returns Entity object if found, undefined otherwise
 */
export function getEntities<T>(id: ID): (state: Normalized<T>) => T | undefined

/**
 * Finds multiple entities by ID. Note that IDs will be ignored if the entity isn't found,
 * the array returned may not be the same length as the input array.
 *
 * @param ids Array of IDs to find
 * @returns Array of found entities
 */
export function getEntities<T>(ids: ID[]): (state: Normalized<T>) => T[]
export function getEntities<T>(ids: ID | ID[]) {
    return function (state: Normalized<T>): T | T[] {
        if (Array.isArray(ids)) {
            return ids.map((id) => state.byId[id]).filter(Boolean)
        } else {
            return state.byId[ids]
        }
    }
}
