import { beforeEach, describe, expect, it } from 'vitest'
import type { InterpolationTokenOptions } from '@productdevbook/ts-i18n'
import { Polyglot } from '@productdevbook/ts-i18n'
import iterate from 'iterate-iterator'

// The two tests marked with concurrent will be run in parallel
describe('t', () => {
  const phrases = {
    hello: 'Hello',
    hi_name_welcome_to_place: 'Hi, %{name}, welcome to %{place}!',
    name_your_name_is_name: '%{name}, your name is %{name}!',
    empty_string: '',
  }

  let polyglot: Polyglot
  beforeEach(() => {
    polyglot = new Polyglot({ phrases })
  })

  it('translates a simple string', () => {
    expect(polyglot.t('hello')).to.equal('Hello')
  })

  it('returns the key if translation not found', () => {
    expect(polyglot.t('bogus_key')).to.equal('bogus_key')
  })

  it('interpolates', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: 'Spike',
      place: 'the webz',
    })).to.equal('Hi, Spike, welcome to the webz!')
  })

  it('interpolates with missing substitutions', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      place: undefined,
    })).to.equal('Hi, %{name}, welcome to %{place}!')
  })

  it('interpolates the same placeholder multiple times', () => {
    expect(polyglot.t('name_your_name_is_name', {
      name: 'Spike',
    })).to.equal('Spike, your name is Spike!')
  })

  it('allows you to supply default values', () => {
    expect(polyglot.t('can_i_call_you_name', {
      _: 'Can I call you %{name}?',
      name: 'Robert',
    })).to.equal('Can I call you Robert?')
  })

  it('returns the non-interpolated key if not initialized with allowMissing and translation not found', () => {
    expect(polyglot.t('Welcome %{name}', {
      name: 'Robert',
    })).to.equal('Welcome %{name}')
  })

  it('returns an interpolated key if initialized with allowMissing and translation not found', () => {
    const instance = new Polyglot({ phrases, allowMissing: true })
    expect(instance.t('Welcome %{name}', {
      name: 'Robert',
    })).to.equal('Welcome Robert')
  })

  describe('custom interpolation syntax', () => {
    const createWithInterpolation = (interpolation: InterpolationTokenOptions) => {
      return new Polyglot({ phrases: {}, allowMissing: true, interpolation })
    }

    it('interpolates with the specified custom token syntax', () => {
      const instance = createWithInterpolation({ prefix: '{{', suffix: '}}' })
      expect(instance.t('Welcome {{name}}', {
        name: 'Robert',
      })).to.equal('Welcome Robert')
    })

    it('interpolates if the prefix and suffix are the same', () => {
      const instance = createWithInterpolation({ prefix: '|', suffix: '|' })
      expect(instance.t('Welcome |name|, how are you, |name|?', {
        name: 'Robert',
      })).to.equal('Welcome Robert, how are you, Robert?')
    })

    it('interpolates when using regular expression tokens', () => {
      const instance = createWithInterpolation({ prefix: '\\s.*', suffix: '\\d.+' })
      expect(instance.t('Welcome \\s.*name\\d.+', {
        name: 'Robert',
      })).to.equal('Welcome Robert')
    })

    it('throws an error when either prefix or suffix equals to pluralization delimiter', () => {
      expect(() => {
        createWithInterpolation({ prefix: '||||', suffix: '}}' })
      }).to.throw(RangeError)
      expect(() => {
        createWithInterpolation({ prefix: '{{', suffix: '||||' })
      }).to.throw(RangeError)
    })
  })

  it('returns the translation even if it is an empty string', () => {
    expect(polyglot.t('empty_string')).to.equal('')
  })

  it('returns the default value even if it is an empty string', () => {
    expect(polyglot.t('bogus_key', { _: '' })).to.equal('')
  })

  it('handles dollar signs in the substitution value', () => {
    expect(polyglot.t('hi_name_welcome_to_place', {
      name: '$abc $0',
      place: '$1 $&',
    })).to.equal('Hi, $abc $0, welcome to $1 $&!')
  })

  it('supports nested phrase objects', () => {
    const nestedPhrases = {
      'nav': {
        presentations: 'Presentations',
        hi_user: 'Hi, %{user}.',
        cta: {
          join_now: 'Join now!',
        },
      },
      'header.sign_in': 'Sign In',
    }
    const instance = new Polyglot({ phrases: nestedPhrases })
    expect(instance.t('nav.presentations')).to.equal('Presentations')
    expect(instance.t('nav.hi_user', { user: 'Raph' })).to.equal('Hi, Raph.')
    expect(instance.t('nav.cta.join_now')).to.equal('Join now!')
    expect(instance.t('header.sign_in')).to.equal('Sign In')
  })

  it('supports custom replace implementation', () => {
    const instance = new Polyglot({
      phrases,
      replace(interpolationRegex, callback) {
        const phrase = this as any as string
        let i = 0
        const children = []

        iterate(phrase.matchAll(interpolationRegex), (match: any) => {
          if (match.index > i)
            children.push(phrase.slice(i, match.index))

          children.push(callback(match[0], match[1]))
          i = match.index + match[0].length
        })

        if (i < phrase.length)
          children.push(phrase.slice(i))

        return { type: 'might_be_react_fragment', children }
      },
    })

    expect(instance.t(
      'hi_name_welcome_to_place',
      {
        name: { type: 'might_be_react_node', children: ['Rudolf'] },
        place: { type: 'might_be_react_node', children: ['Earth'] },
      },
    )).to.deep.equal({
      children: [
        'Hi, ',
        {
          children: [
            'Rudolf',
          ],
          type: 'might_be_react_node',
        },
        ', welcome to ',
        {
          children: [
            'Earth',
          ],
          type: 'might_be_react_node',
        },
        '!',
      ],
      type: 'might_be_react_fragment',
    })
  })

  describe('onMissingKey', () => {
    it('calls the function when a key is missing', () => {
      const expectedKey = 'some key'
      const expectedOptions = {}
      const expectedLocale = 'oz'
      const returnValue = {} as any
      const onMissingKey = (key: string, options: any, locale: string) => {
        expect(key).to.equal(expectedKey)
        expect(options).to.equal(expectedOptions)
        expect(locale).to.equal(expectedLocale)
        return returnValue
      }
      const instance = new Polyglot({ onMissingKey, locale: expectedLocale })
      const result = instance.t(expectedKey, expectedOptions)
      expect(result).to.equal(returnValue)
    })

    it('overrides allowMissing', (done) => {
      const missingKey = 'missing key'
      const onMissingKey = (key: string) => {
        expect(key).to.equal(missingKey)
        done
      }
      const instance = new Polyglot({ onMissingKey, allowMissing: true })
      instance.t(missingKey)
    })
  })
})
