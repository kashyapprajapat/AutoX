require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { postTweet } = require('./twitter');
// const { generateContent } = require('./contentGenerator');  //<-- Version 1 with Gemini API
const { generateContent } = require('./contentGeneratorV2');   //<-- Version 2 with GqoqCloude API
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 7000;

// 🚦 Rate Limiting - Very restrictive
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 requests per 15 minutes per IP
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 🔒 CORS - Block all cross-origin requests
app.use(cors({
  origin: false, // Block all cross-origin requests
  credentials: false
}));


app.use(express.json());

// 🎯 Random Tech Topics Array for 10 AM tweets
const techTopics = [
  'HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Svelte', 'SolidJS', 
  'Next.js', 'Nuxt.js', 'Remix', 'Astro', 'Preact', 'Backbone.js', 'Ember.js', 'jQuery', 
  'Bootstrap', 'Tailwind CSS', 'Material UI', 'Ant Design', 'DaisyUI', 'ShadCN/UI', 'Flowbite', 
  'Bulma', 'Foundation', 'Sass', 'Less', 'PostCSS', 'Styled Components', 'Emotion', 'Stitches', 
  'Framer Motion', 'Anime.js', 'GSAP', 'Three.js', 'Chart.js', 'D3.js', 'WebGL', 'Canvas API', 
  'SVG.js', 'WebRTC', 'WebSockets', 'Node.js', 'Express.js', 'Koa', 'Hapi.js', 'Fastify', 
  'NestJS', 'AdonisJS', 'RedwoodJS', 'Blitz.js', 'Meteor.js', 'Bun', 'Deno', 'Go', 'Gin (Go)', 
  'Echo (Go)', 'Buffalo (Go)', 'Revel (Go)', 'Java', 'Spring Boot', 'Jakarta EE', 'Micronaut', 
  'Quarkus', 'Kotlin', 'Ktor', 'Python', 'Django', 'Flask', 'FastAPI', 'Tornado', 'Bottle', 
  'PHP', 'Laravel', 'Symfony', 'CodeIgniter', 'Yii', 'Slim', 'Ruby', 'Ruby on Rails', 'Sinatra', 
  'Crystal', 'Lucky Framework', 'C#', 'ASP.NET Core', 'F#', 'Elixir', 'Phoenix', 'Rust', 
  'Actix Web', 'Rocket (Rust)', 'Zig', 'Zola', 'Haskell', 'Yesod', 'PureScript', 'Elm', 
  'ClojureScript', 'Re-frame', 'Reagent', 'MongoDB', 'MySQL', 'PostgreSQL', 'MariaDB', 'SQLite', 
  'Prisma', 'Drizzle ORM', 'TypeORM', 'Sequelize', 'Mongoose', 'Knex.js', 'Supabase', 
  'PlanetScale', 'Firebase', 'Appwrite', 'FaunaDB', 'Hasura', 'GraphQL', 'Apollo Client', 
  'Apollo Server', 'Relay', 'URQL', 'REST API', 'gRPC', 'OpenAPI', 'Swagger', 'Postman', 
  'Insomnia', 'JSON', 'XML', 'JWT', 'OAuth2', 'Passport.js', 'Clerk', 'Auth0', 'Firebase Auth', 
  'Magic.link', 'Redis', 'RabbitMQ', 'NATS', 'Kafka', 'Socket.IO', 'MQTT', 'Webpack', 'Vite', 
  'Parcel', 'Rollup', 'Babel', 'ESLint', 'Prettier', 'Husky', 'Lint-staged', 'Vitest', 'Jest', 
  'Mocha', 'Chai', 'Cypress', 'Playwright', 'Puppeteer', 'Storybook', 'Testing Library', 
  'React Query', 'SWR', 'TanStack Query', 'Zustand', 'Redux', 'Jotai', 'Recoil', 'MobX', 
  'Effector', 'RxJS', 'XState', 'Recharts', 'Victory', 'Highcharts', 'ApexCharts', 'Docker', 
  'Docker Compose', 'Kubernetes', 'Podman', 'Helm', 'Nginx', 'Apache', 'PM2', 'Vercel', 
  'Netlify', 'Cloudflare Pages', 'Render', 'Railway', 'Fly.io', 'Heroku', 'AWS', 'GCP', 
  'Azure', 'DigitalOcean', 'Linode', 'GitHub', 'GitLab', 'Bitbucket', 'Git', 'CI/CD', 
  'GitHub Actions', 'GitLab CI', 'CircleCI', 'Travis CI', 'Jenkins', 'Terraform', 'Ansible', 
  'WebAssembly', 'Progressive Web Apps (PWA)', 'Service Workers', 'Workbox', 'Tauri', 'Electron', 
  'Capacitor', 'Cordova', 'Expo', 'React Native', 'Flutter Web', 'Ionic', 'Chrome DevTools', 
  'Lighthouse', 'Google Fonts', 'Figma', 'Adobe XD', 'Zeplin', 'Canva', 'Vercel Analytics', 
  'Sentry', 'LogRocket', 'Hotjar', 'Mixpanel', 'PostHog', 'Segment', 'Analytics.js', 'Unocss', 
  'Tailwind Variants', 'Tailwind Merge'
];

// 🎲 Function to get random tech topic
const getRandomTechTopic = () => {
  const randomIndex = Math.floor(Math.random() * techTopics.length);
  const selectedTopic = techTopics[randomIndex];
  console.log(`🎯 Selected random tech topic: ${selectedTopic}`);
  return `${selectedTopic} coding tips best practices`;
};

const scheduleTweet = (time, topic) => {
  cron.schedule(time, async () => {
    try {
      const tweet = await generateContent(topic);
      await postTweet(tweet);
      console.log(`✅ Tweet posted at ${time}:`, tweet);
    } catch (error) {
      console.error(`❌ Failed to post tweet at ${time}:`, error);
    }
  });
};

// Schedule tweets
scheduleTweet('0 10 * * *', getRandomTechTopic()); // 10 AM
scheduleTweet('0 15 * * *', 'SASS(Software As a Service) related jurney-Product build related jurney'); // 3 PM
scheduleTweet('0 21 * * *', getRandomTechTopic()); // 9 PM

// Root endpoint
app.get('/', (req, res) => {
  res.send('Auto Tweet App is Running 🚀');
});

// 📊 Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    message: 'Auto Tweet App is healthy 💚',
    scheduledTweets: [
      { time: '10:00 AM', topic: 'WebDev/MobileDev/Devops' },
      { time: '03:00 PM', topic: 'Sass' },
      { time: '09:00 PM', topic: 'Coding Advice' }
    ],
    timestamp: new Date().toISOString()
  });
});

// Active Render to post
app.get("/ping",(req,res)=>{
  res.status(200).send("pong");
})



//===========================================  Testing API ===============================================

// // 🧪 TESTING ENDPOINT - Test tweet generation and posting
// app.post('/test-tweet', async (req, res) => {
//   try {
//     const { topic } = req.body;
//     const testTopic = topic || 'coding motivation test';
    
//     console.log(`🧪 Testing tweet generation for topic: "${testTopic}"`);
    
//     // Generate content
//     const tweet = await generateContent(testTopic);
//     console.log(`📝 Generated tweet: "${tweet}"`);
    
//     // Post the tweet
//     await postTweet(tweet);
    
//     res.json({
//       success: true,
//       message: 'Test tweet posted successfully! 🎉',
//       tweet: tweet,
//       topic: testTopic,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Test tweet failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Test tweet failed',
//       error: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// // 🔍 TESTING ENDPOINT - Test content generation only (no posting)
// app.post('/test-generate', async (req, res) => {
//   try {
//     const { topic } = req.body;
//     const testTopic = topic || 'coding inspiration test';
    
//     console.log(`🧪 Testing content generation for topic: "${testTopic}"`);
    
//     const tweet = await generateContent(testTopic);
    
//     res.json({
//       success: true,
//       message: 'Content generated successfully! 📝',
//       tweet: tweet,
//       topic: testTopic,
//       length: tweet.length,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     console.error('❌ Content generation test failed:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Content generation failed',
//       error: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// // 🎲 TESTING ENDPOINT - Test random tech topic generation
// app.get('/test-random-topic', (req, res) => {
//   try {
//     const randomTopic = getRandomTechTopic();
    
//     res.json({
//       success: true,
//       message: 'Random tech topic generated! 🎯',
//       topic: randomTopic,
//       totalTopics: techTopics.length,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: 'Random topic generation failed',
//       error: error.message,
//       timestamp: new Date().toISOString()
//     });
//   }
// });

// // 🧪 TEST SCHEDULE - Remove after testing
// scheduleTweet('40 10 * * *',getRandomTechTopic()); // 10:40 AM
// scheduleTweet('43 10 * * *', getRandomTechTopic()); // 10:43 AM

//===========================================  Testing API ===============================================


app.listen(PORT, () => console.log(`AutoTweetServer running on port ${PORT}`));