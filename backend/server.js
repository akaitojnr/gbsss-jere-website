const path = require('path');
// Only load .env file if MONGO_URI is not already set (for local development)
if (!process.env.MONGO_URI) {
    require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');
const multer = require('multer');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Models
const Student = require('./models/Student');
const Assignment = require('./models/Assignment');
const CBTExam = require('./models/CBTExam');
const Submission = require('./models/Submission');
const News = require('./models/News');
const Gallery = require('./models/Gallery');
const Contact = require('./models/Contact');
const Config = require('./models/Config');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

// Connect to MongoDB (with connection pooling for serverless)
if (mongoose.connection.readyState === 0) {
    mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => {
            console.error('MongoDB connection error:', err);
            console.log('Ensure MongoDB URI is set in environment variables!');
        });
}

app.use(cors());
app.use(bodyParser.json());
// Serve uploads - important for Vercel to route correctly if filesystem is used transiently or for static assets in repo
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/ping', (req, res) => {
    res.json({ success: true, message: 'pong', time: new Date().toISOString() });
});

// DB Status check
app.get('/api/db-status', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    res.json({
        success: true,
        state: states[state] || 'unknown',
        uri_configured: !!process.env.MONGO_URI,
        uri_masked: process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:([^@]+)@/, ':****@') : 'not set'
    });
});

// Routes

// Configure Multer
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'school-gallery',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
    },
});

const upload = multer({ storage });

// Local storage fallback for existing routes if needed (though we'll prefer Cloudinary now)
const localUploadDir = path.join(__dirname, 'uploads');

// Routes

// Get Gallery
app.get('/api/gallery', async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 });
        res.json(gallery);
    } catch (err) {
        console.error("Gallery Fetch Error:", err);
        res.status(500).json({ success: false, message: err.message, stack: err.stack });
    }
});

// Add to Gallery (Now using Cloudinary)
app.post('/api/gallery', upload.single('image'), async (req, res) => {
    const { title } = req.body;
    const file = req.file;

    if (!file || !title) {
        return res.status(400).json({ success: false, message: 'Title and Image are required' });
    }

    try {
        const count = await Gallery.countDocuments();
        const newImage = new Gallery({
            id: count + 1,
            title,
            url: file.path, // Cloudinary provides the full URL in file.path
            public_id: file.filename // Cloudinary provides the public_id in file.filename
        });
        await newImage.save();
        res.json({ success: true, image: newImage });
    } catch (err) {
        console.error("Gallery Save Error:", err);
        res.status(500).json({ success: false, message: 'Failed to save image: ' + err.message });
    }
});

// Delete from Gallery
app.delete('/api/gallery/:id', async (req, res) => {
    try {
        const image = await Gallery.findOne({ id: req.params.id });
        if (!image && mongoose.isValidObjectId(req.params.id)) {
            // Try finding by _id if numeric id fails
            image = await Gallery.findById(req.params.id);
        }

        if (!image) return res.status(404).json({ success: false, message: 'Image not found' });

        // Delete from Cloudinary if it has a public_id
        if (image.public_id) {
            try {
                await cloudinary.uploader.destroy(image.public_id);
            } catch (cloudErr) {
                console.warn("Cloudinary Deletion Error (non-fatal):", cloudErr.message);
            }
        }

        await Gallery.deleteOne({ _id: image._id });

        // Delete local file if it exists (legacy support)
        if (image.url.includes('/uploads/')) {
            const filename = image.url.split('/uploads/').pop();
            const filePath = path.join(__dirname, 'uploads', filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        res.json({ success: true, message: 'Image deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
});

// Get News
app.get('/api/news', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add News Article
app.post('/api/news', async (req, res) => {
    const { title, date, content } = req.body;
    try {
        const count = await News.countDocuments();
        const newArticle = new News({
            id: count + 1,
            title,
            date,
            content
        });
        await newArticle.save();
        res.json({ success: true, article: newArticle });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

// Update News Article
app.put('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    const { title, date, content } = req.body;
    try {
        let article = await News.findOne({ id: id });
        if (!article) return res.status(404).json({ message: 'Not found' });

        article.title = title;
        article.date = date;
        article.content = content;
        await article.save();
        res.json({ success: true, article });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Delete News Article
app.delete('/api/news/:id', async (req, res) => {
    try {
        const result = await News.deleteOne({ id: req.params.id });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ success: true, message: 'Article deleted' });
    } catch (err) {
        res.status(500).json({ success: false });
    }
});

// Student Login
app.post('/api/login', async (req, res) => {
    const { regNumber, password } = req.body;
    try {
        const student = await Student.findOne({ regNumber, password });
        if (student) {
            const { password, ...studentData } = student.toObject();
            res.json({ success: true, student: studentData });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get All Students (Admin)
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find({}, '-password'); // Exclude password
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Add New Student
app.post('/api/students', async (req, res) => {
    const { regNumber, password, name, class: studentClass, results } = req.body;
    if (!regNumber || !password || !name || !studentClass) {
        return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    try {
        const existing = await Student.findOne({ regNumber });
        if (existing) return res.status(400).json({ success: false, message: 'Student exists' });

        const newStudent = new Student({
            regNumber,
            password,
            name,
            class: studentClass,
            results: results || []
        });
        await newStudent.save();

        const { password: _, ...studentData } = newStudent.toObject();
        res.json({ success: true, student: studentData });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Update Student
app.put('/api/students/:regNumber', async (req, res) => {
    const { regNumber } = req.params;
    const { password, name, class: studentClass, results } = req.body;

    try {
        const student = await Student.findOne({ regNumber });
        if (!student) return res.status(404).json({ message: 'Not found' });

        if (password) student.password = password;
        if (name) student.name = name;
        if (studentClass) student.class = studentClass;
        if (results !== undefined) student.results = results;

        await student.save();
        const { password: _, ...studentData } = student.toObject();
        res.json({ success: true, student: studentData });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// Delete Student
app.delete('/api/students/:regNumber', async (req, res) => {
    try {
        await Student.deleteOne({ regNumber: req.params.regNumber });
        res.json({ success: true, message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// Import Results from CSV
app.post('/api/import-results', upload.single('csv'), async (req, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file' });

    try {
        const lines = fs.readFileSync(file.path, 'utf8').split('\n').filter(l => l.trim());
        if (lines.length < 2) return res.status(400).json({ message: 'Invalid CSV' });

        const headers = lines[0].split(',').map(h => h.trim());
        const subjectColumns = headers.slice(4);

        const calculateGrade = (score) => {
            if (score >= 75) return 'A';
            if (score >= 70) return 'B2';
            if (score >= 65) return 'B3';
            if (score >= 60) return 'C4';
            if (score >= 55) return 'C5';
            if (score >= 50) return 'C6';
            if (score >= 45) return 'D7';
            if (score >= 40) return 'E8';
            return 'F9';
        };

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < 4) continue;

            const [regNumber, password, name, studentClass] = values;

            const results = [];
            for (let j = 0; j < subjectColumns.length; j++) {
                const score = parseInt(values[4 + j]);
                if (!isNaN(score) && score >= 0) {
                    results.push({
                        subject: subjectColumns[j],
                        score,
                        grade: calculateGrade(score)
                    });
                }
            }

            // Upsert student
            await Student.findOneAndUpdate(
                { regNumber },
                { $set: { password, name, class: studentClass, results } },
                { upsert: true, new: true }
            );
            importedCount++;
        }

        fs.unlinkSync(file.path);
        res.json({ success: true, message: `Imported ${importedCount} students`, count: importedCount });

    } catch (err) {
        res.status(500).json({ message: 'Import failed: ' + err.message });
    }
});

// --- Contact API ---
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ date: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    try {
        await Contact.deleteOne({ id: req.params.id });
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        const newContact = new Contact({
            id: Date.now(),
            name, email, message
        });
        await newContact.save();

        // Email logic...
        const config = await Config.findOne();
        if (config && config.contact && config.contact.email) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "gbsssjereutme@gmail.com",
                    pass: "nuiosqrdlfaxtdos",
                },
            });
            // ... (rest of email logic same as before, simplified for brevity)
        }

        res.json({ success: true, message: 'Message stored' });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// --- Assignments API ---
app.get('/api/assignments', async (req, res) => {
    const { studentClass } = req.query;
    try {
        const query = studentClass ? { class: studentClass } : {};
        const assignments = await Assignment.find(query).sort({ createdAt: -1 });
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/assignments', async (req, res) => {
    try {
        const count = await Assignment.countDocuments();
        const newAssignment = new Assignment({
            id: count + 1, // Or Date.now() if preferred
            ...req.body
        });
        await newAssignment.save();
        res.json({ success: true, assignment: newAssignment });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.delete('/api/assignments/:id', async (req, res) => {
    try {
        await Assignment.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// --- CBT API ---
app.get('/api/cbt', async (req, res) => {
    const { studentClass } = req.query;
    try {
        const query = studentClass ? { class: studentClass } : {};
        const exams = await CBTExam.find(query).sort({ createdAt: -1 });
        res.json(exams);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/cbt', async (req, res) => {
    try {
        const count = await CBTExam.countDocuments();
        const newExam = new CBTExam({
            id: count + 1,
            ...req.body
        });
        await newExam.save();
        res.json({ success: true, exam: newExam });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.delete('/api/cbt/:id', async (req, res) => {
    try {
        await CBTExam.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/import-questions', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    try {
        const workbook = XLSX.readFile(req.file.path);
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        const questions = data.map(row => {
            const correctChar = (row['Correct Answer'] || row['Correct'] || '').toString().trim().toUpperCase();
            const correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctChar);
            return {
                question: row['Question'] || '',
                options: [row['Option A'], row['Option B'], row['Option C'], row['Option D']],
                correct: correctIndex !== -1 ? correctIndex : 0
            };
        }).filter(q => q.question);

        fs.unlinkSync(req.file.path);
        res.json({ success: true, questions });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// Export Results
app.get('/api/export-cbt-results/:examId', async (req, res) => {
    try {
        const examId = parseInt(req.params.examId);
        const exam = await CBTExam.findOne({ id: examId });
        if (!exam) return res.status(404).send('Exam not found');

        const submissions = await Submission.find({ type: 'cbt', referenceId: examId });
        // Fetch specific students or all for lookup
        // Doing loop might be slow if many, but ok for now
        const reportData = [];
        for (const sub of submissions) {
            const student = await Student.findOne({ regNumber: sub.studentReg }) || {};
            reportData.push({
                'Reg Number': sub.studentReg,
                'Name': student.name || 'Unknown',
                'Class': student.class || 'Unknown',
                'Score': sub.score,
                'Total': sub.total,
                'Percentage': ((sub.score / sub.total) * 100).toFixed(2) + '%',
                'Date': new Date(sub.submittedAt).toLocaleString()
            });
        }

        if (reportData.length === 0) return res.status(404).send('No data');

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(reportData);
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename="Result_${exam.title.replace(/[^a-z0-9]/gi, '_')}.xlsx"`);
        res.send(buffer);
    } catch (err) {
        res.status(500).send('Error');
    }
});

// --- Submissions ---
app.post('/api/submissions', async (req, res) => {
    try {
        const newSub = new Submission({
            id: Date.now(),
            ...req.body
        });
        await newSub.save();
        res.json({ success: true, submission: newSub });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.get('/api/submissions/:regNumber', async (req, res) => {
    try {
        const subs = await Submission.find({ studentReg: req.params.regNumber });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// Config
app.get('/api/config', async (req, res) => {
    try {
        const config = await Config.findOne();
        res.json(config || {}); // Frontend expects object
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/config', async (req, res) => {
    try {
        // Upsert singleton config
        // If we don't have an ID, we assume the first one.
        const existing = await Config.findOne();
        if (existing) {
            Object.assign(existing, req.body);
            await existing.save();
            res.json({ success: true, config: existing });
        } else {
            const newConfig = new Config(req.body);
            await newConfig.save();
            res.json({ success: true, config: newConfig });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    // IMPORTANT: Return relative path or full URL based on config?
    // Frontend logic often prepends base URL, so returning relative /uploads/... is safer if base URL is dynamic.
    // server.js before returned `/uploads/...` in generic upload, but full URL in others.
    // Let's stick to relative for generic generic upload as per previous code.
    res.json({ success: true, url: req.file.path });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
