// src/lib/db/models/AppUpdate.js
const mongoose = require('mongoose');

const appUpdateSchema = new mongoose.Schema({
  version: {
    type: String,
    required: true,
    unique: true,
  },
  releaseNotes: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    default: Date.now,
  },
  apkUrl: {
    type: String,
    required: true,
  },
  instructions: {
    type: String,
    required: true,
  }
});

const AppUpdate = mongoose.models.AppUpdate || mongoose.model('AppUpdate', appUpdateSchema);

module.exports = AppUpdate; 


