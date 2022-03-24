import { getFires, getUsers, updateUser, createScreenshot, sendText } from './actions.js';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

// get the latest data we've saved from: https://firenearby.s3.amazonaws.com/latest.json
const options = {units: 'miles'};

getFires().then(resp => {
  const fires = resp.features;
  const fireNames = fires.map(f => f.properties.IncidentName);
  getUsers().then(resp => {
    const userLocations = resp;
    // console.log(fires, userLocations);
    userLocations.forEach(ul => {
      const pointA = point(ul.coordinates);
      const activeFireAlerts = ul.activeAlerts;
      fires.forEach(f => {
        // if we haven't sent an alert yet for that fire
        if(!activeFireAlerts.includes(f.properties.IncidentName)){
          const firePt = point(f.geometry.coordinates);
          const dist = distance(pointA, firePt, options);
          // if within range, do this
          if(dist <= parseFloat(ul.radius)){
            const ulCoords = ul.coordinates.join();
            const fireCoords = f.geometry.coordinates.join();
            createScreenshot(ulCoords, ul.location, fireCoords, f.properties.IncidentName, ul.phoneNumber).then(imgUrl => {
              sendText(imgUrl, ul.phoneNumber, ul.location, String(parseInt(dist)), f.properties);
              // add to user
              ul.activeAlerts.push(f.properties.IncidentName);
              updateUser(ul);
            })
          }
        }
      })
      // if user locations active alerts has fire that is no longer in fireNames, remove it
      const filteredList = activeFireAlerts.filter(afl => fireNames.includes(afl));
      if(activeFireAlerts !== filteredList){
        ul.activeAlerts = filteredList;
        updateUser(ul);
      }
    })
  })
})