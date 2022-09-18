const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const http = require('http').Server(app);
const puppeteer = require('puppeteer');
const PuppeteerMassScreenshots = require('./screenShots.js');
const { isContext } = require('vm');
if (app.get('env') !== 'production') dotenv.config();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

const socketIO = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
  },
});
socketIO.on('connection', (socket) => {
  console.log(`⚡ : ${socket.id} user just connected`);
  socket.on('browse', async ({ url }) => {
    const browser = await puppeteer.launch({
      headless: true,
    });
    // creates an incognito browser context
    const context = await browser.createIncognitoBrowserContext();
    // creates new page in pristine context.
    const page = await context.newPage();
    await page.setViewport({
      width: 1255,
      height: 800,
    });
    // Fetches the web page
    await page.goto(url);
    // Instances of PuppeteerMassScreenshots takes the screenshots
    const screenshots = new PuppeteerMassScreenshots();
    await screenshots.init(page, socket);
    await screenshots.start();
  });

  socket.on('disconnect', () => console.log('🔥 : a user disconnected'));
});

app.get('/', (req, res) => {
  res.send('Welcome to screen share api!');
});
app.get('/api/v1', (req, res) => {
  res.send('First API! version');
});

http.listen(PORT, () => console.log(`The server is listening on port ${PORT}`));
