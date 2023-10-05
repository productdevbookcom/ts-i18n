import { Polyglot } from '@productdevbook/ts-i18n'
import type { I18nTranslations } from './i18n'

const polyglot = new Polyglot<I18nTranslations>({
  locale: 'tr',
  loaderOptions: {
    path: 'locales',
    typesOutputPath: 'i18n.d.ts',
  },
  errorOnMissing: true,
})

polyglot.extend()

// eslint-disable-next-line no-console
console.log(polyglot.t('headeraaa.x-foo', { tttt: '123123123' })) // Hello
