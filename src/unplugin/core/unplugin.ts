import { resolve } from 'node:path'
import { createUnplugin } from 'unplugin'
import type { Options } from '../types'
import { generateTS } from './generate'

export default createUnplugin<Options>((options) => {
  return {
    name: 'unplugin-starter',
    async buildStart() {
      options = {
        exportFilePath: options?.exportFilePath ? resolve(options.exportFilePath) : resolve('./i18n.d.ts'),
        localesFolder: options?.localesFolder ? resolve(options.localesFolder) : resolve('./locales'),
        selectLanguage: 'en',
        header: options?.header,
      }

      await generateTS(options)
    },
  }
})
