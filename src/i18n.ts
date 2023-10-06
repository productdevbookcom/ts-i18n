import type { Dirent } from 'node:fs'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join } from 'node:path'

const ACCEPTED_EXTENSIONS = ['.json']

export function getLocales(basepath: string, defaultLocale: string) {
  if (!basepath || !existsSync(basepath)) {
    console.warn('missing or invalid locales folder')
    return {}
  }
  let contents: any[] = []
  let ext: string
  try {
    contents = readdirSync(basepath, { withFileTypes: true })
  }
  catch (err: any) {
    console.warn(err)
  }
  return contents
    .filter((entry: Dirent) => {
      ext = extname(entry.name)
      return (entry.isFile() && ACCEPTED_EXTENSIONS.includes(ext) && entry.name === defaultLocale + ext)
    })
    .reduce((locales, entry) => {
      const name = entry.name.replace(/\.[^/.]+$/, '')
      const pathname = join(basepath, name)
      if (pathname) {
        return readFileSync(pathname + ext, 'utf8')
      }
      else {
        console.warn(`Missing locale: ${pathname}`)
        return {}
      }
    }, {})
}
