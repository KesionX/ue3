import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from '@rollup/plugin-typescript';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: "./src/index.ts",
    output: [
        {
            name: "es",
            dir: "dist",
            format: "esm"
        }
    ],
    plugins: [
        typescript({ tsconfig: "./tsconfig.json" }),
        nodeResolve(),
        commonjs()
    ]
};

export default config;
