import test from 'node:test';
import assert from 'node:assert/strict';
import {slotFor,messageFor} from './schedule.mjs';
test('winter CET',()=>{
 for(const [utc,h] of [[8,9],[12,13],[17,18]])assert.equal(slotFor(Date.UTC(2026,10,17,utc)).hour,h);
 for(const utc of [7,11,16])assert.equal(slotFor(Date.UTC(2026,10,17,utc)),null);
});
test('summer CEST',()=>{
 for(const [utc,h] of [[7,9],[11,13],[16,18]])assert.equal(slotFor(Date.UTC(2026,6,17,utc)).hour,h);
 for(const utc of [8,12,17])assert.equal(slotFor(Date.UTC(2026,6,17,utc)),null);
});
test('fixed slot and no health/name in payload',()=>{
 assert.equal(slotFor(Date.UTC(2026,10,17,8,1)),null);
 const ms=[9,13,18].map(hour=>messageFor({hour,day:17,id:'2026-11-17T'+hour}));
 assert.equal(new Set(ms.map(m=>m.body)).size,3);
 assert.doesNotMatch(JSON.stringify(ms),/Jonas|brok|operation|hospital|læge/i);
});
