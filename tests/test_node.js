const https = require('https')

let targetUrl = 'https://api.raindrop.io/rest/v1/raindrops/0?search=1&sort=&page=0&perpage=25'
let opts = {
  headers: { Authorization: `Bearer a2b5a540-6606-418f-97c4-d1561cdd117a` },
}

fetch(targetUrl, opts).then(rsp => {
  return rsp.json()
}).then(value => {
  console.log(value)
})