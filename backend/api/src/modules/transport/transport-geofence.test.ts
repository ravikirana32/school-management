import {isWithinGeofence,haversineMeters} from './transport-geofence.js';
const origin={latitude:12.9716,longitude:77.5946};
if(Math.abs(haversineMeters(origin,origin))>0.001)throw new Error('same-point distance should be zero');
if(!isWithinGeofence(origin,{latitude:12.9717,longitude:77.5946},150))throw new Error('close point should be inside radius');
if(isWithinGeofence(origin,{latitude:13.02,longitude:77.62},150))throw new Error('far point should be outside radius');
if(isWithinGeofence(origin,{latitude:12.9717,longitude:77.5946},0))throw new Error('zero radius must be rejected');
console.log('P563 geofence helper: 4/4 PASS');
