import { baseParse } from '../dist/index.js';


// const ast = baseParse('<div isShow name="kesion" :age="age" @click="handClick(2)"  ></div>');

// const ast = baseParse('<div  ></div>');


const ast = baseParse('<div isShow name="kesion" :age="age" @click="handClick(2)"  ><span :style="sss"></span> <div :test="1" /> </div>');

console.log('ast: ', ast);