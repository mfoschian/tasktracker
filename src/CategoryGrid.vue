<template>
	<div class="catlist">
		<div class="header">Nome</div>
		<div class="header">Colore</div>
		<div class="header">
			<div class="add" @click="show_new_record" title="Aggiungi">
				<span class="bi bi-plus-circle"></span>
			</div>
		</div>

		<template v-for="c in categories" :key="c.id">
			<div>
				<input type="text" 
					class="form-control"
					:value="c.name"
					@change="save('name', c.id, $event.target.value)"
					>
			</div>
			<div>
				<input type="color"
					class="form-control"
					:value="c.color"
					@change="save('color', c.id, $event.target.value)"
				>
			</div>
			<div>
				<button class="btn" @click="remove(c.id, c.name)" :title="'Elimina '+c.name">
					<span class="bi bi-trash text-danger"></span>
				</button>
			</div>
		</template>

		<template v-if="new_record">
			<div>
				<input type="text" 
					class="form-control"
					v-model="new_name"
				>
			</div>
			<div>
				<input type="color"
					class="form-control"
					v-model="new_color"
				>
			</div>
			<div>
				<button class="btn" :disabled="!valid">
					<span class="bi bi-check-circle text-success" @click="add_new_record" title="Aggiungi"></span>
				</button>
				<button class="btn" >
					<span class="bi bi-x-circle" @click="new_record=false" title="Annulla"></span>
				</button>
			</div>
		</template>

	</div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Categories } from './Categories.js';

let categories = Categories.all();
let new_name = ref('');
let new_color = ref(null);
let new_record = ref(false);

const valid = computed( () => {
	if( !new_name.value ) return false;
	if( !new_color.value ) return false;
	return true;
});

const save = (prop, id, value) => {
	Categories.updateProp(id, prop, value);
}

const show_new_record = () => {
	new_name.value = '';
	new_color.value = '';
	new_record.value = true;
};
const add_new_record = () => {
	Categories.add({
		name: new_name.value,
		color: new_color.value
	});
	new_record.value = false;
};
const remove = (id, name) => {
	const confirmed = confirm(`Confermi di voler cancellare la categoria "${name}" ?`);
	if( confirmed != true )
		return;

	Categories.remove(id);
};
</script>

<style lang="scss" scoped>
.catlist {
	padding: 0.5rem;
	display: grid;
	grid-template-columns: 1fr min-content max-content;
	align-items: stretch;

	--fore-col: var(--bs-blue);
	--bkgr-col: var(--bs-white);

	div {
		padding: 0.5rem;

		.btn {
			display: inline;
		}
		.btn:disabled {
			border: none;
		}
	}

	.header {
		background-color: var(--fore-col);
		color: var(--bkgr-col);
		border: 1px solid var(--bkgr-col);

		.add {
			cursor: pointer;
		}
	}
}

</style>