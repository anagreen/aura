# aura

## Landing Instructions
### Launch locally
`gulp watch`
### Production build
`gulp --type production`




### Requirements: 
   pre installed   ffmpeg
   pre installed node.js v6.11.1
   pre installed npm

### instruction: 
1) npm --install
2) Set configuration in config.js
5) start application: npm start


### REST API:

GET /status - just to check if service is available

GET /beyondVerbal?audio=FILE.flac - retrieve emotional level of speeker. audio parameter points on a file inside of google-storage

GET /storeAndRecognize?audio=AUDIO_FILE_URL - converts file to FLAC format, stores to google-storage and do speech and emotion recognition

GET /recognize?audio=FILE_NAME - speech recognition for already stored files
