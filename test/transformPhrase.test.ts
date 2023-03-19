import { describe, expect, it } from 'vitest'
import { Polyglot } from '@productdevbook/ts-i18n'

describe('transformPhrase', () => {
  const simple = '%{name} is %{attribute}'
  const english = '%{smart_count} Name |||| %{smart_count} Names'
  const arabic = [
    'ولا صوت',
    'صوت واحد',
    'صوتان',
    '%{smart_count} أصوات',
    '%{smart_count} صوت',
    '%{smart_count} صوت',
  ].join(' |||| ')

  it('does simple interpolation', () => {
    expect(Polyglot.transformPhrase(simple, { name: 'Polyglot', attribute: 'awesome' })).to.equal('Polyglot is awesome')
  })

  it('removes missing keys', () => {
    expect(Polyglot.transformPhrase(simple, { name: 'Polyglot' })).to.equal('Polyglot is %{attribute}')
  })

  it('selects the correct plural form based on smart_count', () => {
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'en')).to.equal('0 Names')
    expect(Polyglot.transformPhrase(english, { smart_count: 1 }, 'en')).to.equal('1 Name')
    expect(Polyglot.transformPhrase(english, { smart_count: 2 }, 'en')).to.equal('2 Names')
    expect(Polyglot.transformPhrase(english, { smart_count: 3 }, 'en')).to.equal('3 Names')
  })

  it('selects the correct locale', () => {
    // French rule: "0" is singular
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'fr')).to.equal('0 Name')
    expect(Polyglot.transformPhrase(english, { smart_count: 1 }, 'fr')).to.equal('1 Name')
    expect(Polyglot.transformPhrase(english, { smart_count: 1.5 }, 'fr')).to.equal('1.5 Name')
    // French rule: plural starts at 2 included
    expect(Polyglot.transformPhrase(english, { smart_count: 2 }, 'fr')).to.equal('2 Names')
    expect(Polyglot.transformPhrase(english, { smart_count: 3 }, 'fr')).to.equal('3 Names')

    // Arabic has 6 rules
    expect(Polyglot.transformPhrase(arabic, 0, 'ar')).to.equal('ولا صوت')
    expect(Polyglot.transformPhrase(arabic, 1, 'ar')).to.equal('صوت واحد')
    expect(Polyglot.transformPhrase(arabic, 2, 'ar')).to.equal('صوتان')
    expect(Polyglot.transformPhrase(arabic, 3, 'ar')).to.equal('3 أصوات')
    expect(Polyglot.transformPhrase(arabic, 11, 'ar')).to.equal('11 صوت')
    expect(Polyglot.transformPhrase(arabic, 102, 'ar')).to.equal('102 صوت')
  })

  it('defaults to `en`', () => {
    // French rule: "0" is singular
    expect(Polyglot.transformPhrase(english, { smart_count: 0 })).to.equal('0 Names')
  })

  it('ignores a region subtag when choosing a pluralization rule', () => {
    // French rule: "0" is singular
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'fr-FR')).to.equal('0 Name')
  })

  it('works without arguments', () => {
    expect(Polyglot.transformPhrase(english)).to.equal(english)
  })

  it('respects a number as shortcut for smart_count', () => {
    expect(Polyglot.transformPhrase(english, 0, 'en')).to.equal('0 Names')
    expect(Polyglot.transformPhrase(english, 1, 'en')).to.equal('1 Name')
    expect(Polyglot.transformPhrase(english, 5, 'en')).to.equal('5 Names')
  })

  it('throws without sane phrase string', () => {
    expect(() => {
      Polyglot.transformPhrase()
    }).to.throw(TypeError)
    expect(() => {
      Polyglot.transformPhrase(null)
    }).to.throw(TypeError)
    expect(() => {
      Polyglot.transformPhrase(32)
    }).to.throw(TypeError)
    expect(() => {
      Polyglot.transformPhrase({})
    }).to.throw(TypeError)
  })

  it('memoizes plural type language correctly and selects the correct locale after several calls', () => {
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'en')).to.equal('0 Names')
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'en')).to.equal('0 Names')
    expect(Polyglot.transformPhrase(english, { smart_count: 1 }, 'en')).to.equal('1 Name')
    expect(Polyglot.transformPhrase(english, { smart_count: 1 }, 'en')).to.equal('1 Name')

    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'fr')).to.equal('0 Name')
    expect(Polyglot.transformPhrase(english, { smart_count: 0 }, 'fr')).to.equal('0 Name')
    expect(Polyglot.transformPhrase(english, { smart_count: 2 }, 'fr')).to.equal('2 Names')
    expect(Polyglot.transformPhrase(english, { smart_count: 2 }, 'fr')).to.equal('2 Names')
  })
})
