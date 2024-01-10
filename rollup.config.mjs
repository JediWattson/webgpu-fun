import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import terser from '@rollup/plugin-terser';


export default {
    input: './src/index.ts',
    output: [
        {
            file: 'dist/bundle.js',
            format: 'esm',
            sourcemap: true,
            name: 'webgpu-fun'
        }
    ],
    plugins: [
        peerDepsExternal(),
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }),
        terser(),
        postcss()
    ]
}