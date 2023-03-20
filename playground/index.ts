import { Polyglot } from '@productdevbook/ts-i18n'
import type { I18nTranslations } from './i18n'

const polyglot = new Polyglot<I18nTranslations>({
  loaderOptions: {
    defaultLocale: 'en',
    path: 'locales',
    typesOutputPath: 'i18n.d.ts',
  },
})

polyglot.extend()

console.log(polyglot.t('headeraaa.x-foo', { foo: '123123123' })) // Hello
