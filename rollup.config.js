import {terser} from 'rollup-plugin-terser';

export default {
    input: 'js/game.js',
    output: {
      file: 'dist/boroughlike.js',
      format: 'es',
      plugins: [terser()]
    }
  }