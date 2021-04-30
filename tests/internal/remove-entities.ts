import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { removeEntities } from '../../src/internal/remove-entities'
import { Normalized } from '../../src/internal/normalize'

type Entity = {
    id: string
    description: string
    completed: boolean
}

const getId = (e: Entity) => e.id
const isCompleted = (e: Entity) => e.completed

const removeEntitiesT = removeEntities(getId)

test('is a function', () => {
    assert.type(removeEntities, 'function')
})

test('accepts a single ID', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
    }
    const result = removeEntitiesT('abc')(state)

    assert.equal(result, { byId: {}, allIds: [] })
})

test('accepts an array of IDs', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }
    const result = removeEntitiesT(['abc', 'ghi'])(state)

    assert.equal(result, {
        byId: {
            def: state.byId.def,
        },
        allIds: ['def'],
    })
})

test('accepts a filter function', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }
    const result = removeEntitiesT(isCompleted)(state)

    assert.equal(result, {
        byId: {
            def: state.byId.def,
        },
        allIds: ['def'],
    })
})

test('ignores unknown ID', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
    }
    const result = removeEntitiesT('def')(state)

    assert.equal(result, state)
})

test('ignores unknown IDs in an array', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }
    const result = removeEntitiesT(['jkl', 'ghi'])(state)

    assert.equal(result, {
        byId: {
            abc: state.byId.abc,
            def: state.byId.def,
        },
        allIds: ['abc', 'def'],
    })
})

test.run()
