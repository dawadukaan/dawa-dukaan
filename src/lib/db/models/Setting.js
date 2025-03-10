// src/lib/db/models/Setting.js

import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  keyValue: {
    type: Map,
    of: String,
  },
}, { timestamps: true });



const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema);

export default Setting;
