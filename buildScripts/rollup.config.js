import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import { version } from '../package.json';

export default {
  input: './src/game.js',
  output: {
    file: `./dist/boroughlike_${version}.min.js`,    
    format: 'es',
    plugins: [terser({
      mangle: {
        module : true
      }
    })]
  },
  plugins: [json()]
}