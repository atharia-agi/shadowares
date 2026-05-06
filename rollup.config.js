import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const extensions = ['.js'];

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/shadow-toolkit.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/shadow-toolkit.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    {
      file: 'dist/shadow-toolkit.umd.js',
      format: 'umd',
      name: 'ShadowToolkit',
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve({ extensions }),
    commonjs(),
    babel({ extensions, babelHelpers: 'bundled' }),
    terser(),
  ],
};
