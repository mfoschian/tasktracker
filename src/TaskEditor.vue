<template>
	<form :class="{ invalid: error_msg != null }" @submit.prevent>
		<div v-if="error_msg" class="error_msg bg-danger">{{ error_msg }}</div>
		<div class="form-group">
			<label>Descrizione :</label>
			<input type="text" v-model="description" class="form-control" :class="{ 'is-invalid': !valid }">
		</div>
		<div class="form-group">
			<label>Categoria :</label>
			<select class="form-control" v-model="category_id">
				<option v-for="c in categories_sorted" :key="c.id" :value="c.id">{{ c.name }}</option>
			</select>
		</div>

		<!-- dt_start -->
		<div class="form-group">
			<label>Inizio:</label>
			<div class="inline">
				<input type="date" v-model="day_start" class="form-control" >
				<input type="time" class="form-control" v-model="time_start" >
			</div>
		</div>

		<!-- dt_end -->
		<div class="form-group" v-if="task.dt_end != null">
			<label>Fine:</label>
			<div class="inline">
				<input type="date" v-model="day_end" class="form-control" >
				<input type="time" class="form-control" v-model="time_end" >
			</div>
		</div>

		<div class="spaced">
			<button class="btn btn-primary" :disabled="!valid" @click="save">
				<span class="bi bi-save"></span> Salva
			</button>
			<button class="btn btn-danger" @click="remove" title="Elimina"><span class="bi bi-trash"></span></button>
			<button class="btn btn-secondary" @click="$emit('dismiss')">
				<span class="bi bi-x-circle"></span> Annulla
			</button>
		</div>
	</form>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'
import { Categories } from './Categories';

const props = defineProps({
	task: { type: Object, required: true }
});

const emit = defineEmits(['save', 'dismiss','delete']);

let id = ref(props.task.id);
let description = ref(props.task.description);
let category_id = ref(props.task.category_id);


const p2 = (n) => (n < 10 ? '0'+n : ''+n );
const dt_to_day = (dt) => (dt == null ? null : dt.getFullYear() + '-' + p2(dt.getMonth()+1) + '-' + p2(dt.getDate()));
const dt_to_time = (dt) => (dt == null ? null : p2(dt.getHours()) + ':' + p2(dt.getMinutes()) );
const dt_build = (d,t) => {
	if(d == null || t == null) return null;
	const pd = d.split('-').map( x => Number(x) );
	const pt = t.split(':').map( x => Number(x) );

	return new Date(pd[0],pd[1] - 1,pd[2],pt[0],pt[1]);
};


let day_start = ref(dt_to_day(props.task.dt_start));
let time_start = ref(dt_to_time(props.task.dt_start));

let day_end = ref(dt_to_day(props.task.dt_end));
let time_end = ref(dt_to_time(props.task.dt_end));


watchEffect(() => {
	let _task = props.task || {};
	id.value = _task.id;
	description.value = _task.description;
	category_id.value = _task.category_id;
	day_start.value = dt_to_day(props.task.dt_start);
	time_start.value = dt_to_time(props.task.dt_start);
	day_end.value = dt_to_day(props.task.dt_end);
	time_end.value = dt_to_time(props.task.dt_end);
});

let error_msg = ref(null);

let valid = computed(() => (description.value != null && description.value.trim() != ""));


const save = async () => {

	let task = {
		id: id.value,
		description: description.value,
		category_id: category_id.value,
		dt_start: dt_build(day_start.value, time_start.value),
		dt_end: dt_build(day_end.value, time_end.value)
	};

	emit('save', task);
}

const remove = async () => {

	let _id = id.value;
	if( _id == null ) return;

	const confirmed = confirm( `Confermi l'eliminazione del task ${description.value} ?`);
	if( confirmed != true )
		return;

	emit('delete', _id);
}

const categories = Categories.all(); // reactive

const categories_sorted = computed(() => categories.value.concat([]).sort((a, b) => {
	if (a.name > b.name) return 1;
	if (a.name < b.name) return -1;
	return 0;
}));

</script>

<style lang="scss">
.inline {
	display: flex;
	flex-direction: row;
}

.spaced {
	margin-top: 1em;
	display: flex;
	flex-direction: row;
	justify-content: space-around;
}

.error_msg {
	padding: 1.5rem;
}
</style>