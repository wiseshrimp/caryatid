const Airtable = require('airtable')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const API_KEY
const WHICH_ID = 'reciffh4Y1Z8Oaf2Q'
const SERIAL_PORT_PATH = '/dev/tty.usbmodem14101'

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: API_KEY
})
var base = Airtable.base('appyTPH4axZIQ16Wq')

// Serial comm
let prevData = '';
const port = new SerialPort(SERIAL_PORT_PATH, { baudRate: 9600 }, err => {
    console.log(err)
})
const parser = port.pipe(new Readline({ delimiter: '\n' }))
port.on("open", () => {
    console.log('serial port open')
})
parser.on('data', data =>{
    // console.log('serial data', data);
    // console.log('prev data', prevData);
    if (data != prevData) {
      console.log('sending data', data);

      let split = data.split(' ');
      for (let i = 0; i < split.length; i++) {
        postData(split[i] == 0 ? true : false, i);
      }
    }
    prevData = data;
})


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
