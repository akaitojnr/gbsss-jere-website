const path = require('path');
// Only load .env file if MONGO_URI is not already set (for local development)
// Last Revert Sync: 2026-02-09
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
const AdmissionPin = require('./models/AdmissionPin');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_db';

// Connect to MongoDB (with connection pooling for serverless)
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

// Initialize connection
connectDB();

app.use(cors());
app.use(bodyParser.json());
// Serve uploads - important for Vercel to route correctly if filesystem is used transiently or for static assets in repo
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/ping', async (req, res) => {
    await connectDB();
    res.json({ success: true, message: 'pong', time: new Date().toISOString() });
});

// Cloudinary Diagnostic Route
app.get('/api/cloudinary-test', async (req, res) => {
    try {
        const result = await cloudinary.api.ping();
        res.json({
            success: true,
            message: "Cloudinary is correctly configured!",
            result,
            config: {
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
                api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
                api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
            }
        });
    } catch (err) {
        console.error("Cloudinary Test Error:", err);
        res.status(500).json({
            success: false,
            message: "Cloudinary configuration error: " + err.message,
            error: err,
            details: "Check that your CLOUDINARY_API_SECRET and other keys in Vercel match exactly what is in your Cloudinary Dashboard."
        });
    }
});

// DB Status check
app.get('/api/db-status', async (req, res) => {
    await connectDB();
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

// Configure Cloudinary
const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim()
    });
}

// Configure Storage (Cloudinary or Local Fallback)
let storage;
if (isCloudinaryConfigured) {
    console.log('✅ Using Cloudinary Storage');
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'school-gallery',
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif'],
        },
    });
} else {
    console.log('⚠️ Cloudinary config missing. Using local storage fallback.');
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, 'uploads');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        },
    });
}

const upload = multer({ storage });

// Memory Storage for Imports (to avoid disk write issues on serverless/Vercel)
const uploadMemory = multer({ storage: multer.memoryStorage() });

// Routes

// Get Gallery
app.get('/api/gallery', async (req, res) => {
    await connectDB();
    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 });
        res.json(gallery);
    } catch (err) {
        console.error("Gallery Fetch Error:", err);
        res.status(500).json({ success: false, message: err.message, stack: err.stack });
    }
});

// Add to Gallery (Supports Cloudinary and Local Fallback)
app.post('/api/gallery', (req, res) => {
    upload.single('image')(req, res, async (err) => {
        if (err) {
            console.error("Gallery Upload Error:", err);
            return res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
        }

        const { title } = req.body;
        const file = req.file;

        if (!file || !title) {
            return res.status(400).json({ success: false, message: 'Title and Image are required' });
        }

        try {
            await connectDB();
            const count = await Gallery.countDocuments();
            // If it's local storage, we want a relative URL. If Cloudinary, it's the full path.
            const imageUrl = isCloudinaryConfigured ? file.path : `/uploads/${file.filename}`;

            const newImage = new Gallery({
                id: Date.now(),
                title,
                url: imageUrl,
                public_id: isCloudinaryConfigured ? file.filename : null
            });
            await newImage.save();
            res.json({ success: true, image: newImage });
        } catch (dbErr) {
            console.error("Gallery Save Error (DB):", dbErr);
            res.status(500).json({ success: false, message: 'Failed to save image to database: ' + dbErr.message });
        }
    });
});

// Delete from Gallery
app.delete('/api/gallery/:id', async (req, res) => {
    await connectDB();
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
    await connectDB();
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add News Article
app.post('/api/news', async (req, res) => {
    await connectDB();
    const { title, date, content } = req.body;
    try {
        const newArticle = new News({
            id: Date.now(),
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
    await connectDB();
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
    await connectDB();
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
    await connectDB();
    const { regNumber, password } = req.body;
    try {
        const student = await Student.findOne({ regNumber });
        if (student && student.password === password) {
            const { password: _, ...studentData } = student.toObject();
            res.json({ success: true, student: studentData });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get All Students (Admin)
app.get('/api/students', async (req, res) => {
    await connectDB();
    try {
        const students = await Student.find({}, '-password'); // Exclude password
        res.json(students);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching students' });
    }
});

// Add New Student
app.post('/api/students', async (req, res) => {
    await connectDB();
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
    await connectDB();
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
    await connectDB();
    try {
        await Student.deleteOne({ regNumber: req.params.regNumber });
        res.json({ success: true, message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

// Import Results from CSV
app.post('/api/import-results', uploadMemory.single('csv'), async (req, res) => {
    await connectDB();
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file' });

    try {
        const lines = file.buffer.toString('utf8').split('\n').filter(l => l.trim());
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
                { password, name, class: studentClass, results },
                { upsert: true, new: true }
            );
            importedCount++;
        }

        // No file to unlink with memory storage
        res.json({ success: true, message: `Imported ${importedCount} students`, count: importedCount });

    } catch (err) {
        res.status(500).json({ message: 'Import failed: ' + err.message });
    }
});

// --- Contact API ---
app.get('/api/contacts', async (req, res) => {
    await connectDB();
    try {
        const contacts = await Contact.find().sort({ date: -1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    await connectDB();
    try {
        await Contact.deleteOne({ id: req.params.id });
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/contact', async (req, res) => {
    await connectDB();
    const { name, email, message } = req.body;
    try {
        const newContact = new Contact({
            id: Date.now(),
            name, email, message
        });
        await newContact.save();

        // Email logic
        const config = await Config.findOne();
        if (config && config.contact && config.contact.email) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "gbsssjereutme@gmail.com",
                    pass: "nuiosqrdlfaxtdos",
                },
            });

            const mailOptions = {
                from: "gbsssjereutme@gmail.com",
                to: config.contact.email,
                subject: `New Contact Message from ${name}`,
                text: `You have a new message from ${name} (${email}):\n\n${message}`
            };

            await transporter.sendMail(mailOptions);
        }

        res.json({ success: true, message: 'Message stored' });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// --- Assignments API ---
app.get('/api/assignments', async (req, res) => {
    await connectDB();
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
    await connectDB();
    try {
        const newAssignment = new Assignment({
            id: Date.now(),
            ...req.body
        });
        await newAssignment.save();
        res.json({ success: true, assignment: newAssignment });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.delete('/api/assignments/:id', async (req, res) => {
    await connectDB();
    try {
        await Assignment.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

// --- CBT API ---
// Helper to shuffle array (Fisher-Yates)
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// Helper to shuffle exam questions and options
const shuffleExam = (exam) => {
    const examObj = exam.toObject(); // Convert Mongoose doc to plain object

    // 1. Shuffle Questions
    if (examObj.questions && examObj.questions.length > 0) {
        examObj.questions = shuffleArray(examObj.questions);

        // 2. Shuffle Options within each question
        examObj.questions = examObj.questions.map(q => {
            if (!q.options || q.options.length === 0) return q;

            // Store original index to track correct answer
            const optionsWithIndex = q.options.map((opt, idx) => ({
                text: opt,
                originalIndex: idx
            }));

            // Shuffle options
            const shuffledOptions = shuffleArray(optionsWithIndex);

            // Find new index of the correct answer
            // q.correct is the original index of the correct answer
            const newCorrectIndex = shuffledOptions.findIndex(item => item.originalIndex === q.correct);

            return {
                ...q,
                options: shuffledOptions.map(item => item.text),
                correct: newCorrectIndex
            };
        });
    }
    return examObj;
};

app.get('/api/cbt', async (req, res) => {
    await connectDB();
    const { studentClass } = req.query;
    try {
        const query = studentClass ? { class: studentClass } : {};
        const exams = await CBTExam.find(query).sort({ createdAt: -1 });

        // Shuffle questions and options for each exam
        const shuffledExams = exams.map(exam => shuffleExam(exam));

        res.json(shuffledExams);
    } catch (err) {
        console.error("Error fetching CBT:", err);
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/cbt', async (req, res) => {
    await connectDB();
    try {
        console.log('Received CBT Exam:', JSON.stringify(req.body, null, 2));
        const newExam = new CBTExam({
            id: Date.now(),
            ...req.body
        });
        await newExam.save();
        res.json({ success: true, exam: newExam });
    } catch (err) {
        console.error('Error saving exam:', err);
        res.status(500).json({ success: false, message: 'Error saving exam: ' + err.message });
    }
});

app.delete('/api/cbt/:id', async (req, res) => {
    await connectDB();
    try {
        await CBTExam.deleteOne({ id: req.params.id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.post('/api/import-questions', uploadMemory.single('file'), async (req, res) => {
    await connectDB();
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    try {
        console.log(`Processing file from memory buffer (size: ${req.file.size} bytes)`);
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            throw new Error('Invalid Excel/CSV file: No sheets found');
        }

        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        console.log(`Extracted ${data.length} rows from sheet: ${sheetName}`);

        if (!data || data.length === 0) {
            throw new Error('The uploaded file is empty or could not be parsed.');
        }

        // Validate headers (optional but good for debugging)
        const firstRow = data[0];
        const requiredHeaders = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'];
        // loosely check if at least 'Question' exists
        if (!('Question' in firstRow)) {
            console.warn('Warning: "Question" column not found in first row. Headers found:', Object.keys(firstRow));
        }

        const questions = data.map((row, index) => {
            // Flexible column matching
            const questionText = row['Question'] || row['question'] || '';

            // Find the "Correct Answer" column dynamically
            const rowKeys = Object.keys(row);
            const correctKey = rowKeys.find(k => {
                const lower = k.toLowerCase();
                return lower.includes('correct') || lower === 'answer' || lower === 'ans';
            });

            const correctValue = (correctKey ? row[correctKey] : '').toString().trim();

            if (index < 3) {
                console.log(`[Import Debug] Row ${index + 1}: Found Correct Key="${correctKey}", Value="${correctValue}"`);
            }

            const correctCharUpper = correctValue.toUpperCase();
            let correctIndex = -1;

            // 1. Exact A-D
            if (['A', 'B', 'C', 'D'].includes(correctCharUpper)) {
                correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctCharUpper);
            }
            // 2. "Option A", "Option B" (Case insensitive)
            else if (correctCharUpper.startsWith("OPTION ") && ["A", "B", "C", "D"].includes(correctCharUpper.split(" ")[1])) {
                correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctCharUpper.split(" ")[1]);
            }
            // 3. "A.", "B)", "A " (Case insensitive)
            else if (/^[A-D][.)]?$/.test(correctCharUpper)) {
                correctIndex = ['A', 'B', 'C', 'D'].indexOf(correctCharUpper.charAt(0));
            }
            // 3.5 "Answer is B", "The answer is A"
            else if (/ANSWER IS [A-D]/.test(correctCharUpper)) {
                const match = correctCharUpper.match(/ANSWER IS ([A-D])/);
                if (match) correctIndex = ['A', 'B', 'C', 'D'].indexOf(match[1]);
            }
            // 4. Numeric 1-4
            else if (!isNaN(parseInt(correctValue))) {
                const val = parseInt(correctValue);
                if (val >= 1 && val <= 4) correctIndex = val - 1;
            }

            const options = [
                (row['Option A'] || row['option a'] || '').toString().trim(),
                (row['Option B'] || row['option b'] || '').toString().trim(),
                (row['Option C'] || row['option c'] || '').toString().trim(),
                (row['Option D'] || row['option d'] || '').toString().trim()
            ];

            // Match by text (case-insensitive)
            if (correctIndex === -1 && correctValue !== '') {
                const lowerCorrect = correctValue.toLowerCase();
                const foundIndex = options.findIndex(opt => opt.toLowerCase() === lowerCorrect);
                if (foundIndex !== -1) {
                    correctIndex = foundIndex;
                }
            }

            // Fallback: Default to 0 (Option A) if invalid, but log warning
            if (correctIndex < 0 || correctIndex > 3) {
                console.warn(`Row ${index + 1}: Invalid correct answer "${correctValue}". Defaulting to Option A.`);
                correctIndex = 0;
            }

            return {
                question: questionText,
                options,
                correct: correctIndex
            };
        }).filter(q => q.question && q.question.trim() !== '');

        if (questions.length === 0) {
            throw new Error('No valid questions found. Please check column headers (Question, Option A, Option B, Option C, Option D, Correct Answer).');
        }

        // No file cleanup needed for memory storage

        console.log(`Successfully parsed ${questions.length} questions.`);
        res.json({ success: true, questions });

    } catch (err) {
        console.error('CBT Import Error:', err);
        // No file cleanup needed on error either

        res.status(500).json({
            success: false,
            message: 'Import failed: ' + err.message,
            details: err.stack
        });
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

app.get('/api/submissions', async (req, res) => {
    try {
        const subs = await Submission.find().sort({ submittedAt: -1 });
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

app.delete('/api/submissions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let result = null;

        // Try deleting by MongoDB _id first if it looks like one
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            result = await Submission.findByIdAndDelete(id);
        }

        // If not found or not an ObjectId, try custom numeric 'id'
        if (!result && !isNaN(id)) {
            result = await Submission.findOneAndDelete({ id: parseInt(id) });
        }

        if (result) {
            res.json({ success: true, message: 'Deleted' });
        } else {
            res.status(404).json({ success: false, message: 'Submission not found' });
        }
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

// --- Admission PINs API ---
app.get('/api/admission-pins', async (req, res) => {
    try {
        const pins = await AdmissionPin.find().sort({ createdAt: -1 });
        res.json(pins);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching pins' });
    }
});

app.post('/api/admission-pins', async (req, res) => {
    const { count, candidateName } = req.body;
    try {
        const generatedPins = [];
        const numToGenerate = count || 1;

        for (let i = 0; i < numToGenerate; i++) {
            // Generate a random 6-digit PIN
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const newPin = new AdmissionPin({
                code,
                candidateName: candidateName || ''
            });
            await newPin.save();
            generatedPins.push(newPin);
        }

        res.json({ success: true, pins: generatedPins });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error generating pins: ' + err.message });
    }
});

app.post('/api/admission-pins/validate', async (req, res) => {
    const { code } = req.body;
    try {
        const pin = await AdmissionPin.findOne({ code });
        if (!pin) {
            return res.status(404).json({ success: false, message: 'Invalid PIN' });
        }
        if (pin.isUsed) {
            return res.status(400).json({ success: false, message: 'PIN already used' });
        }

        // Mark as used when validated
        pin.isUsed = true;
        await pin.save();

        res.json({ success: true, pin });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Validation error' });
    }
});

app.delete('/api/admission-pins/:id', async (req, res) => {
    try {
        await AdmissionPin.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'PIN deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete failed' });
    }
});

app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error("Generic Upload Error:", err);
            return res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
        }
        if (!req.file) return res.status(400).json({ message: 'No file' });
        const imageUrl = isCloudinaryConfigured ? req.file.path : `/uploads/${req.file.filename}`;
        res.json({ success: true, url: imageUrl });
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('GLOBAL ERROR HANDLER:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
