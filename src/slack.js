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
