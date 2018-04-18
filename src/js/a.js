import {test} from './module.js';
console.log(test);
test.test = 'a';

export default {
	test: test.test
}
