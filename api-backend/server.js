import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import pool from './db.js';
import { sendTrackingCodeEmail, sendPaymentReminderEmail, sendApprovalEmail } from './mailer.js';

dotenv.config();

// Ensure uploads directory exists (Local Storage)
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialize Database Tables (MySQL)
const initDB = async () => {
    try {
        // Initialize Box Inventory Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS box_inventory (
                id INT AUTO_INCREMENT PRIMARY KEY,
                box_size VARCHAR(10) UNIQUE,
                total_slots INT DEFAULT 1700
            ) ENGINE=InnoDB
        `);

        // Initialize Applications Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tracking_code VARCHAR(20) UNIQUE,
                full_name VARCHAR(255),
                nik VARCHAR(20),
                phone VARCHAR(20),
                email VARCHAR(255),
                address TEXT,
                account_number VARCHAR(50),
                account_type VARCHAR(50),
                credit_card_type VARCHAR(50),
                box_size VARCHAR(10),
                box_room VARCHAR(10) DEFAULT '1',
                box_number INT,
                status VARCHAR(20) DEFAULT 'pending',
                payment_status VARCHAR(20) DEFAULT 'unpaid',
                rejection_reason TEXT,
                ktp_path TEXT,
                passbook_path TEXT,
                signature_path TEXT,
                price DECIMAL(15, 2),
                start_date DATE,
                jatuh_temponext DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);

        // Handle migrations for existing MySQL tables
        const [columns] = await pool.query('SHOW COLUMNS FROM applications');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('box_number')) {
            await pool.query('ALTER TABLE applications ADD COLUMN box_number INT');
        }
        if (!columnNames.includes('box_room')) {
            await pool.query('ALTER TABLE applications ADD COLUMN box_room VARCHAR(10) DEFAULT "1"');
        }
        if (!columnNames.includes('price')) {
            await pool.query('ALTER TABLE applications ADD COLUMN price DECIMAL(15, 2)');
        }
        if (!columnNames.includes('start_date')) {
            await pool.query('ALTER TABLE applications ADD COLUMN start_date DATE');
        }
        if (!columnNames.includes('jatuh_temponext')) {
            await pool.query('ALTER TABLE applications ADD COLUMN jatuh_temponext DATE');
        }

        console.log('Database tables verified and updated (MySQL).');

        // Seed or Update Box Inventory Capacity
        const sizes = ['30', '40', '50'];
        for (const size of sizes) {
            await pool.query(
                'INSERT INTO box_inventory (box_size, total_slots) VALUES (?, 1700) ON DUPLICATE KEY UPDATE total_slots = 1700',
                [size]
            );
        }
        console.log('Box inventory capacity updated (Total 5100).');
    } catch (err) {
        console.error('Database Initialization Error:', err);
    }
};
initDB();

// Multer storage configuration - Local Disk Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
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
    const isProd = process.env.NODE_ENV === 'production';
    res.send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #2563eb;">🚀 Backend Express ${isProd ? '(Production)' : '(Local)'} Active!</h1>
            <p>Server running on port ${process.env.PORT || 5001}.</p>
            <p>Database Status: <span style="color: green; font-weight: bold;">Connected ✅</span></p>
            <hr style="margin: 20px 0; border: 1px solid #eee;">
            <p style="color: #666;">Application is ready for safe deposit box management.</p>
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
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({
            message: 'Database connection successful!',
            data: rows[0]
        });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM admins WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length > 0) {
            res.json({
                message: 'Login successful',
                token: 'mock-jwt-token',
                user: { id: rows[0].id, username: rows[0].username }
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

        const ktpPath = req.files['ktpImage'] ? req.files['ktpImage'][0].path.replace(/\\/g, '/') : null;
        const passbookPath = req.files['passbookImage'] ? req.files['passbookImage'][0].path.replace(/\\/g, '/') : null;
        const signaturePath = req.files['signatureImage'] ? req.files['signatureImage'][0].path.replace(/\\/g, '/') : null;

        if (!ktpPath || !passbookPath) {
            return res.status(400).json({ message: 'KTP and Passbook images are required' });
        }

        const finalBoxRoom = boxRoom || '1';
        const finalBoxNumber = boxNumber || null;
        const trackingCode = 'SDB-' + Math.random().toString(36).substring(2, 9).toUpperCase();

        await pool.query(
            `INSERT INTO applications 
            (tracking_code, full_name, nik, phone, email, address, account_number, account_type, credit_card_type, box_size, box_room, box_number, status, ktp_path, passbook_path, signature_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [trackingCode, fullName, nik, phone, email, address, accountNumber, accountType, creditCardType, boxSize, finalBoxRoom, finalBoxNumber, 'pending', ktpPath, passbookPath, signaturePath]
        );

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
        const [rows] = await pool.query(
            'SELECT tracking_code, status, payment_status as paymentStatus, box_size as boxSize, created_at as submittedAt, start_date as startDate, jatuh_temponext as endDate, full_name as fullName, nik, phone, email, address, account_number as accountNumber, rejection_reason as rejectionReason FROM applications WHERE tracking_code = ?',
            [req.params.trackingCode]
        );

        if (rows.length > 0) {
            res.json(rows[0]);
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
        const [rows] = await pool.query(
            'SELECT box_number, status FROM applications WHERE (box_room = ? OR (box_room IS NULL AND ? = "1")) AND status IN ("pending", "active")',
            [req.params.room, req.params.room]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN API ENDPOINTS

app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN payment_status = 'late' THEN 1 ELSE 0 END) as late
            FROM applications
        `);

        const [inventory] = await pool.query('SELECT box_size, total_slots FROM box_inventory');
        const metricsBySize = {};
        let totalCapacity = 0;

        inventory.forEach(inv => {
            metricsBySize[inv.box_size] = { total: inv.total_slots, active: 0, available: inv.total_slots };
            totalCapacity += inv.total_slots;
        });

        const [sizeStats] = await pool.query('SELECT box_size, COUNT(*) as active_count FROM applications WHERE status = "active" GROUP BY box_size');
        sizeStats.forEach(s => {
            if (metricsBySize[s.box_size]) {
                metricsBySize[s.box_size].active = parseInt(s.active_count);
                metricsBySize[s.box_size].available = metricsBySize[s.box_size].total - parseInt(s.active_count);
            }
        });

        res.json({
            totalBoxes: totalCapacity,
            available: totalCapacity - (parseInt(stats[0].active) || 0),
            active: parseInt(stats[0].active) || 0,
            latePayments: parseInt(stats[0].late) || 0,
            metricsBySize
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/inventory', async (req, res) => {
    try {
        const [inventory] = await pool.query('SELECT box_size as size, total_slots as total FROM box_inventory');
        const [activeStats] = await pool.query('SELECT box_size, COUNT(*) as active FROM applications WHERE status = "active" GROUP BY box_size');

        const result = inventory.map(r => {
            const active = activeStats.find(a => a.box_size === r.size)?.active || 0;
            return { ...r, active: parseInt(active), available: r.total - parseInt(active) };
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/applications', async (req, res) => {
    try {
        await runAutoExpiry();
        const [rows] = await pool.query('SELECT id, tracking_code, full_name as name, email, nik, phone, box_size as size, box_number, account_number, price, status, payment_status as paymentStatus, created_at as createdAt, jatuh_temponext as paymentDueDate FROM applications ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/admin/applications/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
        if (rows.length > 0) {
            const appData = rows[0];
            const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
            res.json({
                ...appData,
                name: appData.full_name,
                paymentStatus: appData.payment_status,
                size: appData.box_size,
                ktpImage: appData.ktp_path ? `${process.env.BASE_URL}/${appData.ktp_path}` : null,
                passbookImage: appData.passbook_path ? `${process.env.BASE_URL}/${appData.passbook_path}` : null,
                signatureImage: appData.signature_path ? `${process.env.BASE_URL}/${appData.signature_path}` : null,
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
        const [rows] = await pool.query('SELECT full_name, email, tracking_code, box_size, jatuh_temponext FROM applications WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Not found' });

        const appl = rows[0];
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
        const fields = [];
        const params = [];
        if (status) { fields.push('status = ?'); params.push(status); }
        if (price) { fields.push('price = ?'); params.push(price); }
        if (start_date) { fields.push('start_date = ?'); params.push(start_date); }
        if (end_date) { fields.push('jatuh_temponext = ?'); params.push(end_date); }
        if (rejection_reason) { fields.push('rejection_reason = ?'); params.push(rejection_reason); }
        if (payment_status) { fields.push('payment_status = ?'); params.push(payment_status); }

        if (payment_status === 'paid') {
            const [current] = await pool.query('SELECT jatuh_temponext FROM applications WHERE id = ?', [req.params.id]);
            const baseDate = current[0]?.jatuh_temponext ? new Date(current[0].jatuh_temponext) : new Date();
            const newEndDate = req.body.new_end_date ? new Date(req.body.new_end_date) : new Date(baseDate.setFullYear(baseDate.getFullYear() + 1));
            fields.push('status = ?', 'jatuh_temponext = ?');
            params.push('active', newEndDate.toISOString().split('T')[0]);
        }

        if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

        params.push(req.params.id);
        await pool.query(`UPDATE applications SET ${fields.join(', ')} WHERE id = ?`, params);

        if (status === 'active') {
            const [applRows] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
            const appl = applRows[0];
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
        const today = new Date().toISOString().split('T')[0];
        await pool.query('UPDATE applications SET status = "expired", payment_status = "late" WHERE status = "active" AND jatuh_temponext < ?', [today]);
    } catch (err) {
        console.error('Auto-expiry error:', err.message);
    }
}

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
