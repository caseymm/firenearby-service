# firenearby (service)

The repository gathers the latest wildfire data and sends texts to users about relevant fires. Powers https://caseymm.github.io/fire-nearby/.

The data is [downloaded from NIFC](https://data-nifc.opendata.arcgis.com/datasets/nifc::wfigs-last-24-hour-wildland-fire-locations/about), filtered, and saved to S3. After gathering the new data, it looks through the user location database (an Amazon DynamoDB instance) and identifies fires within the distance that users have requested to be alerted about. Once the fire has been identified, an text message containing a map of the fire and user's location along with a few details about the fire is sent to the user.

All actions in this repository are run every 10 minutes.

### How to run manually
To get the latest fire data: `yarn get-data`
To identify and send text alerts to users: `yarn identify-matches`

*note: There is no build action since this script is being run by github actions

_This service was updated on August 2, 2022 to include an action that directly writes to the repository in order to circumvent github action timeouts._

