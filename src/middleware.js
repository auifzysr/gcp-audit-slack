
const isTailSectionFull = (_messageObject) => {
  if (_messageObject.length < 1 || _messageObject[0].blocks == null) {
    throw new Error('invalid attachments object')
  }
  const tailObject = _messageObject[0].blocks[_messageObject[0].blocks.length - 1]
  return tailObject.type !== 'section' || tailObject.fields.length > 1
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

module.exports.addField = (fieldName) => (rawData, _messageObject, next) => {
  if (isTailSectionFull(_messageObject)) {
    _messageObject[0].blocks.push({
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*${fieldName}:*\n${JSON.stringify(rawData[fieldName])}`
        }
      ]
    })
  } else {
    _messageObject[0].blocks[_messageObject[0].blocks.length - 1].fields.push({
      type: 'mrkdwn',
      text: `*${fieldName}:*\n${JSON.stringify(rawData[fieldName])}`
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
