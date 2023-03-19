import { describe, expect, it } from 'vitest'
import { Polyglot, forEach } from '@productdevbook/ts-i18n'

describe('locale-specific pluralization rules', () => {
  it('pluralizes in Arabic', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      'ولا صوت',
      'صوت واحد',
      'صوتان',
      '%{smart_count} أصوات',
      '%{smart_count} صوت',
      '%{smart_count} صوت',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglot = new Polyglot({ phrases, locale: 'ar' })

    expect(polyglot.t('n_votes', 0)).to.equal('ولا صوت')
    expect(polyglot.t('n_votes', 1)).to.equal('صوت واحد')
    expect(polyglot.t('n_votes', 2)).to.equal('صوتان')
    expect(polyglot.t('n_votes', 3)).to.equal('3 أصوات')
    expect(polyglot.t('n_votes', 11)).to.equal('11 صوت')
    expect(polyglot.t('n_votes', 102)).to.equal('102 صوت')
  })

  it('interpolates properly in Arabic', () => {
    const phrases = {
      hello: 'الرمز ${code} غير صحيح', // eslint-disable-line no-template-curly-in-string
    }

    const polyglot = new Polyglot({
      phrases,
      locale: 'ar',
      interpolation: { prefix: '${', suffix: '}' },
    })

    expect(polyglot.t('hello', { code: 'De30Niro' })).to.equal('الرمز De30Niro غير صحيح')

    // note how the "30" in the next line shows up in the wrong place:
    expect(polyglot.t('hello', { code: '30DeNiro' })).to.equal('الرمز 30DeNiro غير صحيح')
    // but with a directional marker character, it shows up in the right place:
    expect(polyglot.t('hello', { code: '\u200E30DeNiroMarker' })).to.equal('الرمز \u200E30DeNiroMarker غير صحيح')
    // see https://github.com/airbnb/polyglot.js/issues/167 / https://stackoverflow.com/a/34903965 for why it's impractical to handle in polyglot
  })

  it('pluralizes in Russian', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      '%{smart_count} машина',
      '%{smart_count} машины',
      '%{smart_count} машин',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglotLanguageCode = new Polyglot({ phrases, locale: 'ru' })

    expect(polyglotLanguageCode.t('n_votes', 1)).to.equal('1 машина')
    expect(polyglotLanguageCode.t('n_votes', 11)).to.equal('11 машин')
    expect(polyglotLanguageCode.t('n_votes', 101)).to.equal('101 машина')
    expect(polyglotLanguageCode.t('n_votes', 112)).to.equal('112 машин')
    expect(polyglotLanguageCode.t('n_votes', 932)).to.equal('932 машины')
    expect(polyglotLanguageCode.t('n_votes', 324)).to.equal('324 машины')
    expect(polyglotLanguageCode.t('n_votes', 12)).to.equal('12 машин')
    expect(polyglotLanguageCode.t('n_votes', 13)).to.equal('13 машин')
    expect(polyglotLanguageCode.t('n_votes', 14)).to.equal('14 машин')
    expect(polyglotLanguageCode.t('n_votes', 15)).to.equal('15 машин')

    const polyglotLocaleId = new Polyglot({ phrases, locale: 'ru-RU' })

    expect(polyglotLocaleId.t('n_votes', 1)).to.equal('1 машина')
    expect(polyglotLocaleId.t('n_votes', 11)).to.equal('11 машин')
    expect(polyglotLocaleId.t('n_votes', 101)).to.equal('101 машина')
    expect(polyglotLocaleId.t('n_votes', 112)).to.equal('112 машин')
    expect(polyglotLocaleId.t('n_votes', 932)).to.equal('932 машины')
    expect(polyglotLocaleId.t('n_votes', 324)).to.equal('324 машины')
    expect(polyglotLocaleId.t('n_votes', 12)).to.equal('12 машин')
    expect(polyglotLocaleId.t('n_votes', 13)).to.equal('13 машин')
    expect(polyglotLocaleId.t('n_votes', 14)).to.equal('14 машин')
    expect(polyglotLocaleId.t('n_votes', 15)).to.equal('15 машин')
  })

  it('pluralizes in Croatian (guest) Test', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      '%{smart_count} gost',
      '%{smart_count} gosta',
      '%{smart_count} gostiju',
    ]
    const phrases = {
      n_guests: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglotLocale = new Polyglot({ phrases, locale: 'hr-HR' })

    expect(polyglotLocale.t('n_guests', 1)).to.equal('1 gost')
    expect(polyglotLocale.t('n_guests', 11)).to.equal('11 gostiju')
    expect(polyglotLocale.t('n_guests', 21)).to.equal('21 gost')

    expect(polyglotLocale.t('n_guests', 2)).to.equal('2 gosta')
    expect(polyglotLocale.t('n_guests', 3)).to.equal('3 gosta')
    expect(polyglotLocale.t('n_guests', 4)).to.equal('4 gosta')

    expect(polyglotLocale.t('n_guests', 12)).to.equal('12 gostiju')
    expect(polyglotLocale.t('n_guests', 13)).to.equal('13 gostiju')
    expect(polyglotLocale.t('n_guests', 14)).to.equal('14 gostiju')
    expect(polyglotLocale.t('n_guests', 112)).to.equal('112 gostiju')
    expect(polyglotLocale.t('n_guests', 113)).to.equal('113 gostiju')
    expect(polyglotLocale.t('n_guests', 114)).to.equal('114 gostiju')
  })

  it('pluralizes in Croatian (vote) Test', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      '%{smart_count} glas',
      '%{smart_count} glasa',
      '%{smart_count} glasova',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglotLocale = new Polyglot({ phrases, locale: 'hr-HR' })

    forEach([1, 21, 31, 101], (c) => {
      expect(polyglotLocale.t('n_votes', c)).to.equal(`${c} glas`)
    })
    forEach([2, 3, 4, 22, 23, 24, 32, 33, 34], (c) => {
      expect(polyglotLocale.t('n_votes', c)).to.equal(`${c} glasa`)
    })
    forEach([0, 5, 6, 11, 12, 13, 14, 15, 16, 17, 25, 26, 35, 36, 112, 113, 114], (c) => {
      expect(polyglotLocale.t('n_votes', c)).to.equal(`${c} glasova`)
    })

    const polyglotLanguageCode = new Polyglot({ phrases, locale: 'hr' })

    forEach([1, 21, 31, 101], (c) => {
      expect(polyglotLanguageCode.t('n_votes', c)).to.equal(`${c} glas`)
    })
    forEach([2, 3, 4, 22, 23, 24, 32, 33, 34], (c) => {
      expect(polyglotLanguageCode.t('n_votes', c)).to.equal(`${c} glasa`)
    })
    forEach([0, 5, 6, 11, 12, 13, 14, 15, 16, 17, 25, 26, 35, 36, 112, 113, 114], (c) => {
      expect(polyglotLanguageCode.t('n_votes', c)).to.equal(`${c} glasova`)
    })
  })

  it('pluralizes in Serbian (Latin & Cyrillic)', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      '%{smart_count} miš',
      '%{smart_count} miša',
      '%{smart_count} miševa',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglotLatin = new Polyglot({ phrases, locale: 'srl-RS' })

    expect(polyglotLatin.t('n_votes', 1)).to.equal('1 miš')
    expect(polyglotLatin.t('n_votes', 11)).to.equal('11 miševa')
    expect(polyglotLatin.t('n_votes', 101)).to.equal('101 miš')
    expect(polyglotLatin.t('n_votes', 932)).to.equal('932 miša')
    expect(polyglotLatin.t('n_votes', 324)).to.equal('324 miša')
    expect(polyglotLatin.t('n_votes', 12)).to.equal('12 miševa')
    expect(polyglotLatin.t('n_votes', 13)).to.equal('13 miševa')
    expect(polyglotLatin.t('n_votes', 14)).to.equal('14 miševa')
    expect(polyglotLatin.t('n_votes', 15)).to.equal('15 miševa')
    expect(polyglotLatin.t('n_votes', 0)).to.equal('0 miševa')

    const polyglotCyrillic = new Polyglot({ phrases, locale: 'sr-RS' })

    expect(polyglotCyrillic.t('n_votes', 1)).to.equal('1 miš')
    expect(polyglotCyrillic.t('n_votes', 11)).to.equal('11 miševa')
    expect(polyglotCyrillic.t('n_votes', 101)).to.equal('101 miš')
    expect(polyglotCyrillic.t('n_votes', 932)).to.equal('932 miša')
    expect(polyglotCyrillic.t('n_votes', 324)).to.equal('324 miša')
    expect(polyglotCyrillic.t('n_votes', 12)).to.equal('12 miševa')
    expect(polyglotCyrillic.t('n_votes', 13)).to.equal('13 miševa')
    expect(polyglotCyrillic.t('n_votes', 14)).to.equal('14 miševa')
    expect(polyglotCyrillic.t('n_votes', 15)).to.equal('15 miševa')
    expect(polyglotCyrillic.t('n_votes', 0)).to.equal('0 miševa')
  })

  it('pluralizes in Bosnian (Latin & Cyrillic)', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      '%{smart_count} članak',
      '%{smart_count} članka',
      '%{smart_count} članaka',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglotLatin = new Polyglot({ phrases, locale: 'bs-Latn-BA' })

    expect(polyglotLatin.t('n_votes', 1)).to.equal('1 članak')
    expect(polyglotLatin.t('n_votes', 11)).to.equal('11 članaka')
    expect(polyglotLatin.t('n_votes', 101)).to.equal('101 članak')
    expect(polyglotLatin.t('n_votes', 932)).to.equal('932 članka')
    expect(polyglotLatin.t('n_votes', 324)).to.equal('324 članka')
    expect(polyglotLatin.t('n_votes', 12)).to.equal('12 članaka')
    expect(polyglotLatin.t('n_votes', 13)).to.equal('13 članaka')
    expect(polyglotLatin.t('n_votes', 14)).to.equal('14 članaka')
    expect(polyglotLatin.t('n_votes', 15)).to.equal('15 članaka')
    expect(polyglotLatin.t('n_votes', 112)).to.equal('112 članaka')
    expect(polyglotLatin.t('n_votes', 113)).to.equal('113 članaka')
    expect(polyglotLatin.t('n_votes', 114)).to.equal('114 članaka')
    expect(polyglotLatin.t('n_votes', 115)).to.equal('115 članaka')
    expect(polyglotLatin.t('n_votes', 0)).to.equal('0 članaka')

    const polyglotCyrillic = new Polyglot({ phrases, locale: 'bs-Cyrl-BA' })

    expect(polyglotCyrillic.t('n_votes', 1)).to.equal('1 članak')
    expect(polyglotCyrillic.t('n_votes', 11)).to.equal('11 članaka')
    expect(polyglotCyrillic.t('n_votes', 101)).to.equal('101 članak')
    expect(polyglotCyrillic.t('n_votes', 932)).to.equal('932 članka')
    expect(polyglotCyrillic.t('n_votes', 324)).to.equal('324 članka')
    expect(polyglotCyrillic.t('n_votes', 12)).to.equal('12 članaka')
    expect(polyglotCyrillic.t('n_votes', 13)).to.equal('13 članaka')
    expect(polyglotCyrillic.t('n_votes', 14)).to.equal('14 članaka')
    expect(polyglotCyrillic.t('n_votes', 15)).to.equal('15 članaka')
    expect(polyglotCyrillic.t('n_votes', 112)).to.equal('112 članaka')
    expect(polyglotCyrillic.t('n_votes', 113)).to.equal('113 članaka')
    expect(polyglotCyrillic.t('n_votes', 114)).to.equal('114 članaka')
    expect(polyglotCyrillic.t('n_votes', 115)).to.equal('115 članaka')
    expect(polyglotCyrillic.t('n_votes', 0)).to.equal('0 članaka')
  })

  it('pluralizes in Czech', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      '%{smart_count} komentář',
      '%{smart_count} komentáře',
      '%{smart_count} komentářů',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglot = new Polyglot({ phrases, locale: 'cs-CZ' })

    expect(polyglot.t('n_votes', 1)).to.equal('1 komentář')
    expect(polyglot.t('n_votes', 2)).to.equal('2 komentáře')
    expect(polyglot.t('n_votes', 3)).to.equal('3 komentáře')
    expect(polyglot.t('n_votes', 4)).to.equal('4 komentáře')
    expect(polyglot.t('n_votes', 0)).to.equal('0 komentářů')
    expect(polyglot.t('n_votes', 11)).to.equal('11 komentářů')
    expect(polyglot.t('n_votes', 12)).to.equal('12 komentářů')
    expect(polyglot.t('n_votes', 16)).to.equal('16 komentářů')
  })

  it('pluralizes in Slovenian', () => {
    // English would be: "1 vote" / "%{smart_count} votes"
    const whatSomeoneTranslated = [
      '%{smart_count} komentar',
      '%{smart_count} komentarja',
      '%{smart_count} komentarji',
      '%{smart_count} komentarjev',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglot = new Polyglot({ phrases, locale: 'sl-SL' })

    forEach([1, 12301, 101, 1001, 201, 301], (c) => {
      expect(polyglot.t('n_votes', c)).to.equal(`${c} komentar`)
    })

    forEach([2, 102, 202, 302], (c) => {
      expect(polyglot.t('n_votes', c)).to.equal(`${c} komentarja`)
    })

    forEach([0, 11, 12, 13, 14, 52, 53], (c) => {
      expect(polyglot.t('n_votes', c)).to.equal(`${c} komentarjev`)
    })
  })

  it('pluralizes in Turkish', () => {
    const whatSomeoneTranslated = [
      'Sepetinizde %{smart_count} X var. Bunu almak istiyor musunuz?',
      'Sepetinizde %{smart_count} X var. Bunları almak istiyor musunuz?',
    ]
    const phrases = {
      n_x_cart: whatSomeoneTranslated.join(' |||| '),
    }

    const polyglot = new Polyglot({ phrases, locale: 'tr' })

    expect(polyglot.t('n_x_cart', 1)).to.equal('Sepetinizde 1 X var. Bunu almak istiyor musunuz?')
    expect(polyglot.t('n_x_cart', 2)).to.equal('Sepetinizde 2 X var. Bunları almak istiyor musunuz?')
  })

  it('pluralizes in Lithuanian', () => {
    const whatSomeoneTranslated = [
      '%{smart_count} balsas',
      '%{smart_count} balsai',
      '%{smart_count} balsų',
    ]
    const phrases = {
      n_votes: whatSomeoneTranslated.join(' |||| '),
    }
    const polyglot = new Polyglot({ phrases, locale: 'lt' })

    expect(polyglot.t('n_votes', 0)).to.equal('0 balsų')
    expect(polyglot.t('n_votes', 1)).to.equal('1 balsas')
    expect(polyglot.t('n_votes', 2)).to.equal('2 balsai')
    expect(polyglot.t('n_votes', 9)).to.equal('9 balsai')
    expect(polyglot.t('n_votes', 10)).to.equal('10 balsų')
    expect(polyglot.t('n_votes', 11)).to.equal('11 balsų')
    expect(polyglot.t('n_votes', 12)).to.equal('12 balsų')
    expect(polyglot.t('n_votes', 90)).to.equal('90 balsų')
    expect(polyglot.t('n_votes', 91)).to.equal('91 balsas')
    expect(polyglot.t('n_votes', 92)).to.equal('92 balsai')
    expect(polyglot.t('n_votes', 102)).to.equal('102 balsai')
  })

  it('pluralizes in Romanian', () => {
    const whatSomeoneTranslated = [
      '%{smart_count} zi',
      '%{smart_count} zile',
      '%{smart_count} de zile',
    ]
    const phrases = {
      n_days: whatSomeoneTranslated.join(' |||| '),
    }
    const polyglot = new Polyglot({ phrases, locale: 'ro' })

    expect(polyglot.t('n_days', 0)).to.equal('0 zile')
    expect(polyglot.t('n_days', 1)).to.equal('1 zi')
    expect(polyglot.t('n_days', 2)).to.equal('2 zile')
    expect(polyglot.t('n_days', 10)).to.equal('10 zile')
    expect(polyglot.t('n_days', 19)).to.equal('19 zile')
    expect(polyglot.t('n_days', 20)).to.equal('20 de zile')
    expect(polyglot.t('n_days', 21)).to.equal('21 de zile')
    expect(polyglot.t('n_days', 100)).to.equal('100 de zile')
    expect(polyglot.t('n_days', 101)).to.equal('101 de zile')
    expect(polyglot.t('n_days', 102)).to.equal('102 zile')
    expect(polyglot.t('n_days', 119)).to.equal('119 zile')
    expect(polyglot.t('n_days', 120)).to.equal('120 de zile')
  })

  it('pluralizes in Macedonian', () => {
    const whatSomeoneTranslated = [
      '%{smart_count} ден',
      '%{smart_count} дена',
    ]
    const phrases = {
      n_days: whatSomeoneTranslated.join(' |||| '),
    }
    const polyglot = new Polyglot({ phrases, locale: 'mk' })

    expect(polyglot.t('n_days', 0)).to.equal('0 дена')
    expect(polyglot.t('n_days', 1)).to.equal('1 ден')
    expect(polyglot.t('n_days', 2)).to.equal('2 дена')
    expect(polyglot.t('n_days', 10)).to.equal('10 дена')
    expect(polyglot.t('n_days', 11)).to.equal('11 дена')
    expect(polyglot.t('n_days', 21)).to.equal('21 ден')
    expect(polyglot.t('n_days', 100)).to.equal('100 дена')
    expect(polyglot.t('n_days', 101)).to.equal('101 ден')
    expect(polyglot.t('n_days', 111)).to.equal('111 дена')
  })
})
