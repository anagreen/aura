# aura

## Landing Instructions
### Launch locally
`gulp watch`
### Production build
`gulp --type production`



## myaura-bot-api instructions
### Launch
`docker build -t myaura-bot-api`

`docker run -d -p 80:8081 myaura-bot-api`

### REST API:

GET /status - just to check if service is available

GET /checkDbConnection - check db connection

GET /beyondVerbal?audio=FILE.flac - retrieve emotional level of speeker. audio parameter points on a file inside of google-storage

GET /storeAndRecognize?audio=AUDIO_FILE_URL&firstName=FIRST_NAME&lastName=LAST_NAME&messengerId=MESSENGER_ID - converts file to FLAC format, stores to google-storage and do speech and emotion recognition

GET /storeAndRecognizeChatfuelEndpoint?audio=AUDIO_FILE_URL&firstName=FIRST_NAME&lastName=LAST_NAME&messengerId=MESSENGER_ID&nextBlock=CHARTFUEL_NEXT_BLOCK_ID - converts file to FLAC format, stores to google-storage, do speech and emotion recognition. Response is Status 200 then after processing call of Chatfuel broadcast api.

GET /recognize?audio=FILE_NAME - speech recognition for already stored files
