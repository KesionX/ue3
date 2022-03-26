import { baseParse } from '../dist/index.js';


const ast = baseParse('<div isShow name="kesion" :age="age" ></div>');

console.log('ast: ', ast);