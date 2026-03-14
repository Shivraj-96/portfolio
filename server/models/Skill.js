const mongoose = require('mongoose');  // ← this line was missing

const SkillSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  icon:     { type: String },
  category: { type: String },
  level:    { type: Number, min: 0, max: 100 }
});

module.exports = mongoose.model('Skill', SkillSchema);