import {test} from './module.js';
console.log(test);
test.test = 'b';

export default {
	test: test.test
}