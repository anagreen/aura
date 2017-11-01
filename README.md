# aura
Application for speech and emotion recognition.

REST API and Facebook bot.

ENDPOINTS:

GET /status - just to check if service is available

GET /beyondVerbal?audio=FILE.flac - retrieve emotional level of speeker. audio parameter points on a file inside of google-storage

GET /storeAndRecognize?audio=AUDIO_FILE_URL - converts file to FLAC format, stores to google-storage and do speech and emotion recognition

GET /recognize?audio=FILE_NAME - speech recognition for already stored files

