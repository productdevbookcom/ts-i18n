export function handler(event: any, context: any, callback: any) {
  console.log('Hello World')
  callback(null, {
    statusCode: 200,
    body: 'Hello World',
  })
}
