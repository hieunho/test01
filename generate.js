//import { device } from './C:/Users/TRONG HIEU/AppData/Local/Microsoft/TypeScript/2.6/node_modules/@types/aws-iot-device-sdk';

var fs = require('fs');
var awsIot = require('aws-iot-device-sdk');
const uuidv4 = require('uuid/v4');
var configJson = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var temp = true;
var token = [];
var deviceId = [];
var listDevices = [];
var device_instance = null;
var toSaveDeviceDataInNextTime = {}
var toSaveToken = {}
function getTimeString() {
    var now = new Date();
    var month = now.getMonth() + 1;
    if (month < 10)
        month = "0" + month;
    var date = now.getDate();
    if (date < 10)
        date = "0" + date;
    var timeStr = now.getFullYear() + "-" + month + "-" + date;
    return timeStr;
}
function generateBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function generateIndexDevices() {

    for (var i = 0; i < 3; i++) {
        toSaveDevice = {}
        toSaveDevice.token = uuidv4();
        toSaveDevice.firmware = 1.1;
        toSaveDevice.deviceid = configJson.devicename[i];
        toSaveDevice.timestamp = getTimeString();
        
        listDevices.push(toSaveDevice);
        toSaveToken[configJson.token[i]] =  toSaveDevice.token;
        console.log("Create Device:");
        console.log(toSaveDevice);
    }
    console.log(listDevices);


}

function generateIndexDeviceDataInFirst() {
    var now = new Date();
    toSaveDeviceDataInFirst = {}
    for (var i = 0; i < 3; i++) {
        toSaveDeviceDataInFirst[configJson.HumiditySensor[i]] = generateBetween(40, 90);
        toSaveDeviceDataInFirst[configJson.TemperatureSensor[i]] = generateBetween(20, 40);
        toSaveDeviceDataInFirst[configJson.PhSensor[i]] = generateBetween(3, 7);
        toSaveDeviceDataInFirst[configJson.EcSensor[i]] = generateBetween(1, 7);
        toSaveDeviceDataInFirst[configJson.LightSensor[i]] = generateBetween(50, 200);
        toSaveDeviceDataInFirst[configJson.TimeStamp[i]] = now;
    }
    console.log("Create first data:");
    console.log(toSaveDeviceDataInFirst);


}


function generateIndexDeviceDataInNextTime() {
    var now = new Date();
    
    for (var i = 0; i < 3; i++) {
        toSaveDeviceDataInNextTime[configJson.token[i]] = toSaveToken[configJson.token[i]];
        toSaveDeviceDataInNextTime[configJson.HumiditySensor[i]] = toSaveDeviceDataInFirst[configJson.HumiditySensor[i]] + generateBetween(-2, 2);
        toSaveDeviceDataInNextTime[configJson.TemperatureSensor[i]] = toSaveDeviceDataInFirst[configJson.TemperatureSensor[i]] + generateBetween(-2, 2);
        toSaveDeviceDataInNextTime[configJson.PhSensor[i]] = toSaveDeviceDataInFirst[configJson.PhSensor[i]] + generateBetween(-2, 2);
        toSaveDeviceDataInNextTime[configJson.EcSensor[i]] = toSaveDeviceDataInFirst[configJson.EcSensor[i]] + generateBetween(-2, 2);
        toSaveDeviceDataInNextTime[configJson.LightSensor[i]] = toSaveDeviceDataInFirst[configJson.LightSensor[i]] + generateBetween(-2, 2);
        toSaveDeviceDataInNextTime[configJson.TimeStamp[i]] = now;
    }
    console.log("Update data:");
    console.log(toSaveDeviceDataInNextTime);
    console.log("=========================");
}

/////////////////////////////

    device_instance = awsIot.device({
        keyPath: './cert/4b817377ae-private.pem',
        certPath: './cert/4b817377ae-certificate.pem',
        caPath: './cert/rootCA.pem',
        clientId: 'Smart_Sprinkler',
        host: 'a2oxjrmrtmst02.iot.us-east-1.amazonaws.com'
    });
    generateIndexDevices();
    device_instance
        .on('connect', function () {
            if (temp) {
            device_instance.publish('sprinkler/register', JSON.stringify(
                listDevices)
            );
            console.log('Send OK');
            temp = false;
        }
    });


/////////////////////////////////////////////////////////
generateIndexDeviceDataInFirst();
/// random data and send data up AWS
setInterval(function () {
    console.log('1.setInterval........');
    device_instance = awsIot.device({
        keyPath: './cert/4b817377ae-private.pem',
        certPath: './cert/4b817377ae-certificate.pem',
        caPath: './cert/rootCA.pem',
        clientId: 'Smart_Sprinkler',
        host: 'a2oxjrmrtmst02.iot.us-east-1.amazonaws.com'
    });
    generateIndexDeviceDataInNextTime();
     device_instance
            .on('connect', function () {
                console.log('connect');
            device_instance.publish('sprinkler/data', JSON.stringify(
                toSaveDeviceDataInNextTime)
            );
            console.log('OK');  
    });   
           
    console.log('2.setInterval........');
}, 10000);





