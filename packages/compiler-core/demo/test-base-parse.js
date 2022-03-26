import { baseParse } from '../dist/index.js';


// const ast = baseParse('<div isShow name="kesion" :age="age" @click="handClick  ></div>');

const ast = baseParse('<div  ></div>');

console.log('ast: ', ast);