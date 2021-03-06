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

const formatText = (f, dist, userLoc) => {
  const acres = () => {
    let phrase = 'acres were';
    if(f.DiscoveryAcres === 1){
      phrase = 'acre was';
    }
    return phrase;
  } 

  const fireCause = (fireCause) => {
    if(fireCause === 'Human'){
      return `${fireCause.toLowerCase()} ignition`;
    } else if(fireCause === null) {
      return 'unknown';
    } else {
      return fireCause.toLowerCase();
    }
  }
  return `The ${f.IncidentName} fire is ${dist} miles from your location of ${userLoc}. ${f.DiscoveryAcres} ${acres()} burning upon arrival at the scene and the fire cause is ${fireCause(f.FireCause)}.`;
}

async function sendText(imgUrl, userPhoneNumber, userLoc, dist, fireInfo){
  console.log('SEND TEXT', imgUrl, userPhoneNumber)
  twilio.messages
    .create({
      body: formatText(fireInfo, dist, userLoc),
      from: process.env.TWILIO_PHONE_NUMBER,
      to: userPhoneNumber,
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
  return json.filter(item => item.phoneNumber.length === 10 && item.coordinates.length > 1);
};

async function updateUser(userJson){
  const resp = fetch(process.env.API_URL, {
                 method: 'POST',
                 body: JSON.stringify(userJson),
               });
  return resp;
}

// this function returns the screenshot
async function createScreenshot(userCoords, userLocName, fireCoords, fireLocName, phoneNumber){
  const browser = await playwright['chromium'].launch();
  const context = await browser.newContext({
    deviceScaleFactor: 2
  });
  const pageURL = `https://caseymm.github.io/fire-nearby/#/screenshot?userLoc=${userCoords}&userLocName=${userLocName}&fireLoc=${fireCoords}&fireLocName=${fireLocName}&screenshot=true`;
  const page = await context.newPage();
  await page.setViewportSize({ width: 600, height: 400 });
  await page.goto(pageURL);
  try{
    await page.waitForSelector('#hidden', {state: 'attached'});
  } catch(err){
    // // try again
    await delay(5000) // waiting 5 seconds
    await page.goto(pageURL);
    await page.waitForSelector('#hidden', {state: 'attached'});
  }
  const screenshot = await page.screenshot();
  await uploadFile(`alerts/${phoneNumber}/${userLocName}-${fireLocName}`, screenshot, 'png');
  await browser.close();
  await delay(5000);
  return encodeURI(`https://firenearby.s3.amazonaws.com/alerts/${phoneNumber}/${userLocName}-${fireLocName}.png`)
}

export { uploadFile, getUsers, updateUser, sendText, createScreenshot, getFires }