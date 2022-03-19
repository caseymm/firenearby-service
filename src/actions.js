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

// GET
const getUsers = (formJSON) => {
  fetch(process.env.API_URL, {
    method: 'GET',
  })
  .then((response) => response.json())
  .then(resp => {
    const json = JSON.parse(resp.body);
    // console.log(json);
    return json;
  });
};

// POST
// const updateUser = (formJSON) => {
//   fetch(process.env.API_URL, {
//     method: 'POST',
//     body: JSON.stringify(formJSON),
//   }).then((response) => {
//     console.log(response);
//     location.reload();
//   });
// };

async function sendText(user){
  twilio.messages
    .create({
      body: 'This is a text text to CASEY.',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.TEST_PHONE_NUMBER
    })
    .then(message => console.log(message.sid));
}

async function useTheData(id){
  // // this is where screenshot stuff goes
  // const browser = await playwright['chromium'].launch();
  // const context = await browser.newContext({
  //   deviceScaleFactor: 2
  // });
  // let isBlank = false;
  // const page = await context.newPage();
  // await page.setViewportSize({ width: 800, height: 800 });
  // await page.goto(`https://caseymm.github.io/mbx-earthquakes/?url=https://caseymm-earthquakes.s3.us-west-1.amazonaws.com/shakemaps/${id}.geojson`);
  // try{
  //   const sel = await page.waitForSelector('#hidden', {state: 'attached'});
  //   if(await sel.textContent() === 'blank map'){
  //     isBlank = true;
  //   }
  // } catch(err){
  //   // try again
  //   await delay(5000) // waiting 5 seconds
  //   console.log(`https://caseymm.github.io/mbx-earthquakes/?url=https://caseymm-earthquakes.s3.us-west-1.amazonaws.com/shakemaps/${id}.geojson`)
  //   await page.goto(`https://caseymm.github.io/mbx-earthquakes/?url=https://caseymm-earthquakes.s3.us-west-1.amazonaws.com/shakemaps/${id}.geojson`);
  //   const sel = await page.waitForSelector('#hidden', {state: 'attached'});
  //   if(await sel.textContent() === 'blank map'){
  //     isBlank = true;
  //   }
  // }
  // if(isBlank){
  //   await browser.close();
  //   return null;
  // } else {
  //   // only take the screenshot if it's not blank water
  //   const screenshot = await page.screenshot();
  //   await uploadFile(`shakemaps/${id}`, screenshot, 'png');
  //   await browser.close();
  //   return screenshot;
  // }
}

export { uploadFile, getUsers, sendText, useTheData }