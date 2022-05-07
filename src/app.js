const express = require('express');
const dayjs = require('dayjs');

const slack = require('./slack');
const middleware = require('./middleware')

const app = express();
app.use(express.json());

const slackToken = process.env.SLACK_TOKEN;
if (slackToken == null) {
  console.log('environment variable SLACK_TOKEN is missing.');
  process.exit(1);
}

const slackChannel = process.env.SLACK_CHANNEL;
if (slackChannel == null) {
  console.log('environment variable SLACK_CHANNEL is missing.');
  process.exit(1);
}

slack.initClient(slackToken, slackChannel);

const composer = slack.messageObjectComposer(middleware.setHeader("#ff0000", "some header"));
composer.use(middleware.setFooter(dayjs().format("YYYY-MM-DDThh:mm:ssZ")));

app.post('/', (req, res) => {
  res.status(204).send();

  console.log(req.body)
  const rawMessage = JSON.parse(req.body);

  let attachments = []
  composer.compose(rawMessage, attachments);
  slack.postMessage(null, null, attachments);
});

module.exports = app;