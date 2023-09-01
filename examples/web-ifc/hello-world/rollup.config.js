import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'examples/web-ifc/hello-world/app.js',
  output: [
    {
      format: 'esm',
      file: 'examples/web-ifc/hello-world/bundle.js',
    },
  ],
  plugins: [resolve()],
};
