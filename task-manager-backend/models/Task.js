const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    priority: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ['pending', 'finished'], default: 'pending' },
});

module.exports = mongoose.model('Task', taskSchema);
