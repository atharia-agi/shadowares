import rollup from 'rollup';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

async function build() {
  const inputOptions = {
    input: 'src/index.js',
    plugins: [
      babel(),
      commonjs(),
      nodeResolve(),
      terser()
    ]
  };

  const bundle = await rollup.rollup(inputOptions);

  await bundle.write({
    file: 'dist/shadow-toolkit.cjs.js',
    format: 'cjs',
    sourcemap: true
  });

  await bundle.write({
    file: 'dist/shadow-toolkit.esm.js',
    format: 'esm',
    sourcemap: true
  });

  await bundle.write({
    file: 'dist/shadow-toolkit.umd.js',
    format: 'umd',
    name: 'ShadowToolkit',
    sourcemap: true
  });

  console.log('Build completed successfully');
}

build().catch(console.error);