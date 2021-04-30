import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { setEntities } from '../../src/internal/set-entities'

type Entity = {
    id: string
    description: string
}

const getId = (e: Entity) => e.id

const setEntitiesT = setEntities(getId)

test('is a function', () => {
    assert.type(setEntities, 'function')
})

test('accepts a single entity', () => {
    const initial = { byId: {}, allIds: [] }
    const entity: Entity = { id: 'abc', description: 'item 1' }

    const result = setEntitiesT(entity)(initial)

    assert.equal(result, { byId: { abc: entity }, allIds: ['abc'] })
})

test('accepts an array of entities', () => {
    const initial = { byId: {}, allIds: [] }
    const entities: Entity[] = [
        { id: 'abc', description: 'item 1' },
        { id: 'def', description: 'item 2' },
    ]

    const result = setEntitiesT(entities)(initial)

    assert.equal(result, {
        byId: {
            abc: entities[0],
            def: entities[1],
        },
        allIds: ['abc', 'def'],
    })
})

test('replaces existing entities', () => {
    const initial = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
    }
    const entity: Entity = { id: 'abc', description: 'item 10' }

    const result = setEntitiesT(entity)(initial)

    assert.equal(result, {
        byId: {
            abc: entity,
            def: initial.byId.def,
        },
        allIds: initial.allIds,
    })
})

test('handles a mix of existing and new entities', () => {
    const initial = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
    }
    const entities: Entity[] = [
        { id: 'abc', description: 'item 10' },
        { id: 'ghi', description: 'item 3' },
    ]

    const result = setEntitiesT(entities)(initial)

    assert.equal(result, {
        byId: {
            abc: entities[0],
            def: initial.byId.def,
            ghi: entities[1],
        },
        allIds: initial.allIds.concat(entities[1].id),
    })
})

test('noop for an empty array', () => {
    const initial = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
        },
        allIds: ['abc', 'def'],
    }

    const result = setEntitiesT([])(initial)

    assert.equal(initial, result)
})

test.run()
