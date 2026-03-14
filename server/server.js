const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const { cacheMiddleware, clearCache } = require('./middleware/cache');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── 1. CORS — allow local dev + deployed Vercel frontend ──────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.FRONTEND_URL,       // e.g. https://shivraj.vercel.app
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / mobile
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// ── 2. MongoDB ────────────────────────────────────────────────────
let mongoConnected = false;
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    mongoConnected = true;
    const db = mongoose.connection.db;
    await db.collection('skills').createIndex({ category: 1 });
    await db.collection('skills').createIndex({ name: 1 });
    await db.collection('projects').createIndex({ status: 1 });
    await db.collection('projects').createIndex({ createdAt: -1 });
    await db.collection('projects').createIndex(
      { title: 'text', description: 'text' },
      { name: 'projects_text_search' }
    );
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('MongoDB indexes ready');
  })
  .catch(err => console.log('MongoDB error:', err.message));

// ── 3. Models ─────────────────────────────────────────────────────
const Profile = require('./models/Profile');
const Skill   = require('./models/Skill');
const Project = require('./models/Project');

// ── 4. Auth & Contact routes ──────────────────────────────────────
const authRoute    = require('./routes/auth');
const contactRoute = require('./routes/contact');
app.use('/api/auth',    authRoute);
app.use('/api/contact', contactRoute);

// ── Health check (Render uses this to verify server is alive) ─────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mongo:  mongoConnected ? 'connected' : 'disconnected',
    env:    process.env.NODE_ENV || 'development',
  });
});

// ── PROFILE ───────────────────────────────────────────────────────
const defaultProfile = {
  name: 'Shivraj Shinde', title: 'Full Stack Developer',
  bio: 'Passionate developer creating innovative solutions.',
  email: 'your.email@example.com', phone: '+91-XXXXXXXXXX', location: 'India',
};

app.get('/api/profile', cacheMiddleware(300), async (req, res) => {
  if (!mongoConnected) return res.json(defaultProfile);
  try {
    const profile = await Profile.findOne().lean();
    res.json(profile || defaultProfile);
  } catch { res.json(defaultProfile); }
});

app.put('/api/profile', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({}, req.body, { upsert: true, new: true });
    clearCache('/api/profile');
    res.json(profile);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── SKILLS ────────────────────────────────────────────────────────
const defaultSkills = [
  { _id: '1', name: 'JavaScript', icon: 'fab fa-js',       category: 'Frontend', level: 90 },
  { _id: '2', name: 'React',      icon: 'fab fa-react',    category: 'Frontend', level: 85 },
  { _id: '3', name: 'Node.js',    icon: 'fab fa-node',     category: 'Backend',  level: 80 },
  { _id: '4', name: 'MongoDB',    icon: 'fas fa-database', category: 'Database', level: 75 },
  { _id: '5', name: 'CSS',        icon: 'fab fa-css3-alt', category: 'Frontend', level: 85 },
  { _id: '6', name: 'Express',    icon: 'fab fa-node',     category: 'Backend',  level: 80 },
  { _id: '7', name: 'HTML',       icon: 'fab fa-html5',    category: 'Frontend', level: 90 },
  { _id: '8', name: 'MySQL',      icon: 'fas fa-database', category: 'Database', level: 85 },
];

app.get('/api/skills', cacheMiddleware(120), async (req, res) => {
  if (!mongoConnected) return res.json(defaultSkills);
  try {
    const skills = await Skill.find().lean().sort({ category: 1, name: 1 });
    res.json(skills.length > 0 ? skills : defaultSkills);
  } catch { res.json(defaultSkills); }
});

app.post('/api/skills', async (req, res) => {
  try {
    const skill = new Skill(req.body);
    await skill.save();
    clearCache('/api/skills');
    res.status(201).json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });
    clearCache('/api/skills');
    res.json(skill);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ error: 'Skill not found.' });
    clearCache('/api/skills');
    res.json({ message: 'Skill deleted.' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── PROJECTS ──────────────────────────────────────────────────────
app.get('/api/projects', cacheMiddleware(120), async (req, res) => {
  try {
    const projects = await Project.find().lean().sort({ createdAt: -1 });
    res.json(projects);
  } catch { res.json([]); }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    clearCache('/api/projects');
    res.status(201).json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    clearCache('/api/projects');
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    clearCache('/api/projects');
    res.json({ message: 'Project deleted.' });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// ── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));