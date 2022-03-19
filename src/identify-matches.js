import { getUsers, sendText } from './actions.js';

// get the latest data we've saved from: https://firenearby.s3.amazonaws.com/latest.json

getUsers();

// pretend there is a match and text myself
sendText();