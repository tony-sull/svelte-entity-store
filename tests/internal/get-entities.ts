import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { getEntities } from '../../src/internal/get-entities'
import { Normalized } from '../../src/internal/normalize'

type Entity = {
    id: string
    description: string
    completed: boolean
}

const isCompleted = (e: Entity) => e.completed

test('is a function', () => {
    assert.type(getEntities, 'function')
})

test('accepts a single ID', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
    }

    const result = getEntities<Entity>('abc')(state)

    assert.equal(result, state.byId.abc)
})

test('returns undefined for an unknown ID', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
        },
        allIds: ['abc'],
    }

    const result = getEntities<Entity>('def')(state)

    assert.is(result, undefined)
})

test('accepts an array of IDs', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = getEntities<Entity>(['abc', 'ghi'])(state)

    assert.equal(result, [state.byId.abc, state.byId.ghi])
})

test('ignores unknown IDs from an array', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = getEntities<Entity>(['abc', 'jkl'])(state)

    assert.equal(result, [state.byId.abc])
})

test('accepts a filter function', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = getEntities<Entity>(isCompleted)(state)

    assert.equal(result, [state.byId.def, state.byId.ghi])
})

test('returns an empty array if no entities match filter', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = getEntities<Entity>(isCompleted)(state)

    assert.equal(result, [])
})

test.run()
