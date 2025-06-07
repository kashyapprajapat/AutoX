const { TwitterApi } = require('twitter-api-v2');
require('dotenv').config();

const client = new TwitterApi({
  appKey: process.env.API_KEY,
  appSecret: process.env.API_KEY_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_TOKEN_SECRET
});

const rwClient = client.readWrite;

const postTweet = async (text) => {
  try {
    const tweet = await rwClient.v2.tweet(text);
    console.log('✅ Tweet posted successfully:', tweet.data); 
    return tweet.data;
  } catch (error) {
    console.error("❌ Error posting tweet:", error);
    throw error; 
  }
};

module.exports = { postTweet };