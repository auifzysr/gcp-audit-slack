const express = require('express')
const dayjs = require('dayjs')

const slack = require('./slack')
const middleware = require('./middleware')

const app = express()
app.use(express.json())

const slackToken = process.env.SLACK_TOKEN
if (slackToken == null) {
  console.log('environment variable SLACK_TOKEN is missing.')
  process.exit(1)
}

const slackChannel = process.env.SLACK_CHANNEL
if (slackChannel == null) {
  console.log('environment variable SLACK_CHANNEL is missing.')
  process.exit(1)
}

slack.initClient(slackToken, slackChannel)

const composer = slack.messageObjectComposer(middleware.setHeader('#00ff00', 'audit'))
composer.use(middleware.addField('Caller', 'authenticationInfo'))
composer.use(middleware.addField('Severity', 'severity'))
composer.use(middleware.addField('Event', 'protoPayload.methodName'))
composer.use(middleware.addField('Service', 'protoPayload.serviceName'))
composer.use(middleware.addField('Project', 'resource.labels.project_id'))
composer.use(middleware.addField('Location', 'resource.labels.location'))
composer.use(middleware.addField('Timestamp', 'timestamp'))
composer.use(middleware.setFooter(dayjs().format('YYYY-MM-DDThh:mm:ssZ')))

app.post('/', (req, res) => {
  res.status(204).send()

  const rawMessage = JSON.parse(JSON.stringify(req.body))
  const attachments = []
  composer.compose(rawMessage, attachments)
  slack.postMessage(null, null, attachments)
})

module.exports = app
