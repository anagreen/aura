'use strict';

const conf = require("./config");
const Promise = require('bluebird');
const restify = require('restify');
const request = require('request');
const url = require("url");
const path = require("path");
const Aura = require("./aura");
const aura = new Aura();
const Recognizer = require("./recognizer");
const recognizer = new Recognizer();
const extend = require('extend');
var Storage = require('./storage');
var storage = new Storage();

const server = restify.createServer();
server.server.setTimeout(60000 * 10);
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());


server.get('status', function (req, res, next) {
  res.send(200, 'Works !!!');
  next();
});

server.get('checkDbConnection', function (req, res, next) {
  Promise.promisify(storage.connectToDB, { context: storage })()
    .then(result => {
      res.send(200, result);
      next();
    }).catch(err => {
      res.send(200, err);
      next();
    });
});

server.get('beyondVerbal', function (req, res, next) {
  var audioFile = req.query.audio;
  console.log(`audio: ${audioFile}`);
  recognizer.recognizeEmotions(audioFile).then(result => {
    console.log(`BEYONDVERBAL: ${JSON.stringify(result)}`);
    res.send(200, JSON.stringify(result));
    next();
  }).catch(err => {
    console.log(`BEYONDVERBAL ERROR: ${err}`);
    res.send(400, `BEYONDVERBAL ERROR: ${err}`);
    next();
  })
});

server.get('storeAndRecognize', function (req, res, next) {
  let audioURL = req.query.audio;
  let firstName = req.query.firstName;
  let lastName = req.query.lastName;
  let messengerId = req.query.messengerId;

  aura.storeAndRecognize(audioURL,
    name => `${name}.flac`, firstName, lastName, messengerId)
    .then(result => {
      console.log(`Success storeAndRecognize: ${JSON.stringify(result)}`);
      let userResponse = JSON.stringify(formatEmotionalOutputObj(result));
      res.send(200, userResponse);
      next();
    }).catch(err => {
      console.log(`ERROR storeAndRecognize: ${JSON.stringify(err)}`);
      res.send(200, 'Sorry we are not able to analyze your response now. Please check your profile later on our site.');
      next();
    });
});

const VALENCE = 'The person feels about the subject';
const AROUSAL = 'Level of involvement and stimulation';
const TEMPER = 'Entire mood range';
const MOOD_GROUPS = 'Emotional state';
const COMBINED_EMOTIONS = 'A combination of various basic emotions';

function formatEmotionalOutputObj(resultObj) {
  return {
    valence: retriveAndFormatAnalysesSegment(resultObj, VALENCE),
    arousal: retriveAndFormatAnalysesSegment(resultObj, AROUSAL),
    temper: retriveAndFormatAnalysesSegment(resultObj, TEMPER),
    moodGroup: retriveAndFormatAnalysesSegment(resultObj, MOOD_GROUPS)
  }
}

function retriveAndFormatAnalysesSegment(data, segmentDesc) {
  let result;
  try {
    switch (segmentDesc) {
      case VALENCE:
        result = `${VALENCE}: ${data.emotions.result.analysisSummary.AnalysisResult.Valence.Mode}`;
        break;
      case AROUSAL:
        result = `${AROUSAL}: ${data.emotions.result.analysisSummary.AnalysisResult.Arousal.Mode}`;
        break;
      case TEMPER:
        result = `${TEMPER}: ${data.emotions.result.analysisSummary.AnalysisResult.Temper.Mode}`;
        break;
      case MOOD_GROUPS:
        result = `${MOOD_GROUPS}: ${data.emotions.result.analysisSegments.map(moodGroup => {
          let mood = moodGroup.analysis.Mood;
          return `${mood.Composite.Primary.Phrase} ${mood.Composite.Secondary.Phrase}`;
        }).join(';')}`;
        break;
      default:
        console.log(`Uknown segment description: ${segmentDesc}`);
        result = '';
    }
  } catch (err) {
    return 'Cannot retrieve';
  }
  return result;
}

server.get('storeAndRecognizeChatfuelEndpoint', function (req, res, next) {
  let audioURL = req.query.audio;
  let firstName = req.query.firstName;
  let lastName = req.query.lastName;
  let messengerId = req.query.messengerId;
  let nextBlock = req.query.nextBlock;

  res.send(200, {
    messages: [{ text: 'We are analysing your response. Please wait.' }]
  });

  aura.storeAndRecognize(audioURL,
    name => `${name}.flac`, firstName, lastName, messengerId)
    .then(result => {
      console.log(`Analyses process completed: ${JSON.stringify(result)}`);
      let userResponse = formatEmotionalOutputObj(result);
      //console.log(`USER RESP: ${JSON.stringify(userResponse)}`);
      let options = {
        uri: buildBroadcastApiUrl(messengerId, nextBlock),
        method: 'POST',
        json: {
          'valence': userResponse.valence,
          'arousal': userResponse.arousal,
          'temper': userResponse.temper,
          'moodGroup': userResponse.moodGroup
        }
      }
      Promise.promisify(request)(options)
        .then(() => console.log('Success storeAndRecognizeChatfuelEndpoint.'))
        .catch(err => console.log('Cannot send a response. ', err));
      next();
    }).catch(err => {
      console.log(`Some problem during analyses process: ${err}`);
      let options = {
        uri: buildBroadcastApiUrl(messengerId, nextBlock),
        method: 'POST',
        json: { 'valence': "Cannot provide a result now. Please check it on our site later." }
      }
      Promise.promisify(request)(options)
        .then(() => console.log('Failure storeAndRecognizeChatfuelEndpoint.'))
        .catch(err => console.log('Cannot send error resp !', err));
      next();
    });
});

function buildBroadcastApiUrl(messengerId, nextBlockId) {
  return `${conf.chatfuel_url}/bots/${conf.chatfuel_bot_id}/users/${messengerId}/send?chatfuel_token=${conf.chatfuel_token}&chatfuel_block_id=${nextBlockId}`;
}

server.get('recognize', function (req, res, next) {
  var audioFileName = req.query.audio;
  recognizer.recognizeText(storage.getFileUrl(audioFileName)).then(result => {
    console.log(`Success recognize`);
    res.send(200, result);
    next();
  }).catch(err => {
    console.log(`ERROR recognize: ${err}`);
    res.send(400, err);
    next();
  });
});


server.listen(conf.web_port, function () {
  console.log('%s listening at %s', server.name, server.url);
});