import { consola } from 'consola'
import c from 'picocolors'
import { getLocales } from './i18n'
import type { IfAnyOrNever, Path, PathValue } from './types'
import { warn } from './utils'

export interface InterpolationOptions {
  smart_count?: number | { length: number } | undefined
  _?: string | undefined

  [interpolationKey: string]: any
}

export interface InterpolationTokenOptions {
  prefix?: string | undefined
  suffix?: string | undefined
}

export interface PluralRules {
  pluralTypes: { [lang: string]: (n: number) => number }
  pluralTypeToLanguages: { [lang: string]: string[] }
}

export interface PolyglotOptions {
  /**
   * The locale to use. If `loaderOptions` used this language you must use same filename.
   * @default en
   * @example 'en'
   */
  locale: string | undefined

  /**
   * The phrases to translate.
   * @default {}
   * @example { hello: 'Hello' }
   * @example { hello: 'Hello', hi_name_welcome_to_place: 'Hi, %{name}, welcome to %{place}!' }
   */
  phrases?: any

  allowMissing?: boolean | undefined
  onMissingKey?: ((key: string, options: InterpolationOptions, locale: string, tokenRegex: RegExp, pluralRules: PluralRules | undefined, replaceImplementation: any) => string) | null | undefined
  warn?: ((message: string) => void) | undefined | any
  interpolation?: InterpolationTokenOptions | undefined
  pluralRules?: PluralRules | undefined
  replace?: (searchValue: RegExp, replaceValue: any) => any | undefined

  /**
   * Safe TypeScript types for translations.
   * @example {
   *   path: 'locales',
   *   typesOutputPath: 'i18n.d.ts',
   * }
   */
  loaderOptions?: {
    /**
     * The default locale to use.
     * @example 'locales'
     */
    path: string

    /**
     * Typescript types output path.
     * @example 'i18n.d.ts'
     */
    typesOutputPath?: string

    /**
     * Auto generate types for locales.
     * @default true
     */
    autoGenerate?: boolean
  }

  /**
   * @default false
   */
  errorOnMissing?: boolean | undefined
}

const defaultReplace = String.prototype.replace

const delimiter = '||||'

const russianPluralGroups = function (n: number): number {
  const lastTwo = n % 100
  const end = lastTwo % 10
  if (lastTwo !== 11 && end === 1)
    return 0

  if (end >= 2 && end <= 4 && !(lastTwo >= 12 && lastTwo <= 14))
    return 1

  return 2
}

const defaultPluralRules: PluralRules = {
  // Mapping from pluralization group plural logic.
  pluralTypes: {
    arabic(n: number): number {
      // http://www.arabeyes.org/Plural_Forms
      if (n < 3)
        return n
      const lastTwo = n % 100
      if (lastTwo >= 3 && lastTwo <= 10)
        return 3
      return lastTwo >= 11 ? 4 : 5
    },
    bosnian_serbian: russianPluralGroups,
    chinese() { return 0 },
    croatian: russianPluralGroups,
    french(n: number): number { return n >= 2 ? 1 : 0 },
    german(n: number): number { return n !== 1 ? 1 : 0 },
    russian: russianPluralGroups,
    lithuanian(n: number): number {
      if (n % 10 === 1 && n % 100 !== 11)
        return 0
      return (n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19)) ? 1 : 2
    },
    czech(n: number): number {
      if (n === 1)
        return 0
      return (n >= 2 && n <= 4) ? 1 : 2
    },
    polish(n: number): number {
      if (n === 1)
        return 0
      const end = n % 10
      return (end >= 2 && end <= 4 && (n % 100 < 10 || n % 100 >= 20)) ? 1 : 2
    },
    icelandic(n: number): number { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0 },
    slovenian(n: number): number {
      const lastTwo = n % 100
      if (lastTwo === 1)
        return 0

      if (lastTwo === 2)
        return 1

      if (lastTwo === 3 || lastTwo === 4)
        return 2

      return 3
    },
    romanian(n: number): number {
      if (n === 1)
        return 0
      const lastTwo = n % 100
      if (n === 0 || (lastTwo >= 2 && lastTwo <= 19))
        return 1
      return 2
    },
    turkish(n: number): number { return n > 1 ? 1 : 0 },
  },

  // Mapping from pluralization group to individual language codes/locales.
  // Will look up based on exact match, if not found and it's a locale will parse the locale
  // for language code, and if that does not exist will default to 'en'
  pluralTypeToLanguages: {
    arabic: ['ar'],
    bosnian_serbian: ['bs-Latn-BA', 'bs-Cyrl-BA', 'srl-RS', 'sr-RS'],
    chinese: ['id', 'id-ID', 'ja', 'ko', 'ko-KR', 'lo', 'ms', 'th', 'th-TH', 'zh'],
    croatian: ['hr', 'hr-HR'],
    german: ['fa', 'da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hi-IN', 'hu', 'hu-HU', 'it', 'nl', 'no', 'pt', 'sv', 'tr'],
    french: ['fr', 'tl', 'pt-br'],
    russian: ['ru', 'ru-RU'],
    lithuanian: ['lt'],
    czech: ['cs', 'cs-CZ', 'sk'],
    polish: ['pl'],
    icelandic: ['is', 'mk'],
    slovenian: ['sl-SL'],
    romanian: ['ro'],
    turkish: ['tr-TR', 'tr'],
  },
}

function langToTypeMap(mapping: Record<string, string[]>): Record<string, string> {
  const ret: Record<string, string> = {}
  for (const type in mapping) {
    const langs = mapping[type]
    for (const lang of langs)
      ret[lang] = type
  }

  return ret
}

function pluralTypeName(pluralRules: PluralRules, locale: string): string {
  const langToPluralType = langToTypeMap(pluralRules.pluralTypeToLanguages)
  return langToPluralType[locale]
    || langToPluralType[locale.split('-')[0]]
    || langToPluralType.en
}

function pluralTypeIndex(pluralRules: PluralRules, pluralType: string, count: number): number {
  return pluralRules.pluralTypes[pluralType](count)
}

function createMemoizedPluralTypeNameSelector(): (pluralRules: PluralRules, locale: string) => string | undefined {
  const localePluralTypeStorage: Record<string, string | undefined> = {}

  return function (pluralRules: PluralRules, locale: string): string | undefined {
    let pluralType = localePluralTypeStorage[locale]

    if (pluralType && !pluralRules.pluralTypes[pluralType]) {
      pluralType = undefined
      localePluralTypeStorage[locale] = pluralType
    }

    if (!pluralType) {
      pluralType = pluralTypeName(pluralRules, locale)

      if (pluralType)
        localePluralTypeStorage[locale] = pluralType
    }

    return pluralType
  }
}

function escape(token: string): string {
  return token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function constructTokenRegex(opts?: { prefix?: string; suffix?: string }): RegExp {
  const prefix = (opts && opts.prefix) || '%{'
  const suffix = (opts && opts.suffix) || '}'

  if (prefix === delimiter || suffix === delimiter)
    throw new RangeError(`"${delimiter}" token is reserved for pluralization`)

  return new RegExp(`${escape(prefix)}(.*?)${escape(suffix)}`, 'g')
}

const memoizedPluralTypeName = createMemoizedPluralTypeNameSelector()

const defaultTokenRegex = /%\{(.*?)\}/gim

function transformPhrase(
  phrase: string,
  substitutions?: number | Record<string, any>,
  locale?: string,
  tokenRegex?: RegExp,
  pluralRules?: PluralRules | undefined,
  replaceImplementation?: PolyglotOptions['replace'] | undefined | any,
): string {
  if (typeof phrase !== 'string')
    throw new TypeError('Polyglot.transformPhrase expects argument #1 to be string')

  if (substitutions == null)
    return phrase

  let result = phrase
  const interpolationRegex = tokenRegex || defaultTokenRegex
  const replace = replaceImplementation || defaultReplace

  const options = typeof substitutions === 'number' ? { smart_count: substitutions } : substitutions

  if (options.smart_count != null && phrase) {
    const pluralRulesOrDefault = pluralRules || defaultPluralRules
    const texts = phrase.split(delimiter)
    const bestLocale = locale || 'en'
    const pluralType = memoizedPluralTypeName(pluralRulesOrDefault, bestLocale)
    const pluralTypeWithCount = pluralTypeIndex(
      pluralRulesOrDefault,
      pluralType || 'en',
      options.smart_count,
    )

    result = (texts[pluralTypeWithCount] || texts[0]).trim()
  }

  result = replace.call(result, interpolationRegex, (expression: string, argument: string) => {
    if (options[argument] == null || options[argument] === null)
      return expression
    return options[argument]
  })

  return result
}

type LocaleMessage = Record<string, unknown>

export interface DefineLocaleMessage extends LocaleMessage {}

export class Polyglot<K extends DefineLocaleMessage> {
  phrases: Record<string, any>
  currentLocale: string
  onMissingKey: PolyglotOptions['onMissingKey'] | null
  warn: PolyglotOptions['warn'] | undefined
  replaceImplementation: PolyglotOptions['replace'] | undefined | any
  tokenRegex: RegExp
  pluralRules: PluralRules | undefined
  loaderOptions: PolyglotOptions['loaderOptions']
  errorOnMissing: PolyglotOptions['errorOnMissing'] | undefined

  constructor(options: PolyglotOptions) {
    const opts = options || {}
    this.phrases = {}
    this.extend(opts.phrases || {})
    this.currentLocale = opts.locale || 'en'
    const allowMissing = opts.allowMissing ? transformPhrase : null
    this.onMissingKey = typeof opts.onMissingKey === 'function' ? opts.onMissingKey : allowMissing
    this.warn = opts.warn || warn
    this.replaceImplementation = opts.replace || defaultReplace
    this.tokenRegex = constructTokenRegex(opts.interpolation)
    this.pluralRules = opts.pluralRules || defaultPluralRules
    this.errorOnMissing = opts.errorOnMissing || false

    if (opts.loaderOptions) {
      opts.loaderOptions.autoGenerate = opts.loaderOptions.autoGenerate || true

      this.loaderOptions = opts.loaderOptions

      if (this.loaderOptions.path) {
        const lang = getLocales(this.loaderOptions.path, this.currentLocale)
        this.extend(JSON.parse(lang as any))
      }

      if (this.loaderOptions.autoGenerate)
        this.generateTS()
    }
  }

  locale(newLocale?: string) {
    if (newLocale)
      this.currentLocale = newLocale
    return this.currentLocale
  }

  extend(morePhrases?: any, prefix?: string) {
    for (const key in morePhrases) {
      const phrase = morePhrases[key]
      const prefixedKey = prefix ? `${prefix}.${key}` : key
      if (typeof phrase === 'object')
        this.extend(phrase, prefixedKey)

      else
        this.phrases[prefixedKey] = phrase
    }
  }

  unset(morePhrases?: any, prefix?: string) {
    if (typeof morePhrases === 'string') {
      delete this.phrases[morePhrases]
    }
    else {
      for (const key in morePhrases) {
        const phrase = morePhrases[key]
        const prefixedKey = prefix ? `${prefix}.${key}` : key
        if (typeof phrase === 'object')
          this.unset(phrase, prefixedKey)

        else
          delete this.phrases[prefixedKey]
      }
    }
  }

  clear() {
    this.phrases = {}
  }

  replace(newPhrases: Record<string, any> | undefined | null) {
    this.clear()
    this.extend(newPhrases)
  }

  t<P extends Path<K> = any, R = PathValue<K, P>>(key: P, options?: number | InterpolationOptions): IfAnyOrNever<R, string, R> {
    let phrase: string | undefined
    let result: string | undefined
    const opts = options == null ? {} : options as InterpolationOptions
    if (typeof this.phrases[key] === 'string') {
      phrase = this.phrases[key]
    }
    else if (options !== null && options !== null && typeof opts._ === 'string') {
      phrase = opts._
    }
    else if (this.onMissingKey) {
      const onMissingKey = this.onMissingKey
      result = onMissingKey(
        key,
        opts,
        this.currentLocale,
        this.tokenRegex,
        this.pluralRules,
        this.replaceImplementation,
      )
    }
    else {
      this.warn(`Missing translation for key: "${key}"`)
      result = key
    }
    if (typeof phrase === 'string') {
      result = transformPhrase(
        phrase,
        opts,
        this.currentLocale,
        this.tokenRegex,
        this.pluralRules,
        this.replaceImplementation,
      )
    }

    if (result && this.errorOnMissing) {
      const matches = result.match(/%{([^}]+)}/g)
      if (matches) {
        matches.forEach((match: string) => {
          consola.error(new Error(`translation "${c.green(key)}" has unused variable "${c.red(match.replace(/%{|}/g, ''))}"`).stack)
        })
      }
    }

    return result as unknown as IfAnyOrNever<R, string, R>
  }

  has(key: string) {
    return this.phrases[key] != null
  }

  async generateTS() {
    if (!this.loaderOptions)
      this.warn('No loader options provided')

    try {
      if (this.loaderOptions!.typesOutputPath) {
        try {
          const ts = await import('./utils/typescript.js')

          const { mkdirSync, readFileSync, writeFileSync } = await import('node:fs')
          const { dirname } = await import('node:path')
          const lang = getLocales(this.loaderOptions!.path, this.currentLocale)
          const rawContent = await ts.createTypesFile(JSON.parse(lang as any))

          if (!rawContent) {
            this.warn('No content generated')
            return
          }
          const outputFile = ts.annotateSourceCode(rawContent)

          mkdirSync(dirname(this.loaderOptions!.typesOutputPath), {
            recursive: true,
          })
          let currentFileContent = null
          try {
            currentFileContent = readFileSync(
              this.loaderOptions!.typesOutputPath,
              'utf8',
            )
          }
          catch (err) {
            console.error(err)
          }
          if (currentFileContent !== outputFile) {
            writeFileSync(this.loaderOptions!.typesOutputPath, outputFile)
            warn(`Types generated language in: ${this.loaderOptions!.typesOutputPath}`, 'SUCCESS')
          }
          else {
            warn('No changes language files', 'SUCCESS')
          }
        }
        catch (_) {
          warn('Typescript package not found')
        }
      }
    }
    catch (error) {
      console.warn(error)
    }
  }

  static transformPhrase(phrase?: any, substitutions?: number | InterpolationOptions, locale?: string) {
    return transformPhrase(phrase, substitutions, locale)
  }
}
