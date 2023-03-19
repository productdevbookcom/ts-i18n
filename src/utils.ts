export const forEach = (arr: any[], callback: (arg: any) => void) => {
  for (let i = 0; i < arr.length; i++)
    callback(arr[i])
}
