import type { Options } from 'tsup'

import pkg from './package.json'

const external = [
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
]

export default <Options>{
  entryPoints: [
    'src/index.ts',
    'src/unplugin/*.ts',
  ],
  outDir: 'dist',
  target: 'node18',
  format: ['esm', 'cjs'],
  clean: true,
  dts: true,
  minify: true,
  external,
}
