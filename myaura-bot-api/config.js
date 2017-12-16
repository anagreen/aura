var config = {};


config.google_key_file = "AI-6cee7dde5cd9.json";
config.beyondverbal_api_key = process.env.BEYONVERBAL_API_KEY || "986ae90c-ecea-4577-926c-059473213675";
config.beyondverbal_timeout = process.env.BEYONDVERBAL_TIMEOUT || 180000;
config.storage_bucket = process.env.STORAGE_BUCKET || "myaura-storage";
config.google_project_id = process.env.GOOGLE_PROJECT_ID || "ava-ai-189108";

config.chatfuel_url = "https://api.chatfuel.com";
config.chatfuel_bot_id = process.env.CHATFUEL_BOT_ID || "59cc55d3e4b0e011096bdd74";
config.chatfuel_token = process.env.CHATFUEL_TOKEN || "mELtlMAHYqR0BvgEiMq8zVek3uYUK3OJMbtyrdNPTrQB9ndV0fM7lWTFZbM4MZvD";

config.web_port = 8081;
config.mongodb_url = process.env.MONGODB_URL || "mongodb://myaura_user:sdhs23GFGdv72@ds117156.mlab.com:17156/myaura_test";
config.mongodb_collection = process.env.MONGODB_COLLECTION || "interview";

module.exports = config;