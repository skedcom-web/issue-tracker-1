const express  = require('express');
const cors     = require('cors');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const os       = require('os');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── JSON File Database ───────────────────────────────────────────────────────
const DB_FILE = path.join(__dirname, 'issues.json');

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ issues: [], nextId: 1 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── Uploads Directory ────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ─── Multer ───────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) =>
    cb(null, `${Date.now()}-${uuidv4().slice(0,8)}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())
            && /image/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Only image files allowed (jpg, png, gif, webp)'));
  }
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Serve frontend — works both locally and on Render
const frontendPath = path.join(__dirname, '../frontend/public');
app.use(express.static(frontendPath));

// ─── Helper: Generate Defect No ───────────────────────────────────────────────
function generateDefectNo() {
  const db  = readDB();
  const seq = String(db.nextId).padStart(4, '0');
  const now = new Date();
  const yy  = String(now.getFullYear()).slice(-2);
  const mm  = String(now.getMonth() + 1).padStart(2, '0');
  return `DEF-${yy}${mm}-${seq}`;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/issues
app.get('/api/issues', (req, res) => {
  try {
    const { search = '', status = 'All', page = 1, limit = 15 } = req.query;
    const db = readDB();
    let results = [...db.issues].reverse();

    if (status !== 'All') results = results.filter(i => i.status === status);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      results = results.filter(i =>
        (i.defect_no   || '').toLowerCase().includes(s) ||
        (i.role        || '').toLowerCase().includes(s) ||
        (i.description || '').toLowerCase().includes(s) ||
        (i.resolved_by || '').toLowerCase().includes(s)
      );
    }

    const total     = results.length;
    const pageNum   = Number(page);
    const limitNum  = Number(limit);
    const paginated = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    res.json({ issues: paginated, total, page: pageNum, limit: limitNum });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/issues/:id
app.get('/api/issues/:id', (req, res) => {
  try {
    const db    = readDB();
    const issue = db.issues.find(i => String(i.id) === req.params.id || i.defect_no === req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(issue);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/issues
app.post('/api/issues', upload.single('file'), (req, res) => {
  try {
    const { role, description, status = 'Open' } = req.body;
    if (!role?.trim())        return res.status(400).json({ error: 'Role is required' });
    if (!description?.trim()) return res.status(400).json({ error: 'Description is required' });

    const db        = readDB();
    const defect_no = generateDefectNo();
    const baseUrl   = `${req.protocol}://${req.get('host')}`;

    const issue = {
      id:            db.nextId,
      defect_no,
      role:          role.trim(),
      logged_date:   new Date().toISOString(),
      description:   description.trim(),
      status,
      resolved_by:   null,
      resolved_date: null,
      file_name:     req.file ? req.file.originalname                      : null,
      file_path:     req.file ? req.file.filename                          : null,
      file_url:      req.file ? `${baseUrl}/uploads/${req.file.filename}`  : null,
      created_at:    new Date().toISOString()
    };

    db.issues.push(issue);
    db.nextId += 1;
    writeDB(db);

    res.status(201).json({ success: true, issue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/issues/:id/status
app.patch('/api/issues/:id/status', (req, res) => {
  try {
    const { status, resolved_by } = req.body;
    if (!['Open', 'In Progress', 'Closed'].includes(status))
      return res.status(400).json({ error: 'Invalid status value' });

    const db  = readDB();
    const idx = db.issues.findIndex(i => String(i.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Issue not found' });

    db.issues[idx].status        = status;
    db.issues[idx].resolved_by   = status === 'Closed' ? (resolved_by?.trim() || null) : null;
    db.issues[idx].resolved_date = status === 'Closed' ? new Date().toISOString()       : null;
    writeDB(db);

    res.json(db.issues[idx]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/stats
app.get('/api/stats', (req, res) => {
  try {
    const db   = readDB();
    const all  = db.issues;
    const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    res.json({
      total:      all.length,
      open:       all.filter(i => i.status === 'Open').length,
      inProgress: all.filter(i => i.status === 'In Progress').length,
      closed:     all.filter(i => i.status === 'Closed').length,
      recent:     all.filter(i => i.created_at >= week).length,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fallback — always serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n================================================');
  console.log('  DefectLog -- Issue Tracker  [RUNNING]');
  console.log('================================================');
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log('================================================\n');
});
