import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { version } from '../package.json';

import merge from 'deepmerge';
import { createBasicConfig } from '@open-wc/building-rollup';

const baseConfig = createBasicConfig();
delete baseConfig.output.dir;

export default merge(baseConfig, {
  input: './out-tsc/src/game.js',
  output: {
      file: `./dist/boroughlike_${version}.min.js`
  }
});

// export default {
//   input: './src/game.js',
//   output: {
//     file: `./dist/boroughlike_${version}.min.js`,    
//     format: 'es',
//     plugins: [terser({
//       mangle: {
//         module : true
//       }
//     })]
//   },
//   plugins: [json()]
// }