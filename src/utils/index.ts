export function forEach(arr: any[], callback: (arg: any) => void) {
  for (let i = 0; i < arr.length; i++)
    callback(arr[i])
}

export const warn = function warn(message: string, type?: 'WARNING' | 'SUCCESS'): void {
  if (!type)
    type = 'WARNING'
  if (typeof console !== 'undefined' && console.warn)
    console.warn(`${type}: ${message}`)
}
