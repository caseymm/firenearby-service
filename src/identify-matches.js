import { getFires, getUsers, createScreenshot, sendText } from './actions.js';
import distance from '@turf/distance';
import { point } from '@turf/helpers';
import fetch from 'node-fetch';

// get the latest data we've saved from: https://firenearby.s3.amazonaws.com/latest.json
const options = {units: 'miles'};

getFires().then(resp => {
  const fires = resp.features;
  getUsers().then(resp => {
    const userLocations = resp;
    // console.log(fires, userLocations);
    userLocations.forEach(ul => {
      const pointA = point(ul.coordinates);
      fires.forEach(f => {
        // console.log(f)
        const firePt = point(f.geometry.coordinates);
        const dist = distance(pointA, firePt, options);
        // if within range, do this
        if(dist <= parseFloat(ul.radius)){
          const ulCoords = ul.coordinates.join();
          const fireCoords = f.geometry.coordinates.join();
          createScreenshot(ulCoords, ul.location, fireCoords, f.properties.IncidentName, ul.phoneNumber).then(imgUrl => {
            sendText(imgUrl, ul.location, String(parseInt(dist)), f.properties.IncidentName);
          })
        }
      })
    })
  })
})