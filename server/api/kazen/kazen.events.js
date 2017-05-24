/**
 * Kazen model events
 */

'use strict';

import {EventEmitter} from 'events';
var KazenEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
KazenEvents.setMaxListeners(0);

// Model events
var events = {
  save: 'save',
  remove: 'remove'
};

// Register the event emitter to the model events
function registerEvents(Kazen) {
  for(var e in events) {
    let event = events[e];
    Kazen.post(e, emitEvent(event));
  }
}

function emitEvent(event) {
  return function(doc) {
    KazenEvents.emit(event + ':' + doc._id, doc);
    KazenEvents.emit(event, doc);
  };
}

export {registerEvents};
export default KazenEvents;
