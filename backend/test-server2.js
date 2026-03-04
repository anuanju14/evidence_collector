const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// app.use(cors());
// app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
// app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/evidenceDB')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
// const  = require('./models/Case');
// const  = require('./models/CDR');
// const  = require('./models/IPDR');
// const  = require('./models/SocialMedia');

// Multer Setup for File Uploads
const upload = multer({ dest: 'uploads/' });

// Login Route
// app.('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded authentication
    if (username === 'admin' && password === 'password') {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Create Case
// app.('/api/cases', async (req, res) => {
    try {
        const newCase = new Case(req.body);
        const savedCase = await newCase.save();
        res.status(201).json(savedCase);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Cases
// app.('/api/cases', async (req, res) => {
    try {
        const cases = await Case.find().sort({ createdAt: -1 });
        res.json(cases);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single Case
// app.('/api/cases/:id', async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });
        res.json(caseItem);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Case
// app.('/api/cases/:id', async (req, res) => {
    try {
        const deletedCase = await Case.findByIdAndDelete(req.params.id);
        if (!deletedCase) return res.status(404).json({ message: 'Case not found' });
        res.json({ message: 'Case deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Evidence Log
// app.('/api/cases/:id/logs', upload.single('attachment'), async (req, res) => {
    try {
        console.log('Received log upload request for Case ID:', req.params.id);
        const { date, mode, remark } = req.body;

        let attachment = '';
        if (req.file) {
            // Store the relative URL to the file
            attachment = `http://localhost:5000/uploads/${req.file.filename}`;
        } else if (req.body.attachment) {
            // Handle cases where attachment might be sent as string (e.g. legacy or other logic)
            attachment = req.body.attachment;
        }

        console.log('Log data received:', { date, mode, remark, attachment });

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        caseItem.evidenceLogs.push({ date, mode, remark, attachment });
        const updatedCase = await caseItem.save();
        res.json(updatedCase);
    } catch (err) {
        console.error('Error adding log:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete Evidence Log
// app.('/api/cases/:id/logs/:logId', async (req, res) => {
    try {
        const { id, logId } = req.params;
        const caseItem = await Case.findById(id);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        caseItem.evidenceLogs = caseItem.evidenceLogs.filter(log => log._id.toString() !== logId);
        const updatedCase = await caseItem.save();
        res.json(updatedCase);
    } catch (err) {
        console.error('Error deleting log:', err);
        res.status(500).json({ error: err.message });
    }
});

// --- CDR Routes ---

// Get All CDRs
// app.('/api/cdr', async (req, res) => {
    try {
        const cdrs = await CDR.find().sort({ createdAt: -1 });
        res.json(cdrs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create single manual CDR record
// app.('/api/cdr', async (req, res) => {
    try {
        const newRecord = new CDR(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete CDR record
// app.('/api/cdr/:id', async (req, res) => {
    try {
        const deletedRecord = await CDR.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Excel CDR
// app.('/api/cdr/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }); // read as array of arrays

        // Assuming first row is header, search for 'Mobile' or similar column or just grab first column
        const recordsToInsert = [];

        // Skip header row if data[0] looks like headers
        const startIndex = data.length > 0 && isNaN(data[0][0]) ? 1 : 0;

        for (let i = startIndex; i < data.length; i++) {
            const row = data[i];
            if (row && row.length > 0) {
                // Find first item that looks like a mobile number (10+ digits)
                for (let j = 0; j < row.length; j++) {
                    const cellVal = String(row[j]).replace(/\D/g, ''); // strip non-digits
                    if (cellVal.length >= 10) {
                        // take last 10 digits as simple formatting
                        const mobile = cellVal.slice(-10);
                        recordsToInsert.push({ mobile });
                        break; // Move to next row
                    }
                }
            }
        }

        if (recordsToInsert.length > 0) {
            await CDR.insertMany(recordsToInsert, { ordered: false }).catch(err => {
                console.log("Some records might have failed validation", err.message);
            });
        }

        // Clean up file
        fs.unlinkSync(req.file.path);

        res.json({ success: true, message: `Processed ${recordsToInsert.length} records.` });
    } catch (err) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
    }
});

// Upload Excel for specific CDR record
// app.('/api/cdr/upload/:id', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const recordId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(recordId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Parse Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Update the existing record
        const updatedRecord = await CDR.findByIdAndUpdate(
            recordId,
            {
                fileName: req.file.originalname,
                filePath: req.file.path, // Save the path so we can download it
                uploadDate: new Date(),
                status: 'Completed',
                data: data
            },
            { new: true }
        );

        if (!updatedRecord) {
            // Only clean up file if the record wasn't found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Record not found' });
        }

        res.json({ success: true, message: 'File uploaded and associated successfully', data: updatedRecord });
    } catch (err) {
        console.error('Error in targeted CDR upload:', err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

// Download Excel for specific CDR record
// app.('/api/cdr/download/:id', async (req, res) => {
    try {
        const record = await CDR.findById(req.params.id);
        if (!record || !record.filePath) {
            return res.status(404).json({ message: 'File not found for this record' });
        }
        res.download(record.filePath, record.fileName); // Sends the file as a download
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- IPDR Routes ---

// Get All IPDRs
// app.('/api/ipdr', async (req, res) => {
    try {
        const ipdrs = await IPDR.find().sort({ createdAt: -1 });
        res.json(ipdrs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create single manual IPDR record
// app.('/api/ipdr', async (req, res) => {
    try {
        const { ipAddress } = req.body;
        const newRecord = new IPDR({ ipAddress, status: 'Pending' });
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete IPDR record
// app.('/api/ipdr/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const deletedRecord = await IPDR.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- IPDR Upload ---

// Upload Excel for specific IPDR record
// app.('/api/ipdr/upload/:id', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const recordId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(recordId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Parse Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        // Update the existing record
        const updatedRecord = await IPDR.findByIdAndUpdate(
            recordId,
            {
                fileName: req.file.originalname,
                filePath: req.file.path, // Save the path so we can download it later
                uploadDate: new Date(),
                status: 'Completed',
                data: data
            },
            { new: true }
        );

        if (!updatedRecord) {
            // Only clean up file if the record wasn't found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Record not found' });
        }

        res.json({ success: true, message: 'File uploaded and associated successfully', data: updatedRecord });
    } catch (err) {
        console.error('Error in targeted IPDR upload:', err);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: err.message });
    }
});

// Download Excel for specific IPDR record
// app.('/api/ipdr/download/:id', async (req, res) => {
    try {
        const record = await IPDR.findById(req.params.id);
        if (!record || !record.filePath) {
            return res.status(404).json({ message: 'File not found for this record' });
        }
        res.download(record.filePath, record.fileName); // Sends the file as a download
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Social Media Routes ---

// Get All Social Media Records
// app.('/api/social-media', async (req, res) => {
    try {
        const records = await SocialMedia.find().sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create single manual Social Media record
// app.('/api/social-media', async (req, res) => {
    try {
        const newRecord = new SocialMedia(req.body);
        const savedRecord = await newRecord.save();
        res.status(201).json(savedRecord);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete All Social Media records
// app.('/api/social-media', async (req, res) => {
    try {
        await SocialMedia.deleteMany({});
        res.json({ message: 'All social media records deleted successfully' });
    } catch (err) {
        console.error('Error deleting all social media records:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete Social Media record
// app.('/api/social-media/:id', async (req, res) => {
    try {
        const deletedRecord = await SocialMedia.findByIdAndDelete(req.params.id);
        if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
        res.json({ message: 'Record deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Upload Excel Social Media
// app.('/api/social-media/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        const recordsToInsert = [];
        // Skip header row
        const startIndex = 1;

        for (let i = startIndex; i < data.length; i++) {
            const row = data[i];
            if (row && row.length >= 1) {
                recordsToInsert.push({
                    name: row[0] || 'Unknown',
                    platform: row[1] || '',
                    handleOrLink: row[2] || ''
                });
            }
        }

        if (recordsToInsert.length > 0) {
            await SocialMedia.insertMany(recordsToInsert, { ordered: false }).catch(err => {
                console.log("Some records might have failed validation", err.message);
            });
        }

        fs.unlinkSync(req.file.path);
        res.json({ success: true, message: `Processed ${recordsToInsert.length} records.` });
    } catch (err) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
