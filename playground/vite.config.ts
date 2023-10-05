import { defineConfig } from 'vite'
import Unplugin from '@productdevbook/ts-i18n/vite'

export default defineConfig({
  plugins: [
    Unplugin({
      exportFilePath: 'dene.ts',
      localesFolder: 'locales',
      selectLanguage: 'en',
    }),
  ],
})
