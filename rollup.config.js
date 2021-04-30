import sucrase from 'rollup-plugin-sucrase'
import resolve from '@rollup/plugin-node-resolve'
import pkg from './package.json'

export default {
    input: 'src/index.ts',
    output: [
        { file: pkg.main, format: 'cjs' },
        { file: pkg.module, format: 'esm' },
    ],
    plugins: [
        resolve(),
        sucrase({
            transforms: ['typescript'],
        }),
    ],
}
