import { ref } from 'vue'

const DBNAME = 'mfxTaskTracker';
const VERSION = 100;


let _db = null;
export let error = ref(null);

function createDb() {
	const categoryStore = _db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
	categoryStore.createIndex( 'names', 'name', { unique: true } );
	
	const tasksStore = _db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
	tasksStore.createIndex( 'descriptions', 'description' );
	tasksStore.createIndex( 'categories', 'category_id' );
	tasksStore.createIndex( 'start_dates', 'dt_start' );
}

export function open() {
	return new Promise( (resolve, reject) => {

		const req = window.indexedDB.open( DBNAME, VERSION );
		req.onerror = () => {
			const msg = `Error loading database: ${DBNAME} v${VERSION}`;
			error.value = msg;
			reject(msg);
		};
		req.onsuccess = () => {
			_db = req.result;
			error.value = null;
			resolve();
		};
		req.onupgradeneeded = (event) => {
			_db = event.target.result;

			_db.onerror = (event) => {
				const msg = `Error loading database: ${DBNAME} v${VERSION}`;
				error.value = msg;
				reject(msg);
			};

			try {
				createDb();
				resolve();
			}
			catch( err ) {
				reject( err );
			}
			
		};
	});
}

export function getAll(table) {
	if (!_db) throw "DB not initalized";

	return new Promise( (resolve, reject) => {
		const tx = _db.transaction( [table] );
		let res = [];
	
		tx.oncomplete = () => { resolve(res); };
		tx.onerror = (event) => { reject(event); };

		const objStore = tx.objectStore( table );
		let req = objStore.getAll();
		req.onsuccess = (event) => {
			res = event.target.result;
		};
	});
}

export class Range {
	constructor(from, to) {
		this.from = from;
		this.to = to;
		this.include = {
			from: true,
			to: true
		};
	}
}

export function getOrdered(table, index, options ) {
	if (!_db) throw "DB not initalized";

	if( !table || !index ) throw "Wrong argumento to LocalDb.getOrdered";

	const o = options || {};
	const range = o.range || null;
	const max_records = isNaN(o.max_count) ? null : Number(o.max_count);

	return new Promise( (resolve, reject) => {
		const tx = _db.transaction( [table] );
		let res = [];
	
		tx.oncomplete = () => { resolve(res); };
		tx.onerror = (event) => { reject(event); };

		const objStore = tx.objectStore( table );
		const ix = objStore.index(index);

		let query = null;
		if( range.from && range.to )
			query = IDBKeyRange.bound(range.from, range.to, !range.include.from, !range.include.to );
		else if( range.from )
			query = IDBKeyRange.lowerBound(range.from, !range.include.from );
		else if( range.to )
			query = IDBKeyRange.upperBound(range.to, !range.include.to );

		let req = ix.getAll(query, max_records);
		req.onsuccess = (event) => {
			res = event.target.result;
		};
	});
}

export function upsert(table, value) {
	if (!_db) throw "DB not initalized";

	return new Promise( (resolve, reject) => {
		const tx = _db.transaction( [table], "readwrite" );
		let res = value;

		tx.oncomplete = () => { resolve(res); };
		tx.onerror = (event) => {
			debugger;
			reject(event);
		};

		const objStore = tx.objectStore( table );
		objStore.put(value);
	});
}

export function remove(table, key) {
	if (!_db) throw "DB not initalized";

	return new Promise( (resolve, reject) => {
		const tx = _db.transaction( [table], "readwrite" );

		tx.oncomplete = () => { resolve(); };
		tx.onerror = (event) => { reject(event); };

		const objStore = tx.objectStore( table );
		objStore.delete(key);
	});
}
