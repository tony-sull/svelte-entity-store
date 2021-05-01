<script lang="ts">
	import 'todomvc-app-css/index.css';
	import 'todomvc-common/base.css';

	import { onMount } from 'svelte';
	import { entityStore } from 'svelte-entity-store';

	type TodoItem = {
		id: string;
		description: string;
		completed: boolean;
	};
	type TodoFilter = 'all' | 'completed' | 'active';

	const store = entityStore<TodoItem>((t) => t.id);

	const allTodos = store.get();
	const activeTodos = store.get((t) => !t.completed);
	const completedTodos = store.get((t) => t.completed);

	const ENTER_KEY = 13;
	const ESCAPE_KEY = 27;
	let currentFilter: TodoFilter = 'all';
	let editing = null;
	try {
		const items = JSON.parse(localStorage.getItem('todos-svelte')) || [];
		store.set(items);
	} catch (err) {
		store.reset();
	}
	const updateView = () => {
		currentFilter = 'all';
		if (window.location.hash === '#/active') {
			currentFilter = 'active';
		} else if (window.location.hash === '#/completed') {
			currentFilter = 'completed';
		}
	};
	onMount(() => {
		window.addEventListener('hashchange', updateView);
		updateView();
	});
	function clearCompleted() {
		store.remove((t) => t.completed);
	}
	function remove(id: string) {
		store.remove(id);
	}
	function toggle(id: string) {
		store.update((todo) => ({ ...todo, completed: !todo.completed }), id);
	}
	function toggleAll() {
		store.update((todo) => ({ ...todo, completed: !todo.completed }));
	}
	function createNew(event) {
		if (event.which === ENTER_KEY) {
			store.set({
				id: uuid(),
				description: event.target.value,
				completed: false
			});
			event.target.value = '';
		}
	}
	function handleEdit(event) {
		if (event.which === ENTER_KEY) event.target.blur();
		else if (event.which === ESCAPE_KEY) editing = null;
	}
	function submit(event, id: string) {
		store.update((todo) => ({ ...todo, description: event.target.value }), id);
		editing = null;
	}
	function uuid() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (Math.random() * 16) | 0,
				v = c == 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
	$: filtered =
		currentFilter === 'all'
			? allTodos
			: currentFilter === 'completed'
			? completedTodos
			: activeTodos;
	$: numActive = $activeTodos.length;
	$: numCompleted = $completedTodos.length;
	$: try {
		localStorage.setItem('todos-svelte', JSON.stringify($allTodos));
	} catch (err) {
		// noop
	}
</script>

<svelte:head>
	<script src="../../node_modules/todomvc-common/base.js"></script>
</svelte:head>

<header class="header">
	<h1>todos</h1>
	<input class="new-todo" on:keydown={createNew} placeholder="What needs to be done?" autofocus />
</header>

{#if $allTodos.length > 0}
	<section class="main">
		<input
			id="toggle-all"
			class="toggle-all"
			type="checkbox"
			on:change={toggleAll}
			checked={numCompleted === $allTodos.length}
		/>
		<label for="toggle-all">Mark all as complete</label>

		<ul class="todo-list">
			{#each $filtered as item, index (item.id)}
				<li class="{item.completed ? 'completed' : ''} {editing === index ? 'editing' : ''}">
					<div class="view">
						<input
							class="toggle"
							type="checkbox"
							checked={item.completed}
							on:change={() => toggle(item.id)}
						/>
						<label on:dblclick={() => (editing = index)}>{item.description}</label>
						<button on:click={() => remove(item.id)} class="destroy" />
					</div>

					{#if editing === index}
						<input
							value={item.description}
							id="edit"
							class="edit"
							on:keydown={handleEdit}
							on:blur={(event) => submit(event, item.id)}
							autofocus
						/>
					{/if}
				</li>
			{/each}
		</ul>

		<footer class="footer">
			<span class="todo-count">
				<strong>{numActive}</strong>
				{numActive === 1 ? 'item' : 'items'} left
			</span>

			<ul class="filters">
				<li><a class={currentFilter === 'all' ? 'selected' : ''} href="#/">All</a></li>
				<li><a class={currentFilter === 'active' ? 'selected' : ''} href="#/active">Active</a></li>
				<li>
					<a class={currentFilter === 'completed' ? 'selected' : ''} href="#/completed">Completed</a
					>
				</li>
			</ul>

			{#if numCompleted}
				<button class="clear-completed" on:click={clearCompleted}> Clear completed </button>
			{/if}
		</footer>
	</section>
{/if}
