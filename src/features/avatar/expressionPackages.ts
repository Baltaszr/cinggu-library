import type { Expression } from './geometry'
export const expressionPackage = (expression: Expression) =>
  expression.packageName?.trim() ||
  (expression.id.startsWith('cinggu-reference-')
    ? 'Cinggu'
    : expression.eyeArtwork
      ? 'My expressions'
      : 'Base')
export const expressionName = (expression: Expression) =>
  expression.label?.trim() || expression.semanticKey?.replaceAll('-', ' ') || 'Untitled expression'
