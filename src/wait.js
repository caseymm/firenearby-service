const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const waited = await delay(20000) /// waiting 20 seconds