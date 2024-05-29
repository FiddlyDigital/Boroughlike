import { version } from '../package.json';
import css from "rollup-plugin-css-only";
import image from "@rollup/plugin-image";

import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createBasicConfig();
delete baseConfig.output.dir;               // we use file instead, so no longer needed
delete baseConfig.preserveEntrySignatures;  // Unused. Removed do to warning on build

export default merge(baseConfig, {
  input: './out-tsc/src/app.js',
  output: {
    file: `./dist/boroughlike_${version}.min.js`,
    format: "esm"
  },
  plugins: [css(), image()],
});
