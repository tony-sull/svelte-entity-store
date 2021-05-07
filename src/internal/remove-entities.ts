import { getEntities } from './get-entities'
import type { Normalized } from './normalize'
import { GetID, ID, isID, Predicate } from '../shared'

export function removeEntities<T>(
    getId: GetID<T>,
): (input: ID | ID[] | T | T[] | Predicate<T>) => (state: Normalized<T>) => Normalized<T> {
    /**
     * Removes an entity by ID, if found.
     *
     * @param id ID of the entity to remove
     */
    function withInput(id: ID): (state: Normalized<T>) => Normalized<T>

    /**
     * Removes one or more entities from the state, if found.
     *
     * @param ids Array of IDs to remove
     */
    function withInput(ids: ID[]): (state: Normalized<T>) => Normalized<T>

    /**
     * Removes an entity object from the store, if found.
     *
     * @param entity Entity object to be removed
     */
    function withInput(entity: T): (state: Normalized<T>) => Normalized<T>

    /**
     * Removes multiple entities from the store, if found.
     *
     * @param entities Array of entity objects to be removed
     */
    function withInput(entities: T[]): (state: Normalized<T>) => Normalized<T>

    /**
     * Removes all entities that match the filter function.
     *
     * @param pred Filter function that returns true for every entity that should be removed
     */
    function withInput(pred: Predicate<T>): (state: Normalized<T>) => Normalized<T>

    function withInput(input: ID | ID[] | T | T[] | Predicate<T>) {
        return function fromState(state: Normalized<T>): Normalized<T> {
            let toRemove: T[]

            if (Array.isArray(input)) {
                const ids = input.map((i: ID | T) => (isID(i) ? i : getId(i)))
                toRemove = getEntities<T>(ids)(state)
            } else if (input instanceof Function) {
                toRemove = getEntities<T>(input)(state)
            } else {
                const id = isID(input) ? input : getId(input)
                toRemove = [getEntities<T>(id)(state)].filter(Boolean)
            }

            return toRemove.reduce(
                ({ byId, allIds }, next) => {
                    const id = getId(next)
                    delete byId[id]

                    return {
                        byId,
                        allIds: allIds.filter((i) => i !== id),
                    }
                },
                {
                    byId: { ...state.byId },
                    allIds: [...state.allIds],
                },
            )
        }
    }

    return withInput
}
