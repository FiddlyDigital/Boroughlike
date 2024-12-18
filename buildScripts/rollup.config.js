import image from "@rollup/plugin-image";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import css from "rollup-plugin-css-only";
import { version } from '../package.json';

import { createBasicConfig } from '@open-wc/building-rollup';
import merge from 'deepmerge';

const baseConfig = createBasicConfig();
delete baseConfig.output.dir;               // we use file instead, so no longer needed
delete baseConfig.preserveEntrySignatures;  // Unused. Removed do to warning on build

export default merge(baseConfig, {
  input: './out-tsc/src/app.js',
  output: {
    file: `./dist/boroughlike.min.js`,
    format: "esm"
  },
  onwarn(warning, warn) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      warn(warning);
    }
  },
  plugins: [image(), nodeResolve()],
});
