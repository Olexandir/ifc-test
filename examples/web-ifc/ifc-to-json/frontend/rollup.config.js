import resolve from '@rollup/plugin-node-resolve';

export default {
  input: './examples/web-ifc/ifc-to-json/frontend/app.js',
  output: [
    {
      format: 'esm',
      file: './examples/web-ifc/ifc-to-json/frontend/bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
};