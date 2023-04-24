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
		let res = value;

		tx.oncomplete = () => { resolve(res); };
		tx.onerror = (event) => { reject(event); };

		const objStore = tx.objectStore( table );
		objStore.delete(key);
	});
}
