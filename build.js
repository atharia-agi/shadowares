const rollup = require('rollup');
const { babel } = require('@rollup/plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');

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