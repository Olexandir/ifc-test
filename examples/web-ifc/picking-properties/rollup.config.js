import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'examples/web-ifc-three/picking-properties/app.js',
  output: [
    {
      format: 'esm',
      file: 'examples/web-ifc-three/picking-properties/bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
};