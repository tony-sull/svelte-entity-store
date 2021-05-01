import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { updateEntities } from '../../src/internal/update-entities'
import type { Normalized } from '../../src/internal/normalize'

type Entity = {
    id: string
    description: string
    completed: boolean
}

const getId = (e: Entity) => e.id
const isCompleted = (e: Entity) => e.completed
const toggle = (e: Entity) => ({ ...e, completed: !e.completed })

const updateEntitiesT = updateEntities(getId)

test('is a function', () => {
    assert.type(updateEntities, 'function')
})

test('accepts no parameters', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = updateEntitiesT(toggle)()(state)

    assert.equal(result, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: true },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    })
})

test('accepts a single ID', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = updateEntitiesT(toggle)('abc')(state)

    assert.equal(result, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    })
})

test('accepts a single entity', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = updateEntitiesT(toggle)(state.byId.abc)(state)

    assert.equal(result, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    })
})

test('accepts an array of IDs', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = updateEntitiesT(toggle)(['abc', 'ghi'])(state)

    assert.equal(result, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    })
})

test('accepts an array of entities', () => {
    const state: Normalized<Entity> = {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    }

    const result = updateEntitiesT(toggle)([state.byId.abc, state.byId.ghi])(state)

    assert.equal(result, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: true },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: true },
        },
        allIds: ['abc', 'def', 'ghi'],
    })
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

    const result = updateEntitiesT(toggle)(isCompleted)(state)

    assert.equal(result, {
        byId: {
            abc: { id: 'abc', description: 'item 1', completed: false },
            def: { id: 'def', description: 'item 2', completed: false },
            ghi: { id: 'ghi', description: 'item 3', completed: false },
        },
        allIds: ['abc', 'def', 'ghi'],
    })
})

test.run()
