import fetch from 'node-fetch';
import { uploadFile } from './actions.js';

async function getLatestFires(){

  // last24h_WildlandFire_Locations
  const recentFires = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services/last24h_WildlandFire_Locations/FeatureServer/0/query?where=DiscoveryAcres%3E.99&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=CalculatedAcres%2C+ContainmentDateTime%2C+ControlDateTime%2C+DailyAcres%2C+DiscoveryAcres%2C+DispatchCenterID%2C+FinalFireReportApprovedDate%2C+FireBehaviorGeneral%2C+FireCause%2C+FireCauseGeneral%2C+FireCauseSpecific%2C+FireCode%2C+FireDiscoveryDateTime%2C+FireMgmtComplexity%2C+FireOutDateTime%2C+FireStrategyConfinePercent%2C+FireStrategyFullSuppPercent%2C+FireStrategyMonitorPercent%2C+FireStrategyPointZonePercent%2C+ICS209ReportDateTime%2C+ICS209ReportForTimePeriodFrom%2C+ICS209ReportForTimePeriodTo%2C+IncidentName%2C+IncidentTypeCategory%2C+IncidentTypeKind%2C+InitialLatitude%2C+InitialLongitude%2C+InitialResponseAcres%2C+InitialResponseDateTime%2C+IsFireCauseInvestigated%2C+LocalIncidentIdentifier%2C+PercentContained%2C+PercentPerimeterToBeContained%2C+TotalIncidentPersonnel%2C+UniqueFireIdentifier%2C+WFDSSDecisionStatus%2C+CreatedBySystem%2C+ModifiedBySystem%2C+IsDispatchComplete%2C+StrategicDecisionPublishDate%2C+CreatedOnDateTime_dt%2C+ModifiedOnDateTime_dt%2C+Source&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pgeojson`;
  const resp = await fetch(recentFires);
  const data = await resp.json();

  await uploadFile(`latest`, JSON.stringify(data), 'json');
  
}

getLatestFires();


