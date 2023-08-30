import resolve from '@rollup/plugin-node-resolve';

export default {
  input: './examples/web-ifc/ifc-to-json/properties/app.js',
  output: [
    {
      format: 'esm',
      file: './examples/web-ifc/ifc-to-json/properties/bundle.js'
    },
  ],
  plugins: [
    resolve(),
  ]
};