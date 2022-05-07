
const isTailSectionFull = (_messageObject) => {
  if (_messageObject.length < 1 || _messageObject[0].blocks == null) {
    throw new Error('invalid attachments object')
  }
  const tailObject = _messageObject[0].blocks[_messageObject[0].blocks.length - 1]
  return tailObject.type !== 'section' || tailObject.fields.length > 1
}

const traverse = (target, path) => {
  console.log(`target, path = ${target}, ${path}`)
  if (path.length === 0) {
    return target
  }
  return traverse(target[path.shift()], path)
}

module.exports.setHeader = (color, headerText) => (rawData, _messageObject, next) => {
  _messageObject.push({
    color,
    blocks: [{
      type: 'header',
      text: {
        type: 'plain_text',
        text: headerText
      }
    }]
  })
  next()
}

module.exports.addField = (fieldName, jsonPath) => (rawData, _messageObject, next) => {
  const value = traverse(JSON.parse(rawData), jsonPath.split('.'))

  if (isTailSectionFull(_messageObject)) {
    _messageObject[0].blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*${fieldName}:*\n${value}`
        }
      ]
    })
  } else {
    _messageObject[0].blocks[_messageObject[0].blocks.length - 1].fields.push({
      type: 'mrkdwn',
      text: `*${fieldName}:*\n${value}`
    })
  }
  next()
}

module.exports.setFooter = (footerText) => (rawData, _messageObject, next) => {
  _messageObject[0].blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: footerText
    }]
  })
}
