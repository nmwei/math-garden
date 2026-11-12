import {readFileSync} from 'node:fs';
import {mathContract} from '../domain/archive.js';
const validateArchive=mathContract(JSON.parse(readFileSync(new URL('../domain/catalog.json',import.meta.url),'utf8')));
export default Object.freeze({id:'math',validateArchive});
