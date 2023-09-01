import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "pick-and-change/app.js",
  output: [
    {
      format: "esm",
      file: "pick-and-change/bundle.js",
    },
  ],
  plugins: [resolve()],
};
