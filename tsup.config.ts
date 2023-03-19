import type { Options } from 'tsup'

export default <Options>{
  entryPoints: ['src/index.ts'],
  outDir: 'dist',
  target: 'node16',
  format: ['esm', 'iife'],
  clean: true,
  dts: true,
  minify: true,
}
