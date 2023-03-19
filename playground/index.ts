import { Polyglot } from '@productdevbook/ts-i18n'
import type { I18nTranslations } from './i18n'

const polyglot = new Polyglot<I18nTranslations>({
  loaderOptions: {
    path: 'locales',
    typesOutputPath: 'i18n.d.ts',
  },
})

polyglot.extend()

polyglot.generateTS()

console.log(polyglot.t('header.x-foo', { foo: '123123123' })) // Hello

// const data = async () => {
//   const { t } = await autoPolyglot({
//     loaderOptions: {
//       path: 'locales',
//     },
//     typesOutputPath: 'i18n.d.ts',
//   })

//   console.log(t('hello'))
// }

// data()
