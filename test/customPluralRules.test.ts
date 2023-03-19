import { describe, expect, it } from 'vitest'
import { Polyglot } from '@productdevbook/ts-i18n'

describe('custom pluralRules', () => {
  const customPluralRules = {
    pluralTypes: {
      germanLike(n: number) {
        // is 1
        if (n === 1)
          return 0

        // everything else
        return 1
      },
      frenchLike(n: number) {
        // is 0 or 1
        if (n <= 1)
          return 0

        // everything else
        return 1
      },
    },
    pluralTypeToLanguages: {
      germanLike: ['x1'],
      frenchLike: ['x2'],
    },
  }

  const testPhrases = {
    test_phrase: '%{smart_count} form zero |||| %{smart_count} form one',
  }

  it('pluralizes in x1', () => {
    const polyglot = new Polyglot({
      phrases: testPhrases,
      locale: 'x1',
      pluralRules: customPluralRules,
    })

    expect(polyglot.t('test_phrase', 0)).to.equal('0 form one')
    expect(polyglot.t('test_phrase', 1)).to.equal('1 form zero')
    expect(polyglot.t('test_phrase', 2)).to.equal('2 form one')
  })

  it('pluralizes in x2', () => {
    const polyglot = new Polyglot({
      phrases: testPhrases,
      locale: 'x2',
      pluralRules: customPluralRules,
    })

    expect(polyglot.t('test_phrase', 0)).to.equal('0 form zero')
    expect(polyglot.t('test_phrase', 1)).to.equal('1 form zero')
    expect(polyglot.t('test_phrase', 2)).to.equal('2 form one')
  })

  it('memoizes plural type language correctly and selects the correct locale after several calls', () => {
    const polyglot = new Polyglot({
      phrases: {
        test_phrase: '%{smart_count} Name |||| %{smart_count} Names',
      },
      locale: 'x1',
      pluralRules: customPluralRules,
    })

    expect(polyglot.t('test_phrase', 0)).to.equal('0 Names')
    expect(polyglot.t('test_phrase', 0)).to.equal('0 Names')
    expect(polyglot.t('test_phrase', 1)).to.equal('1 Name')
    expect(polyglot.t('test_phrase', 1)).to.equal('1 Name')
    expect(polyglot.t('test_phrase', 2)).to.equal('2 Names')
    expect(polyglot.t('test_phrase', 2)).to.equal('2 Names')
  })
})
