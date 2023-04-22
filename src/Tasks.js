import { ref, computed } from 'vue'

const dummy_tasks = [
	{ id: 1, description: 'Hacking NASA', category_id: 4, dt_start: new Date() },
	{ id: 2, description: 'Sviluppo prova', category_id: 4, dt_start: new Date(), dt_end: new Date() },
	{ id: 3, description: 'Riunione scocciante', category_id: 3, dt_start: new Date(), dt_end: new Date() },
];


let _tasks = ref(dummy_tasks);

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

	running_tasks,
	done_tasks,

	add: (description, category_id) => {
		if (!description) return;
	
		const t = description.trim();
		if (t == "") return;

		const ids = _tasks.value.map(t => t.id);
		let m = Math.max(...ids);
		let new_id = isNaN(m) || m < 0 ? 1 : m + 1;
		console.log( "New id is: %s", new_id );
		
		_tasks.value.push({
			id: new_id,
			description: t,
			dt_start: new Date(),
			dt_end: null,
			category_id: category_id
		});
	},

	update: (t) => {
		if( !t  || !t.id ) return;

		for( let i=0; i<_tasks.value.length; i++ ) {
			let tsk = _tasks.value[i];
			if( tsk.id == t.id ) {
				_tasks.value.splice(i,1,t);
				return;
			}
		}
	},

	remove: (id) => {
		if( !id ) return;

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