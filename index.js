const Airtable = require('airtable')
const API_KEY
const WHICH_ID = 'reciffh4Y1Z8Oaf2Q'

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: API_KEY
})
var base = Airtable.base('appyTPH4axZIQ16Wq')

function checkData() {
    base('Table 1').find(WHICH_ID, function(err, record) {
        if (err) { console.error(err); return }
        console.log('isOn: ', record.fields.isOn === 'true')
        console.log('which node: ', Number(record.fields.node))
    })
}

function postData(isOn, nodeNumber) {
    base('Table 1').update([
        {
          "id": "reciffh4Y1Z8Oaf2Q",
          "fields": {
              isOn: isOn.toString(),
              node: nodeNumber.toString()
          }
        }
      ], function(err, records) {
        if (err) {
          console.error(err)
          return
        }
      })
}

postData(true, 1)
checkData()
