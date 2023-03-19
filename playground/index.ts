import { Polyglot } from '@productdevbook/ts-i18n'

const polyglot = new Polyglot()

polyglot.extend({
  hello: 'Hello',
})

console.log(polyglot.t('hello')) // Hello
