import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { getEntities } from '../../src/internal/get-entities'
import { Normalized } from '../../src/internal/normalize'

type Entity = {
    id: string
    description: string
}

const getId = (e: Entity) => e.id

test('is a function', () => {
    assert.type(getEntities, 'function')
})

test('accepts a single ID', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
        },
        allIds: ['abc'],
    }

    const result = getEntities<Entity>('abc')(state)

    assert.equal(result, state.byId.abc)
})

test('returns undefined for an unknown ID', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
        },
        allIds: ['abc'],
    }

    const result = getEntities<Entity>('def')(state)

    assert.is(result, undefined)
})

test('accepts an array of IDs', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
            ghi: { id: 'ghi', description: 'item 3' },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = getEntities<Entity>(['abc', 'ghi'])(state)

    assert.equal(result, [state.byId.abc, state.byId.ghi])
})

test('ignores unknown IDs from an array', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1' },
            def: { id: 'def', description: 'item 2' },
            ghi: { id: 'ghi', description: 'item 3' },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = getEntities<Entity>(['abc', 'jkl'])(state)

    assert.equal(result, [state.byId.abc])
})

test.run()
