// needs to:
// - get bot token scope
// - grant chat:write to the scope
// - specify the token formatted like xoxb-...

const { WebClient } = require('@slack/web-api')

let client
let channel
module.exports.initClient = (() => {
  let initialized = false
  return (_token, _channel) => {
    if (!initialized) {
      initialized = true
      client = new WebClient(_token)
      channel = _channel
    }
  }
})()

module.exports.postMessage = (text, blocks, attachments) => {
  if (client == null) {
    throw new Error('client is not initialized yet')
  }
  const result = client.chat.postMessage({
    text,
    blocks,
    attachments,
    channel
  })
  result.finally(() => console.log(JSON.stringify(result)))
}

module.exports.messageObjectComposer = (...middlewares) => {
  const middlewareStack = middlewares

  const use = (...middlewares) => {
    middlewareStack.push(...middlewares)
  }

  const compose = async (rawData, messageObject) => {
    let prevIndex = -1
    const composer = async (index) => {
      if (index === prevIndex) {
        throw new Error('next() called multiple times')
      }

      prevIndex = index

      const middleware = middlewareStack[index]

      if (middleware) {
        await middleware(rawData, messageObject, () => {
          return composer(index + 1)
        })
      }
    }

    await composer(0)
  }

  return { use, compose }
}
