import { defineConfig } from 'vite'
import Unplugin from '@productdevbook/ts-i18n/vite'

export default defineConfig({
  plugins: [
    Unplugin({
      exportFilePath: 'i18n.d.ts',
      localesFolder: 'locales',
      selectLanguage: 'en',
    }),
  ],
})
