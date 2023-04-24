import { ref, computed } from 'vue'
import { getAll, upsert } from './lib/LocalDb.js'

const default_categories = [
	{ id: 1, name: 'Pausa Caffé', color: 'brown' },
	{ id: 2, name: 'Formazione personale', color: 'green' },
	{ id: 3, name: 'Riunione', color: 'yellow' },
	{ id: 4, name: 'Hacking', color: 'black' },
];

let _categories = ref([]);

export const Categories = {
	all() {
		return _categories;
	},

	load: async () => {
		let res = await getAll('categories');
		if( res.length == 0 ) {
			for( let i=0; i<default_categories.length; i++ ) {
				await Categories.add( default_categories[i] );
				res.push(default_categories[i]);
			}
		}

		_categories.value = res;
	},

	add: async (value) => {
		return await upsert('categories', value);
	},

	sorted_names: computed(() => {
		return _categories.map(c => c.name).sort();
	}),

	colors: computed(() => {
		let res = {};
		for (let i = 0; i < _categories.value.length; i++) {
			const c = _categories.value[i];
			res[c.id] = c.color;
		}
		return res;
	}),

	by_id(id) {
		let c = _categories.value.filter( c => c.id == id )[0];
		return c;
	},

	names: computed(() => {
		let res = {};
		for (let i = 0; i < _categories.value.length; i++) {
			const c = _categories.value[i];
			res[c.id] = c.name;
		}
		return res;
	}),

	color_by_id: (id) => {
		return id ? Categories.colors.value[id] : null;
	},

	name_by_id: (id) => {
		return id ? Categories.names.value[id] : null;
	}
};

