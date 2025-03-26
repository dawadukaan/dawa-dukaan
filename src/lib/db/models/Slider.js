// src/lib/db/models/Slider.js

import mongoose from 'mongoose';

const sliderSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        required: true,
    },
    link: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
});

const Slider = mongoose.models.Slider || mongoose.model('Slider', sliderSchema);

export default Slider;
