const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  techStack:   [String],
  githubLink:  { type: String },
  liveLink:    { type: String },
  image:       { type: String },
  status: {
    type:    String,
    enum:    ['completed', 'in-progress', 'planned'],
    default: 'completed',
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);