import { beforeEach, describe, expect, it } from 'vitest'
import { Polyglot } from '@productdevbook/ts-i18n'

describe('pluralize', () => {
  const phrases = {
    count_name: '%{smart_count} Name |||| %{smart_count} Names',
  }

  let polyglot: Polyglot
  beforeEach(() => {
    polyglot = new Polyglot({ phrases, locale: 'en' })
  })

  it('supports pluralization with an integer', () => {
    expect(polyglot.t('count_name', { smart_count: 0 })).to.equal('0 Names')
    expect(polyglot.t('count_name', { smart_count: 1 })).to.equal('1 Name')
    expect(polyglot.t('count_name', { smart_count: 2 })).to.equal('2 Names')
    expect(polyglot.t('count_name', { smart_count: 3 })).to.equal('3 Names')
  })

  it('accepts a number as a shortcut to pluralize a word', () => {
    expect(polyglot.t('count_name', 0)).to.equal('0 Names')
    expect(polyglot.t('count_name', 1)).to.equal('1 Name')
    expect(polyglot.t('count_name', 2)).to.equal('2 Names')
    expect(polyglot.t('count_name', 3)).to.equal('3 Names')
  })

  it('ignores a region subtag when choosing a pluralization rule', () => {
    const instance = new Polyglot({ phrases, locale: 'fr-FR' })
    // French rule: "0" is singular
    expect(instance.t('count_name', 0)).to.equal('0 Name')
  })
})

describe('locale', () => {
  let polyglot: Polyglot
  beforeEach(() => {
    polyglot = new Polyglot({
      locale: 'en',
    })
  })

  it('defaults to "en"', () => {
    expect(polyglot.locale()).to.equal('en')
  })

  it('gets and sets locale', () => {
    polyglot.locale('es')
    expect(polyglot.locale()).to.equal('es')

    polyglot.locale('fr')
    expect(polyglot.locale()).to.equal('fr')
  })
})

describe('extend', () => {
  let polyglot: Polyglot
  beforeEach(() => {
    polyglot = new Polyglot({
      locale: 'en',
    })
  })

  it('handles null gracefully', () => {
    expect(() => {
      polyglot.extend(null)
    }).to.not.throw()
  })

  it('handles undefined gracefully', () => {
    expect(() => {
      polyglot.extend(undefined)
    }).to.not.throw()
  })

  it('supports multiple extends, overriding old keys', () => {
    polyglot.extend({ aKey: 'First time' })
    polyglot.extend({ aKey: 'Second time' })
    expect(polyglot.t('aKey')).to.equal('Second time')
  })

  it('does not forget old keys', () => {
    polyglot.extend({ firstKey: 'Numba one', secondKey: 'Numba two' })
    polyglot.extend({ secondKey: 'Numero dos' })
    expect(polyglot.t('firstKey')).to.equal('Numba one')
  })

  it('supports optional `prefix` argument', () => {
    polyglot.extend({ click: 'Click', hover: 'Hover' }, 'sidebar')
    expect(polyglot.phrases['sidebar.click']).to.equal('Click')
    expect(polyglot.phrases['sidebar.hover']).to.equal('Hover')
    expect(polyglot.phrases).not.to.have.property('click')
  })

  it('supports nested object', () => {
    polyglot.extend({
      sidebar: {
        click: 'Click',
        hover: 'Hover',
      },
      nav: {
        header: {
          log_in: 'Log In',
        },
      },
    })
    expect(polyglot.phrases['sidebar.click']).to.equal('Click')
    expect(polyglot.phrases['sidebar.hover']).to.equal('Hover')
    expect(polyglot.phrases['nav.header.log_in']).to.equal('Log In')
    expect(polyglot.phrases).not.to.have.property('click')
    expect(polyglot.phrases).not.to.have.property('header.log_in')
    expect(polyglot.phrases).not.to.have.property('log_in')
  })
})

describe('clear', () => {
  let polyglot: Polyglot
  beforeEach(() => {
    polyglot = new Polyglot({
      locale: 'en',
    })
  })

  it('wipes out old phrases', () => {
    polyglot.extend({ hiFriend: 'Hi, Friend.' })
    polyglot.clear()
    expect(polyglot.t('hiFriend')).to.equal('hiFriend')
  })
})

describe('replace', () => {
  let polyglot: Polyglot
  beforeEach(() => {
    polyglot = new Polyglot({
      locale: 'en',
    })
  })

  it('wipes out old phrases and replace with new phrases', () => {
    polyglot.extend({ hiFriend: 'Hi, Friend.', byeFriend: 'Bye, Friend.' })
    polyglot.replace({ hiFriend: 'Hi, Friend.' })
    expect(polyglot.t('hiFriend')).to.equal('Hi, Friend.')
    expect(polyglot.t('byeFriend')).to.equal('byeFriend')
  })
})

describe('unset', () => {
  let polyglot: Polyglot
  beforeEach(() => {
    polyglot = new Polyglot({
      locale: 'en',
    })
  })

  it('handles null gracefully', () => {
    expect(() => {
      polyglot.unset(null)
    }).to.not.throw()
  })

  it('handles undefined gracefully', () => {
    expect(() => {
      polyglot.unset(undefined)
    }).to.not.throw()
  })

  it('unsets a key based on a string', () => {
    polyglot.extend({ test_key: 'test_value' })
    expect(polyglot.has('test_key')).to.equal(true)

    polyglot.unset('test_key')
    expect(polyglot.has('test_key')).to.equal(false)
  })

  it('unsets a key based on an object hash', () => {
    polyglot.extend({ test_key: 'test_value', foo: 'bar' })
    expect(polyglot.has('test_key')).to.equal(true)
    expect(polyglot.has('foo')).to.equal(true)

    polyglot.unset({ test_key: 'test_value', foo: 'bar' })
    expect(polyglot.has('test_key')).to.equal(false)
    expect(polyglot.has('foo')).to.equal(false)
  })

  it('unsets nested objects using recursive prefix call', () => {
    polyglot.extend({ foo: { bar: 'foobar' } })
    expect(polyglot.has('foo.bar')).to.equal(true)

    polyglot.unset({ foo: { bar: 'foobar' } })
    expect(polyglot.has('foo.bar')).to.equal(false)
  })
})
