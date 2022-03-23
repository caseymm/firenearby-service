import AWS from 'aws-sdk';
import playwright from 'playwright';
import fetch from 'node-fetch';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
import Twilio from 'twilio';
const twilio = new Twilio(accountSid, authToken);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// The name of the bucket that you have created
const BUCKET_NAME = 'firenearby';

const titleCase = (str) => {
  return str.toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');
}

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET
});

async function uploadFile(name, data, ext) {
  // Setting up S3 upload parameters
  const params = {
      Bucket: BUCKET_NAME,
      Key: `${name}.${ext}`, // File name you want to save as in S3
      Body: data,
      Metadata: {
        'Cache-Control': 'no-cache',
      }
  };

  // Uploading files to the bucket
  s3.upload(params, function(err, data) {
      if (err) {
          throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
      return data.Location;
  });
};

async function sendText(imgUrl, userLoc, dist, fireName){
  console.log('SEND TEXT', imgUrl, userLoc, dist, fireName)
  twilio.messages
    .create({
      body: `The ${fireName} fire is ${dist} miles from your location of ${titleCase(userLoc)}.\n\nPlease visit https://caseymm.github.io/fire-nearby to view other fires.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.TEST_PHONE_NUMBER,
      mediaUrl: [imgUrl],
    })
    .then(message => console.log(message.sid));
}

async function getFires() {
  const resp = await fetch('https://firenearby.s3.amazonaws.com/latest.json');
  const json = await resp.json();
  return json;
}

async function getUsers(){
  const resp = await fetch(process.env.API_URL);
  const json = await resp.json();
  return json;
};

// this function returns the screenshot
async function createScreenshot(userCoords, userLocName, fireCoords, fireLocName, phoneNumber){
  const browser = await playwright['chromium'].launch();
  const context = await browser.newContext({
    deviceScaleFactor: 2
  });
  const pageURL = `https://caseymm.github.io/fire-nearby/#/screenshot?userLoc=${userCoords}&userLocName=${titleCase(userLocName)}&fireLoc=${fireCoords}&fireLocName=${fireLocName}&screenshot=true`;
  const page = await context.newPage();
  await page.setViewportSize({ width: 600, height: 400 });
  await page.goto(pageURL, timeout=0);
  try{
    await page.waitForSelector('#hidden', {state: 'attached'});
  } catch(err){
    // try again
    await delay(5000) // waiting 5 seconds
    await page.goto(pageURL, { timeout: 0 });
    await page.waitForSelector('#hidden', {state: 'attached'});
  }
  const screenshot = await page.screenshot();
  await uploadFile(`alerts/${phoneNumber}/${userLocName}-${fireLocName}`, screenshot, 'png');
  await browser.close();
  await delay(5000);
  return encodeURI(`https://firenearby.s3.amazonaws.com/alerts/${phoneNumber}/${userLocName}-${fireLocName}.png`)
}

export { uploadFile, getUsers, sendText, createScreenshot, getFires }