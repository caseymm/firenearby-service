import fetch from 'node-fetch';
import dateFormat from 'dateformat';
import { uploadFile } from './actions.js';

const now = new Date();
const dateStr = dateFormat(now, "mm-d-yyyy-hhMMss");

async function getAllCurrentFires(){
  // (All) Current_WildlandFire_Locations
  const recentFires = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Current_WildlandFire_Locations/FeatureServer/0/query?where=1%3D1&outFields=CalculatedAcres,ContainmentDateTime,ControlDateTime,DailyAcres,DiscoveryAcres,FireBehaviorGeneral,FireCause,FireCauseGeneral,FireCauseSpecific,IncidentName,IncidentShortDescription,IncidentTypeCategory,IncidentTypeKind,InitialLongitude,InitialResponseAcres,PercentContained,PercentPerimeterToBeContained,POOCity,POOCounty,POODispatchCenterID,POOFips,POOJurisdictionalAgency,POOJurisdictionalUnit,POOLandownerCategory,POOLandownerKind,POOState,PrimaryFuelModel,SecondaryFuelModel,CreatedBySystem,ModifiedBySystem,CreatedOnDateTime_dt,ModifiedOnDateTime_dt,Source,InitialLatitude,InitialResponseDateTime,LocalIncidentIdentifier,FireDiscoveryDateTime&outSR=4326&f=json`;
  const resp = await fetch(recentFires);
  const data = await resp.json();

  const newFires = data.features.filter((f) => {
    const diffTime = new Date() - new Date(f.attributes.CreatedOnDateTime_dt)
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
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
  const recentFires = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services/last24h_WildlandFire_Locations/FeatureServer/0/query?where=DiscoveryAcres%3E.99&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=CalculatedAcres%2C+ContainmentDateTime%2C+ControlDateTime%2C+DailyAcres%2C+DiscoveryAcres%2C+DispatchCenterID%2C+FinalFireReportApprovedDate%2C+FireBehaviorGeneral%2C+FireCause%2C+FireCauseGeneral%2C+FireCauseSpecific%2C+FireCode%2C+FireDiscoveryDateTime%2C+FireMgmtComplexity%2C+FireOutDateTime%2C+FireStrategyConfinePercent%2C+FireStrategyFullSuppPercent%2C+FireStrategyMonitorPercent%2C+FireStrategyPointZonePercent%2C+ICS209ReportDateTime%2C+ICS209ReportForTimePeriodFrom%2C+ICS209ReportForTimePeriodTo%2C+IncidentName%2C+IncidentTypeCategory%2C+IncidentTypeKind%2C+InitialLatitude%2C+InitialLongitude%2C+InitialResponseAcres%2C+InitialResponseDateTime%2C+IsFireCauseInvestigated%2C+LocalIncidentIdentifier%2C+PercentContained%2C+PercentPerimeterToBeContained%2C+TotalIncidentPersonnel%2C+UniqueFireIdentifier%2C+WFDSSDecisionStatus%2C+CreatedBySystem%2C+ModifiedBySystem%2C+IsDispatchComplete%2C+StrategicDecisionPublishDate%2C+CreatedOnDateTime_dt%2C+ModifiedOnDateTime_dt%2C+Source&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson`;
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

  await uploadFile(`24hr_feed-${dateStr}`, JSON.stringify(onlyWildfires), 'json');
  await uploadFile(`all_current_feed-${dateStr}`, JSON.stringify(onlyNewFiresGeoJSON), 'json');
  await uploadFile(`latest`, JSON.stringify(combinedFires), 'json');
  
}

getLatestFires();