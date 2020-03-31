const Airtable = require('airtable')
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const osc = require('osc')

const SERIAL_PORT_PATH = '/dev/tty.usbmodem14101'
const NODE_IDS = ['reciffh4Y1Z8Oaf2Q', 'recua8W8vkc0wsI5c', 'rec5yOBmbBSfF6K6b', 'recdp0I4clyy8rjXA', 'rec8htvzMqQFUG0lx', 'rec1qlEzxuHJZyva9', 'recdwBNqkuQidIpSn', 'recOXvwozLW7lWvP6', 'rec7G2y3DuAwnRaNf', 'recXrGzFvvJE4yLSX', 'recPrcBtTSoGln7G7', 'recYB6hNEegzOgvhn']
const TABLE = 'Table 1'

const isKatie = false

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: API_KEY
})
var base = Airtable.base('appyTPH4axZIQ16Wq')

if (isKatie) {
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
}

function postData(isOn, nodeNumber) {
    base(TABLE).update([
        {
          "id": NODE_IDS[Number(nodeNumber)],
          "fields": {
              isOn: isOn.toString()          
            }
        }
      ], function(err, records) {
        if (err) {
          console.error(err)
          return
        }
      })
}

postData(true, 2)

class Projection {
    constructor(props) {
        this.nodeData = NODE_IDS.map(id => ({id, isOn: false}))
        this.initGet()
    }

    initGet() {
        setInterval(this.checkData, 1000)
    }

    checkData = () => {
        for (let idx = 0; idx < NODE_IDS.length; idx++) {
            base(TABLE).select({
                maxRecords: 13
            }).eachPage(records => {
                records.forEach(record => {
                    let whichNode = this.nodeData.findIndex((node, idx) => idx.toString() === record.get('Name'))
                    if (this.nodeData[whichNode].isOn.toString() !== record.get('isOn')) {
                        // Changed
                        console.log("Changed: ", whichNode, record.get('isOn'))
                        this.nodeData[whichNode].isOn = record.get('isOn')
                    }
                })
            })
        }
        console.log(this.nodeData)
    }
}

let projection = new Projection()