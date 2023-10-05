import { beforeEach, describe, expect, it, vi, vitest } from 'vitest'
import { Polyglot } from '@productdevbook/ts-i18n'
import consola from 'consola'
import c from 'picocolors'
import type { I18nTranslations } from './.cache/i18n'

// The two tests marked with concurrent will be run in parallel
describe('type safety EN', () => {
  let polyglot: Polyglot<I18nTranslations>
  beforeEach(() => {
    polyglot = new Polyglot<I18nTranslations>({
      locale: 'en',
      loaderOptions: {
        path: './test/.cache/locales',
        typesOutputPath: './test/.cache/i18n.d.ts',
      },
    })
  })

  it('translates a simple string', () => {
    expect(polyglot.t('hello')).to.equal('Hello')
  })

  it('returns the key if translation not found', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: 'John',
      place: 'Vite',
    })).to.equal('Hi, John, welcome to Vite!')
  })
})

describe('type safety TR', () => {
  let polyglot: Polyglot<I18nTranslations>
  beforeEach(() => {
    polyglot = new Polyglot<I18nTranslations>({
      locale: 'tr',
      loaderOptions: {
        path: './test/.cache/locales',
        typesOutputPath: './test/.cache/i18n.d.ts',
      },
    })
  })

  it('translates a simple string', () => {
    expect(polyglot.t('hello')).to.equal('Merhaba')
  })

  it('returns the key if translation not found', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: 'John',
      place: 'Vite',
    })).to.equal('Merhaba John, Vite! hoşgeldin!')
  })
})

describe('errorOnMissing', () => {
  let polyglot: Polyglot<I18nTranslations>
  beforeEach(() => {
    polyglot = new Polyglot<I18nTranslations>({
      locale: 'tr',
      loaderOptions: {
        path: './test/.cache/locales',
        typesOutputPath: './test/.cache/i18n.d.ts',
      },
      errorOnMissing: true,
    })
  })

  it('translates a simple string', () => {
    expect(polyglot.t('hello')).to.equal('Merhaba')
  })

  it('returns the key if translation not found', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: 'John',
      place: 'Vite',
    })).to.equal('Merhaba John, Vite! hoşgeldin!')
  })

  it('error variables', () => {
    const spy = vitest.spyOn(console, 'info').mockImplementation(() => { })

    expect(polyglot.t('hi_name_welcome_to_place', {
      name: 'John',
    }))

    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0][0]).include('hi_name_welcome_to_place')
    expect(spy.mock.calls[0][0]).include('place')
  })

  it('error two variables ', () => {
    const spy = vitest.spyOn(console, 'info').mockImplementation(() => { })

    expect(polyglot.t('hi_name_welcome_to_place', {
    }))

    expect(spy).toHaveBeenCalled()
    expect(spy.mock.calls[0][0]).include('hi_name_welcome_to_place')
    expect(spy.mock.calls[0][0]).toMatch(/'name'/)

    expect(spy.mock.calls[1][0]).include('hi_name_welcome_to_place')
    expect(spy.mock.calls[1][0]).toMatch(/'place'/)
  })
})
