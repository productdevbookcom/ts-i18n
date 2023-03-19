import type { TypeElement } from 'typescript'
import { ListFormat, ScriptKind, ScriptTarget, SyntaxKind, createPrinter, createSourceFile, factory } from 'typescript'

export const convertObjectToTypeDefinition = async (
  object: any,
): Promise<TypeElement[]> => {
  switch (typeof object) {
    case 'object':
      return Promise.all(Object.keys(object).map(async (key) => {
        if (typeof object[key] === 'string') {
          return factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(key),
            undefined,
            factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
          )
        }
        if (Array.isArray(object[key])) {
          return factory.createPropertySignature(
            undefined,
            factory.createStringLiteral(key),
            undefined,
            factory.createTupleTypeNode(
              Array(object[key].length).fill(
                factory.createKeywordTypeNode(SyntaxKind.StringKeyword),
              ),
            ),
          )
        }
        return factory.createPropertySignature(
          undefined,
          factory.createStringLiteral(key),
          undefined,
          factory.createTypeLiteralNode(
            await convertObjectToTypeDefinition(object[key]),
          ),
        )
      }))
  }

  return []
}

const printer = createPrinter()

export const createTypesFile = async (object: any) => {
  const sourceFile = createSourceFile(
    'placeholder.ts',
    '',
    ScriptTarget.ESNext,
    true,
    ScriptKind.TS,
  )

  const i18nTranslationsType = factory.createTypeAliasDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    factory.createIdentifier('I18nTranslations'),
    undefined,
    factory.createTypeLiteralNode(await convertObjectToTypeDefinition(object)),
  )

  const nodes = factory.createNodeArray([
    factory.createImportDeclaration(
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamedImports([
          factory.createImportSpecifier(
            false,
            undefined,
            factory.createIdentifier('Path'),
          ),
        ]),
      ),
      factory.createStringLiteral('@productdevbook/ts-i18n'),
      undefined,
    ),
    i18nTranslationsType,
    factory.createTypeAliasDeclaration(
      [factory.createModifier(SyntaxKind.ExportKeyword)],
      factory.createIdentifier('I18nPath'),
      undefined,
      factory.createTypeReferenceNode(factory.createIdentifier('Path'), [
        factory.createTypeReferenceNode(
          factory.createIdentifier('I18nTranslations'),
          undefined,
        ),
      ]),
    ),
  ])

  return printer.printList(ListFormat.MultiLine, nodes, sourceFile)
}

export const annotateSourceCode = (code: string) => {
  return `/* DO NOT EDIT, file generated by @productdevbook/ts-i18n */

${code}`
}
