import fetch from 'node-fetch';
import twitter from 'twitter-lite';
import { uploadFile, useTheData } from './actions.js';
import dateFormat from 'dateformat';

// async function screenshotAndTweet(){
//   let metadata = [];
//   const metadataFileUrl = `https://caseymm-earthquakes.s3.amazonaws.com/shakemaps/metadata.json`;
//   const metadataRespLatest = await fetch(metadataFileUrl);
//   const metadataLatest = await metadataRespLatest.json();
 
//   // console.log(metadataLatest)
//   for(const q in metadataLatest){
//     const quake = metadataLatest[q];
//     if(quake.hasMap){
//       // add it back to the array
//       metadata.push(quake);
//     } else if(quake.geojsonUrl){
//       // technically haven't created the map, but if it fails it is too late anyway
//       quake.hasMap = true;
//       metadata.push(quake);
//       useTheData(quake.id).then(img => {
//         if(img){
//           // don't bother making the map if it's going to be a blank map of water
//           uploadClient.post('media/upload', { media_data: img.toString('base64') }).then(result => {
//             const dateStr = dateFormat(quake.date, "mmmm dS, yyyy");
//             const timeStr = dateFormat(quake.date, "h:MM:ss TT");
//             const status = {
//               status: `A magnitude ${quake.magnitude} earthquake occurred ${quake.location} on ${dateStr} at ${timeStr} GMT\n\nhttps://earthquake.usgs.gov/earthquakes/eventpage/${quake.id}`,
//               media_ids: result.media_id_string
//             }
//             // post the status with the uploaded media to twitter
//             client.post('statuses/update', status).then(result => {
//               console.log('You successfully tweeted this : "' + result.text + '"');
//             }).catch(console.error);
//           }).catch(console.error);
//         } 
//       });
//     } else {
//       metadata.push(quake);
//     }
//     console.log(q, metadataLatest.length - 1)
//     if(q == metadataLatest.length - 1){
//       console.log('uploading metadata')
//       console.log(metadata)
//       await uploadFile(`shakemaps/metadata`, JSON.stringify(metadata), 'json');
//     }
//   }

  
// }

// screenshotAndTweet();