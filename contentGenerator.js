const axios = require('axios');

const generateContent = async (topic) => {
  const prompt = `Generate a natural, human-like short tweet in bullet-point or sentence format under 280 characters on this topic: "${topic}". Make it inspirational, casual, and coding-relevant.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );


    const tweet = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (tweet && tweet.length <= 280) {
      return tweet;
    } else {
      console.warn('Generated tweet is empty or too long, falling back to default.');
      return 'Coding is awesome!';
    }
  } catch (error) {
    console.error('Error generating content:', error.response?.data || error.message || error);
    return 'Coding is awesome!';
  }
};


module.exports = { generateContent };
