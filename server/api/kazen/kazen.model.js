'use strict';

import mongoose from 'mongoose';
import {registerEvents} from './kazen.events';

var KazenSchema = new mongoose.Schema({
  name: String,
  text: String,
  active: { type: Boolean, default: true },
  /*
  currently, no photo. will implement later.
  photo: {
    data: Buffer,
    contentType: String },
  comments: [{
    body: String,
    date: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  */
  // author of the kazen
  userRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meta: {
    // number of thumb-ups clicked
    votes: { type: Number, default: 0 },
    // number of times added to favorites
    favs: { type: Number, default: 0 },
  },
  tags: [String],
  // date when this kazen was presented
  presented: { type: Date, default: Date.now },
  created: { type: Date, default: Date.now },
  modified: { type: Date, default: Date.now },
});

registerEvents(KazenSchema);
export default mongoose.model('Kazen', KazenSchema);
