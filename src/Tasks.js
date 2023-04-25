import { ref, computed } from 'vue'
import { getAll, upsert, remove, Range, getOrdered } from './lib/LocalDb.js'

let _tasks = ref([]);

const running_tasks = computed( () => {
	return _tasks.value.filter( t => t.dt_start && t.dt_end == null );
});

const done_tasks = computed( () => {
	return _tasks.value.filter( t => t.dt_start && t.dt_end )
		.sort( (a,b) => { // sort reverse
			if( a.dt_start > b.dt_start ) return -1;
			if( a.dt_start < b.dt_start ) return 1;
			return 0;
		});
});

export const Tasks = {
	all() {
		return _tasks;
	},

	load: async (from, to, max_count) => {
		let res;
		if( !from && !to )
			res = await getAll('tasks');
		else {
			let range = new Range(from, to);
			res = await getOrdered('tasks', 'start_dates', { range, max_count });
		}
		_tasks.value = res;
	},

	running_tasks,
	done_tasks,

	add: async (description, category_id) => {
		if (!description) return;
	
		const t = description.trim();
		if (t == "") return;

		const new_t = {
			description: t,
			dt_start: new Date(),
			dt_end: null,
			category_id: category_id
		};

		let dbt = await upsert('tasks', new_t );
		_tasks.value.push( dbt );
	},

	update: async (t) => {
		if( !t  || !t.id ) return;

		console.log( 'Updating task with id %s', t.id );
		let dbt = await upsert('tasks', t );
		for( let i=0; i<_tasks.value.length; i++ ) {
			let tsk = _tasks.value[i];
			if( tsk.id == t.id ) {
				_tasks.value.splice(i,1,dbt);
				return;
			}
		}
	},

	remove: async (id) => {
		if( !id ) return;

		await remove( 'tasks', id );

		for( let i=0; i<_tasks.value.length; i++ ) {
			let tsk = _tasks.value[i];
			if( tsk.id == id ) {
				_tasks.value.splice(i,1);
				return;
			}
		}
	},

	duration: (t) => {
		if( !t.dt_start || !t.dt_end )
			return 0;

		const t2 = t.dt_end.getTime();
		const t1 = t.dt_start.getTime();

		const ms = t2 - t1;
		return (ms / 1000.0 / 60.0);
	}
};