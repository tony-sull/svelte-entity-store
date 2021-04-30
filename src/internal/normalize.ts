import { GetID, ID } from '../'

export type Normalized<T> = {
    byId: {
        [id: string]: T
        [id: number]: T
    }
    allIds: ID[]
}

export const normalize = <T>(getID: GetID<T>) => (items: T[]): Normalized<T> => {
    return items.reduce(
        ({ byId, allIds }, next) => {
            const id = getID(next)

            byId[id] = next
            allIds.push(id)

            return { byId, allIds }
        },
        { byId: {}, allIds: [] } as Normalized<T>,
    )
}
