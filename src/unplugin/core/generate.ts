import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs'
import { dirname } from 'node:path'

import type { Options } from '../types'
import {
  annotateSourceCode,
  createTypesFile,
} from './jsonToTS'

export async function generateTS(options: Options) {
  try {
    if (options.exportFilePath) {
      try {
        const lang = readFileSync(`${options.localesFolder}/${options.selectLanguage}.json`, 'utf8')
        const rawContent = await createTypesFile(JSON.parse(lang))

        if (!rawContent) {
          console.warn('No content generated')
          return
        }
        const outputFile = annotateSourceCode(rawContent, options.header)

        mkdirSync(dirname(options!.exportFilePath), {
          recursive: true,
        })
        let currentFileContent = null
        try {
          currentFileContent = readFileSync(
            options!.exportFilePath,
            'utf8',
          )
        }
        catch (err) {
          console.error(err)
        }
        if (currentFileContent !== outputFile) {
          console.warn('Changes detected in language files', 'SUCCESS')
          writeFileSync(options!.exportFilePath, outputFile, {
            encoding: 'utf8',
            flag: 'w',
            mode: 0o666,
          })
          console.warn(`Types generated language in: ${options!.exportFilePath}`, 'SUCCESS')
        }
        else {
          console.warn('No changes language files', 'SUCCESS')
        }
      }
      catch (err) {
        console.warn(err)
      }
    }
  }
  catch (error) {
    console.warn(error)
  }
}
