<script setup>
import { ref, computed } from 'vue'
import { Categories } from './Categories.js'
import { Tasks } from './Tasks.js'
import TaskEditor from './TaskEditor.vue'

let running_tasks = Tasks.running_tasks;
let done_tasks = Tasks.done_tasks;
let task_description = ref(null);


const add_task = (description, cat_id) => {
	if (!description || description.trim() == "")
		return;

	const runts = Tasks.running_tasks.value;
	const now = new Date();
	for (let i = 0; i < runts.length; i++) {
		runts[i].dt_end = now;
	}

	Tasks.add(description, cat_id);
}

const add_text_task = () => {
	add_task(task_description.value);
	task_description.value = "";
}

const add_coffee_break = () => add_task('Pausa');
const add_person_break = () => add_task('Interrotto da persona');
const add_phone_break = () => add_task('Interrotto da telefonata');
const stop_task = (t) => t.dt_end = new Date();
const redo_task = (t) => add_task(t.description, t.category_id);


let showDialog = ref(false);
const closeDialog = () => {
	showDialog.value = false;
}

let edited_task = ref({});
const edit_task = (t) => {
	edited_task.value = t;
	showDialog.value = true;
}

const update_task = (t) => {
	showDialog.value = false;
	edited_task.value = {};
	Tasks.update( t );
}

const delete_task = (id) => {
	showDialog.value = false;
	edited_task.value = {};
	Tasks.remove( id );
}
</script>

<template>
	<nav class="navbar navbar-expand-lg navbar-light bg-light">
		<div class="buttons-bar">
			<div class="btn btn-primary" title="Telefonata" @click="add_phone_break()">
				<span class="bi bi-telephone"></span>
			</div>
			<div class="btn btn-primary" title="Telefonata" @click="add_person_break()">
				<span class="bi bi-person"></span>
			</div>
			<div class="btn btn-primary" title="Telefonata" @click="add_coffee_break()">
				<span class="bi bi-cup-hot"></span>
			</div>
		</div>
	</nav>

	<!-- New task box -->
	<div class="row ps-2 pe-2 mb-3">
		<div class="input-group">
			<input type="text" placeholder="nuovo task" class="form-control" v-model="task_description" @keyup.enter="add_text_task">
			<button class="btn btn-info" @click="add_text_task">
				<span class="bi bi-plus"></span>
			</button>
		</div>
	</div>

	<!-- Task list -->
	<div class="tasks">
		<template v-for="t in running_tasks" :key="t.id">
			<div class="actions">
				<button class="btn btn" title="Attiva" @click="stop_task(t)">
					<span class="bi bi-stop"></span>
				</button>
			</div>
			<div class="description running" @dblclick="edit_task(t)">{{ t.description }}</div>
			<div class="category" :style="'background-color:' + Categories.color_by_id(t.category_id) || 'inherit'"
				:title="Categories.name_by_id(t.category_id)">
				<!-- {{  Categories.name_by_id(t.category_id)[0]  }} -->
			</div>
		</template>

		<template v-for="t in done_tasks" :key="t.id">
			<div class="actions">
				<button class="btn btn" title="Attiva" @click="redo_task(t)">
					<span class="bi bi-play"></span>
				</button>
			</div>
			<div class="description done" @dblclick="edit_task(t)">{{ t.description }} - {{ Math.round(Tasks.duration(t) * 100) / 100 }} min</div>
			<div class="category" :style="'background-color:' + Categories.color_by_id(t.category_id) || 'inherit'"
				:title="Categories.name_by_id(t.category_id)">
				<!-- {{  Categories.name_by_id(t.category_id)[0]  }} -->
			</div>
		</template>
	</div>

	<!-- Task editor dialog -->
	<div class="modal fade" :class="{ show: showDialog, 'd-block': showDialog }">
		<div class="modal-dialog modal-xl">
			<div class="modal-content">
				<div class="modal-header">
					<div class="modal-title">Modifica Task</div>
					<button type="button" class="btn-close" @click="closeDialog"></button>
				</div>
				<div class="modal-body">
					<TaskEditor :task="edited_task"
						@save="update_task($event)"
						@dismiss="closeDialog"
						@delete="delete_task($event)"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
@import "bootstrap/scss/bootstrap";
@import "bootstrap-icons/font/bootstrap-icons.css";


.buttons-bar {
	/*border: 1px solid blue;*/
	padding: 0.3rem;
	font-size: 1.5rem;
	display: flex;
	flex-direction: row;
	gap: 0.2rem;
}

.tasks {
	padding: 0.5rem;
	display: grid;
	grid-template-columns: min-content 1fr 2rem;
	align-items: baseline;
	gap: 0.3rem;

	.category {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}

	.description {
		padding: .3rem;
		border-radius: var(--bs-border-radius);

		&.running {
			background-color: var(--bs-success);
		}
	}
}
</style>