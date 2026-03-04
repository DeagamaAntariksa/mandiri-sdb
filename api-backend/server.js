import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import './db.js';
import Admin from './models/Admin.js';
import Application from './models/Application.js';
import BoxInventory from './models/BoxInventory.js';
import { sendTrackingCodeEmail, sendPaymentReminderEmail, sendApprovalEmail } from './mailer.js';

dotenv.config();

// Ensure uploads directory exists (Local Storage)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialize Database Tables (MongoDB Seeding)
const initDB = async () => {
    try {
        const count = await BoxInventory.countDocuments();
        if (count === 0) {
            const sizes = ['30', '40', '50'];
            for (const size of sizes) {
                await BoxInventory.create({ box_size: size, total_slots: 1700 });
            }
            console.log('Box inventory capacity seeded (Total 5100).');
        } else {
            console.log('Box inventory already exists.');
        }

        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            await Admin.create({ username: 'admin', password: 'password' });
            console.log('Default admin created.');
        }
    } catch (err) {
        console.error('Database Initialization Error:', err);
    }
};
initDB();

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('Cloudinary configured for file uploads.');
}

// Multer storage configuration - Local Disk or Cloudinary
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'mandiri_sdb_uploads',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf']
        }
    });
} else {
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
}
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #2563eb;">🚀 Backend Express (Local MySQL) Active!</h1>
            <p>Server running on port 5001.</p>
            <p>Database: localhost (XAMPP)</p>
            <p>Status: <span style="color: green; font-weight: bold;">Connected ✅</span></p>
        </div>
    `);
});

// Status route
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running', database: 'mysql', timestamp: new Date() });
});

// Test DB route
app.get('/api/test-db', async (req, res) => {
    try {
        const isConnected = mongoose.connection.readyState === 1;
        if (isConnected) {
            res.json({ message: 'Database connection successful!', data: { connected: true } });
        } else {
            throw new Error('Mongoose not connected');
        }
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username, password });
        if (admin) {
            res.json({
                message: 'Login successful',
                token: 'mock-jwt-token',
                user: { id: admin._id, username: admin.username }
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Submit Application route
app.post('/api/applications', upload.fields([
    { name: 'ktpImage', maxCount: 1 },
    { name: 'passbookImage', maxCount: 1 },
    { name: 'signatureImage', maxCount: 1 },
]), async (req, res) => {
    try {
        const {
            fullName, nik, phone, email, address,
            accountNumber, accountType, creditCardType, boxSize,
            boxRoom, boxNumber
        } = req.body;

        const getFilePath = (fileField) => {
            if (!req.files[fileField]) return null;
            const file = req.files[fileField][0];
            return process.env.CLOUDINARY_CLOUD_NAME ? file.path : file.path.replace(/\\/g, '/');
        };

        const ktpPath = getFilePath('ktpImage');
        const passbookPath = getFilePath('passbookImage');
        const signaturePath = getFilePath('signatureImage');

        if (!ktpPath || !passbookPath) {
            return res.status(400).json({ message: 'KTP and Passbook images are required' });
        }

        const finalBoxRoom = boxRoom || '1';
        const finalBoxNumber = boxNumber || null;
        const trackingCode = 'SDB-' + Math.random().toString(36).substring(2, 9).toUpperCase();

        await Application.create({
            tracking_code: trackingCode,
            full_name: fullName,
            nik, phone, email, address,
            account_number: accountNumber,
            account_type: accountType,
            credit_card_type: creditCardType,
            box_size: boxSize,
            box_room: finalBoxRoom,
            box_number: finalBoxNumber,
            status: 'pending',
            ktp_path: ktpPath,
            passbook_path: passbookPath,
            signature_path: signaturePath
        });

        sendTrackingCodeEmail(email, trackingCode, {
            fullName, nik, phone, address, accountNumber, accountType, creditCardType, boxSize
        }).catch(err => console.error('[Mailer] Email failed:', err.message));

        res.status(201).json({ success: true, trackingCode });
    } catch (error) {
        console.error('Application Error:', error);
        res.status(500).json({ message: 'Failed to submit application', error: error.message });
    }
});

// Check Status route
app.get('/api/status/:trackingCode', async (req, res) => {
    try {
        const application = await Application.findOne({ tracking_code: req.params.trackingCode }).lean();

        if (application) {
            res.json({
                tracking_code: application.tracking_code,
                status: application.status,
                paymentStatus: application.payment_status,
                boxSize: application.box_size,
                submittedAt: application.created_at,
                startDate: application.start_date,
                endDate: application.jatuh_temponext,
                fullName: application.full_name,
                nik: application.nik,
                phone: application.phone,
                email: application.email,
                address: application.address,
                accountNumber: application.account_number,
                rejectionReason: application.rejection_reason
            });
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Check Box Availability
app.get('/api/boxes/availability/:room', async (req, res) => {
    try {
        const filter = { status: { $in: ['pending', 'active'] } };
        if (req.params.room === '1') {
            filter.$or = [{ box_room: '1' }, { box_room: null }];
        } else {
            filter.box_room = req.params.room;
        }
        const apps = await Application.find(filter, 'box_number status').lean();
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN API ENDPOINTS

app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        const apps = await Application.find().lean();
        const activeCount = apps.filter(a => a.status === 'active').length;
        const pendingCount = apps.filter(a => a.status === 'pending').length;
        const lateCount = apps.filter(a => a.payment_status === 'late').length;

        const inventory = await BoxInventory.find().lean();
        const metricsBySize = {};
        let totalCapacity = 0;

        inventory.forEach(inv => {
            metricsBySize[inv.box_size] = { total: inv.total_slots, active: 0, available: inv.total_slots };
            totalCapacity += inv.total_slots;
        });

        apps.filter(a => a.status === 'active').forEach(s => {
            if (metricsBySize[s.box_size]) {
                metricsBySize[s.box_size].active += 1;
                metricsBySize[s.box_size].available -= 1;
            }
        });

        res.json({
            totalBoxes: totalCapacity,
            available: totalCapacity - activeCount,
            active: activeCount,
            latePayments: lateCount,
            metricsBySize
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/inventory', async (req, res) => {
    try {
        const inventory = await BoxInventory.find().lean();
        const activeApps = await Application.find({ status: 'active' }).lean();

        const result = inventory.map(r => {
            const activeCount = activeApps.filter(a => a.box_size === r.box_size).length;
            return { size: r.box_size, total: r.total_slots, active: activeCount, available: r.total_slots - activeCount };
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/applications', async (req, res) => {
    try {
        await runAutoExpiry();
        const apps = await Application.find().sort({ created_at: -1 }).lean();
        const ObjectIdsToStrings = apps.map(app => ({
            id: app._id.toString(),
            tracking_code: app.tracking_code,
            name: app.full_name,
            email: app.email,
            nik: app.nik,
            phone: app.phone,
            size: app.box_size,
            box_number: app.box_number,
            account_number: app.account_number,
            price: app.price,
            status: app.status,
            paymentStatus: app.payment_status,
            createdAt: app.created_at,
            paymentDueDate: app.jatuh_temponext
        }));
        res.json(ObjectIdsToStrings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/applications/:id', async (req, res) => {
    try {
        const appData = await Application.findById(req.params.id).lean();
        if (appData) {
            const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
            const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:5001`;
            res.json({
                ...appData,
                id: appData._id.toString(),
                name: appData.full_name,
                paymentStatus: appData.payment_status,
                size: appData.box_size,
                ktpImage: appData.ktp_path ? `${BACKEND_URL}/${appData.ktp_path}` : null,
                passbookImage: appData.passbook_path ? `${BACKEND_URL}/${appData.passbook_path}` : null,
                signatureImage: appData.signature_path ? `${BACKEND_URL}/${appData.signature_path}` : null,
                startDate: fmt(appData.start_date),
                endDate: fmt(appData.jatuh_temponext),
                paymentDueDate: appData.jatuh_temponext ? fmt(appData.jatuh_temponext) : null,
                endDateRaw: appData.jatuh_temponext ? new Date(appData.jatuh_temponext).toISOString().split('T')[0] : null,
            });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/admin/applications/:id/send-reminder', async (req, res) => {
    try {
        const appl = await Application.findById(req.params.id).lean();
        if (!appl) return res.status(404).json({ message: 'Not found' });

        const dueDate = appl.jatuh_temponext ? new Date(appl.jatuh_temponext).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
        await sendPaymentReminderEmail(appl.email, appl.full_name, appl.tracking_code, appl.box_size, dueDate);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/admin/applications/:id', async (req, res) => {
    const { status, price, start_date, end_date, rejection_reason, payment_status } = req.body;
    try {
        const updateData = {};
        if (status) updateData.status = status;
        if (price) updateData.price = price;
        if (start_date) updateData.start_date = new Date(start_date);
        if (end_date) updateData.jatuh_temponext = new Date(end_date);
        if (rejection_reason) updateData.rejection_reason = rejection_reason;
        if (payment_status) updateData.payment_status = payment_status;

        if (payment_status === 'paid') {
            const current = await Application.findById(req.params.id);
            const baseDate = current?.jatuh_temponext ? new Date(current.jatuh_temponext) : new Date();
            const newEndDate = req.body.new_end_date ? new Date(req.body.new_end_date) : new Date(baseDate.setFullYear(baseDate.getFullYear() + 1));
            updateData.status = 'active';
            updateData.jatuh_temponext = newEndDate;
        }

        if (Object.keys(updateData).length === 0) return res.status(400).json({ message: 'No fields to update' });

        await Application.findByIdAndUpdate(req.params.id, updateData);

        if (status === 'active' || updateData.status === 'active') {
            const appl = await Application.findById(req.params.id).lean();
            const fmt = d => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
            sendApprovalEmail(appl.email, appl.full_name, appl.tracking_code, appl.box_size, fmt(appl.start_date), fmt(appl.jatuh_temponext))
                .catch(e => console.error('Approval email failed:', e.message));
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

async function runAutoExpiry() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        await Application.updateMany(
            { status: 'active', jatuh_temponext: { $lt: today } },
            { $set: { status: 'expired', payment_status: 'late' } }
        );
    } catch (err) {
        console.error('Auto-expiry error:', err.message);
    }
}

const PORT = process.env.PORT || 5001;
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

export default app;
