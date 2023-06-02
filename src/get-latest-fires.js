import fetch from 'node-fetch';
import dateFormat from 'dateformat';
import { uploadFile } from './actions.js';

const now = new Date();
const dateStr = dateFormat(now, "mm-d-yyyy-hhMMss");

async function getAllCurrentFires(){
  // (All) Current_WildlandFire_Locations
  const recentFires = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson`;
  const resp = await fetch(recentFires);
  const data = await resp.json();

  const newFires = data.features.filter((f) => {
    const diffTime = new Date() - new Date(f.properties.CreatedOnDateTime_dt)
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    f.attributes = {};
    f.attributes.diffDays = diffDays;
    f.attributes.dataFeed = "Current Fires";
    if(diffDays < 1){
      return f;
    }
  });

  const onlyNewFiresGeoJSON = {
    type: 'FeatureCollection',
    features: []
  };

  newFires.forEach(f => {
    let tmp = {
      "type": "Feature",
      "properties": f.attributes,
      "geometry": {
        "type": "Point",
        "coordinates": [f.geometry.x, f.geometry.y]
      }
    };
    onlyNewFiresGeoJSON.features.push(tmp);
  })

  return onlyNewFiresGeoJSON;

}

async function getLatestFires(){
  // last24h_WildlandFire_Locations
  const recentFires = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/WFIGS_Incident_Locations_Last24h/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson`;
  const resp = await fetch(recentFires);
  const data = await resp.json();

  // filter out perscribed fires
  const onlyWildfires = {
    type: 'FeatureCollection',
    features: data.features.filter(f => f.properties.IncidentTypeCategory !== 'RX')
  };

  const onlyNewFiresGeoJSON = await getAllCurrentFires();

  const combinedFires = {
    type: 'FeatureCollection',
    features: onlyWildfires.features
  };

  const wildFireNamesOnly = onlyWildfires.features.map(f => f.properties.IncidentName);
  
  onlyNewFiresGeoJSON.features.forEach(f => {
    if(!wildFireNamesOnly.includes(f.properties.IncidentName)){
      combinedFires.features.push(f);
    }
  })
  
  combinedFires.features = combinedFires.features.filter(f => f.properties.DiscoveryAcres >= 1)

  await uploadFile(`24hr_feed-${dateStr}`, JSON.stringify(onlyWildfires), 'json');
  await uploadFile(`all_current_feed-${dateStr}`, JSON.stringify(onlyNewFiresGeoJSON), 'json');
  await uploadFile(`latest`, JSON.stringify(combinedFires), 'json');
  
}

getLatestFires();
