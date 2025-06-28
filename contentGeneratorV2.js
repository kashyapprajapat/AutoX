const axios = require('axios');
require('dotenv').config();

const generateContent = async (topic) => {

  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set. Please set your API key.');
  }

  const maxRetries = 7;
  
  // Simple, direct prompt
  const prompt = `Create a unique, engaging tweet about "${topic}".

REQUIREMENTS:
- MAXIMUM 250 characters
- Include 1-2 relevant emojis
- Use casual, authentic language
- Make it inspirational but practical
- NO generic phrases

Topic: ${topic}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎯 Attempt ${attempt}/${maxRetries} - Generating content for: ${topic}`);
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "llama-3.1-8b-instant", 
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 80,
          top_p: 0.9,
          stream: false
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          }
        }
      );

      console.log(`📡 Groq API Response (Attempt ${attempt}):`, JSON.stringify(response.data, null, 2));

      let tweet = response.data?.choices?.[0]?.message?.content?.trim();
      
      if (!tweet) {
        console.warn(`⚠️ Attempt ${attempt}: No tweet generated`);
        continue;
      }

      // Clean up the tweet
      tweet = tweet.replace(/^\"|\"$/g, ''); 
      tweet = tweet.replace(/\n+/g, ' '); 
      tweet = tweet.trim();

      // Check if tweet is valid (under 250 characters and not empty)
      if (tweet.length > 0 && tweet.length <= 250) {
        console.log(`✅ Success on attempt ${attempt}! Generated tweet (${tweet.length} chars): ${tweet}`);
        return tweet;
      } else {
        console.warn(`⚠️ Attempt ${attempt} failed - Length: ${tweet.length} chars`);
        console.warn(`   Tweet: "${tweet}"`);
        continue; // Retry
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error.response?.data || error.message || error);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed to generate tweet after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retry
      const waitTime = Math.min(1000 * attempt, 5000);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Failed to generate tweet within character limit after all retries');
};

// 🧪 Test function
const testGeneration = async () => {
  console.log('\n🧪 Testing content generation with Groq API...\n');
  
  const testTopics = [
    'React coding tips best practices',
    'SASS(Software As a Service) related journey-Product build related journey',
    'Coding related with calm, peacefully as well as motivate me for tomorrow work'
  ];

  for (const topic of testTopics) {
    console.log(`\n--- Testing: ${topic} ---`);
    try {
      const result = await generateContent(topic);
      console.log(`✅ Success: ${result} (${result.length} chars)`);
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
    }
  }
};

// Uncomment to test locally
// testGeneration();

module.exports = { generateContent };