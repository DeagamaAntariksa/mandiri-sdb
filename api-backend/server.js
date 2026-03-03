import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import pool from './db.js';
import { put } from '@vercel/blob';
import { sendTrackingCodeEmail, sendPaymentReminderEmail, sendApprovalEmail } from './mailer.js';

dotenv.config();

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Initialize Database Tables
const initDB = async () => {
    try {
        // Initialize Box Inventory Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS box_inventory (
                id SERIAL PRIMARY KEY,
                box_size VARCHAR(10) UNIQUE,
                total_slots INT DEFAULT 1700
            )
        `);

        // Initialize Applications Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
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
            )
        `);

        // Check for migration columns (if table already exists but needs updates)
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='box_number') THEN
                    ALTER TABLE applications ADD COLUMN box_number INT;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='box_room') THEN
                    ALTER TABLE applications ADD COLUMN box_room VARCHAR(10) DEFAULT '1';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='price') THEN
                    ALTER TABLE applications ADD COLUMN price DECIMAL(15, 2);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='start_date') THEN
                    ALTER TABLE applications ADD COLUMN start_date DATE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='applications' AND column_name='jatuh_temponext') THEN
                    ALTER TABLE applications ADD COLUMN jatuh_temponext DATE;
                END IF;
            END $$;
        `);

        console.log('Database tables verified and updated.');

        // Seed or Update Box Inventory Capacity
        const sizes = ['30', '40', '50'];
        for (const size of sizes) {
            await pool.query(
                'INSERT INTO box_inventory (box_size, total_slots) VALUES ($1, 1700) ON CONFLICT (box_size) DO UPDATE SET total_slots = 1700',
                [size]
            );
        }
        console.log('Box inventory capacity updated to 1700 per type (Total 5100).');
    } catch (err) {
        console.error('Database Initialization Error:', err);
    }
};
initDB();

// Multer storage configuration - Switch to Memory Storage for Vercel Blob
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = 5001; // Hardcoded to avoid conflicts with 5000

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Logger middleware to see incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Root route
app.get('/', (req, res) => {
    res.send(`
        <div style="font-family: sans-serif; padding: 50px; text-align: center;">
            <h1 style="color: #2563eb;">🚀 Backend Express Berhasil Jalan!</h1>
            <p>Ini adalah <b>Server API</b> (Port 5001).</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; display: inline-block; margin-top: 20px;">
                <p>Untuk melihat <b>Website Utama</b> Anda, buka link ini:</p>
                <a href="http://localhost:5173" style="font-size: 20px; color: #2583eb; font-weight: bold; text-decoration: none;">👉 KLIK DI SINI: http://localhost:5173</a>
            </div>
            <p style="color: #6b7280; margin-top: 20px;">Endpoint aktif: <code>/api/status</code>, <code>/api/test-db</code>, <code>/api/login</code></p>
        </div>
    `);
});

// Status route
app.get('/api/status', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// Test DB route
app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT 1 + 1 AS solution');
        res.json({
            message: 'Database connection successful!',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
            error: 'Database connection failed',
            details: error.message
        });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    try {
        const result = await pool.query(
            'SELECT * FROM admins WHERE username = $1 AND password = $2',
            [username, password]
        );

        if (result.rows.length > 0) {
            res.json({
                message: 'Login successful',
                token: 'mock-jwt-token',
                user: { id: result.rows[0].id, username: result.rows[0].username }
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
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

        console.log('Incoming Application (Vercel):', { fullName, boxSize, boxRoom, boxNumber });

        // Vercel Blob Uploads
        const uploadFile = async (file, name) => {
            if (!file) return null;
            const blob = await put(`applications/${name}-${Date.now()}${path.extname(file.originalname)}`, file.buffer, {
                access: 'public',
            });
            return blob.url;
        };

        const ktpUrl = req.files['ktpImage'] ? await uploadFile(req.files['ktpImage'][0], 'ktp') : null;
        const passbookUrl = req.files['passbookImage'] ? await uploadFile(req.files['passbookImage'][0], 'passbook') : null;
        const signatureUrl = req.files['signatureImage'] ? await uploadFile(req.files['signatureImage'][0], 'signature') : null;

        if (!ktpUrl || !passbookUrl) {
            return res.status(400).json({ message: 'KTP and Passbook images are required' });
        }

        const finalBoxRoom = boxRoom || req.body.box_room || '1';
        const finalBoxNumber = boxNumber || req.body.box_number || null;
        const trackingCode = 'SDB-' + Math.random().toString(36).substring(2, 9).toUpperCase();

        await pool.query(
            `INSERT INTO applications 
            (tracking_code, full_name, nik, phone, email, address, account_number, account_type, credit_card_type, box_size, box_room, box_number, status, ktp_path, passbook_path, signature_path) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [trackingCode, fullName, nik, phone, email, address, accountNumber, accountType, creditCardType, boxSize, finalBoxRoom, finalBoxNumber, 'pending', ktpUrl, passbookUrl, signatureUrl]
        );

        sendTrackingCodeEmail(email, trackingCode, {
            fullName, nik, phone, address, accountNumber, accountType, creditCardType, boxSize
        }).catch((err) => {
            console.error('[Mailer] Gagal kirim email:', err.message);
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            trackingCode
        });
    } catch (error) {
        console.error('Application Error:', error);
        res.status(500).json({ message: 'Failed to submit application', error: error.message });
    }
});


// Check Status route
app.get('/api/status/:trackingCode', async (req, res) => {
    const { trackingCode } = req.params;

    try {
        const result = await pool.query(
            `SELECT 
                tracking_code, status, payment_status as "paymentStatus",
                box_size as "boxSize",
                created_at as "submittedAt",
                start_date as "startDate",
                jatuh_temponext as "endDate",
                full_name as "fullName", nik, phone, email, address,
                account_number as "accountNumber", rejection_reason as "rejectionReason"
            FROM applications WHERE tracking_code = $1`,
            [trackingCode]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Application not found' });
        }
    } catch (error) {
        console.error('Status Check Error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


// Check Box Availability in a Room
app.get('/api/boxes/availability/:room', async (req, res) => {
    const { room } = req.params;
    try {
        const result = await pool.query(
            'SELECT box_number, status FROM applications WHERE (box_room = $1 OR (box_room IS NULL AND $2 = \'1\')) AND status IN (\'pending\', \'active\')',
            [room, room]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN API ENDPOINTS

// Dashboard Stats
app.get('/api/admin/dashboard-stats', async (req, res) => {
    try {
        const statsResult = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN payment_status = 'late' THEN 1 ELSE 0 END) as late
            FROM applications
        `);

        const stats = statsResult.rows[0];

        // Fetch total slots from box_inventory
        const inventoryResult = await pool.query('SELECT box_size, total_slots FROM box_inventory');
        const metricsBySize = {};
        let totalCapacity = 0;

        inventoryResult.rows.forEach(inv => {
            metricsBySize[inv.box_size] = {
                total: inv.total_slots,
                active: 0,
                available: inv.total_slots
            };
            totalCapacity += inv.total_slots;
        });

        const sizeStatsResult = await pool.query(`
            SELECT box_size, COUNT(*) as active_count 
            FROM applications 
            WHERE status = 'active' 
            GROUP BY box_size
        `);

        sizeStatsResult.rows.forEach(s => {
            if (metricsBySize[s.box_size]) {
                metricsBySize[s.box_size].active = parseInt(s.active_count);
                metricsBySize[s.box_size].available = metricsBySize[s.box_size].total - parseInt(s.active_count);
            }
        });

        res.json({
            totalBoxes: totalCapacity,
            available: totalCapacity - (parseInt(stats.active) || 0),
            active: parseInt(stats.active) || 0,
            latePayments: parseInt(stats.late) || 0,
            metricsBySize
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Box Inventory Management
app.get('/api/admin/inventory', async (req, res) => {
    try {
        const inventoryResult = await pool.query('SELECT box_size as size, total_slots as total FROM box_inventory');

        // Combine with active count
        const activeStatsResult = await pool.query(`
            SELECT box_size, COUNT(*) as active 
            FROM applications 
            WHERE status = 'active' 
            GROUP BY box_size
        `);

        const result = inventoryResult.rows.map(r => {
            const active = activeStatsResult.rows.find(a => a.box_size === r.size)?.active || 0;
            return {
                ...r,
                active: parseInt(active),
                available: r.total - parseInt(active)
            };
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/admin/inventory', async (req, res) => {
    const { size, total } = req.body;
    try {
        await pool.query(
            'UPDATE box_inventory SET total_slots = $1 WHERE box_size = $2',
            [total, size]
        );
        res.json({ message: 'Inventory updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all applications
app.get('/api/admin/applications', async (req, res) => {
    try {
        await runAutoExpiry(); // Pastikan data terupdate sebelum ditarik
        const result = await pool.query(`
            SELECT id, tracking_code, full_name as name, email, nik, phone, box_size as size, box_number, account_number, price, status, payment_status as "paymentStatus", created_at as "createdAt", jatuh_temponext as "paymentDueDate" 
            FROM applications 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Application Detail
app.get('/api/admin/applications/:id', async (req, res) => {
    try {
        await runAutoExpiry(); // Pastikan data terupdate sebelum ditarik
        const result = await pool.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
        if (result.rows.length > 0) {
            const app = result.rows[0];
            const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
            res.json({
                ...app,
                name: app.full_name,
                paymentStatus: app.payment_status,
                size: app.box_size,
                ktpImage: app.ktp_path, // Now a Vercel Blob URL
                passbookImage: app.passbook_path, // Now a Vercel Blob URL
                signatureImage: app.signature_path, // Now a Vercel Blob URL
                // Date timeline fields
                submittedAt: fmt(app.created_at),
                approvedAt: fmt(app.start_date),
                memberSince: app.start_date ? fmt(app.start_date) : null,
                startDate: fmt(app.start_date),
                endDate: fmt(app.jatuh_temponext),
                paymentDueDate: app.jatuh_temponext ? fmt(app.jatuh_temponext) : null,
                // Raw ISO values for date inputs
                endDateRaw: app.jatuh_temponext ? new Date(app.jatuh_temponext).toISOString().split('T')[0] : null,
            });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send Payment Reminder Email (Admin)
app.post('/api/admin/applications/:id/send-reminder', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT full_name, email, tracking_code, box_size, jatuh_temponext FROM applications WHERE id = $1 LIMIT 1`,
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Application not found' });

        const appl = result.rows[0];
        const endDateFormatted = appl.jatuh_temponext
            ? new Date(appl.jatuh_temponext).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
            : null;

        await sendPaymentReminderEmail(
            appl.email,
            appl.full_name,
            appl.tracking_code,
            appl.box_size,
            endDateFormatted
        );

        res.json({ success: true, message: `Reminder email sent to ${appl.email}` });
    } catch (error) {
        console.error('[Reminder] Error:', error.message);
        res.status(500).json({ message: 'Gagal mengirim email reminder', error: error.message });
    }
});

// Helper to generate available box number (Fallback if not chosen)
async function generateAvailableBoxNumber(size, room) {
    const inventoryResult = await pool.query('SELECT total_slots FROM box_inventory WHERE box_size = $1', [size]);
    const inv = inventoryResult.rows[0];
    if (!inv) throw new Error(`Inventory for size ${size} not found`);

    const occupiedResult = await pool.query(
        'SELECT box_number FROM applications WHERE box_size = $1 AND box_room = $2 AND status IN (\'pending\', \'active\') AND box_number IS NOT NULL',
        [size, room]
    );
    const occupiedNumbers = occupiedResult.rows.map(o => o.box_number);

    // This is a fallback logic, 1-170 depending on size
    let start = 1;
    let end = 170;
    if (size === '40') { start = 171; end = 340; }
    else if (size === '50') { start = 341; end = 510; }

    for (let i = start; i <= end; i++) {
        if (!occupiedNumbers.includes(i)) return i;
    }
    return null; // Full
}

// Update Application (Approve/Reject/etc)
app.patch('/api/admin/applications/:id', async (req, res) => {
    const { status, price, start_date, end_date, rejection_reason, payment_status } = req.body;
    try {
        const fields = [];
        const params = [];
        let paramIdx = 1;

        if (status) { fields.push(`status = $${paramIdx++}`); params.push(status); }
        if (price) { fields.push(`price = $${paramIdx++}`); params.push(price); }
        if (start_date) { fields.push(`start_date = $${paramIdx++}`); params.push(start_date); }
        if (end_date) { fields.push(`jatuh_temponext = $${paramIdx++}`); params.push(end_date); }
        if (rejection_reason) { fields.push(`rejection_reason = $${paramIdx++}`); params.push(rejection_reason); }
        if (payment_status) { fields.push(`payment_status = $${paramIdx++}`); params.push(payment_status); }

        let newEndDate = null;
        if (payment_status === 'paid') {
            if (req.body.new_end_date) {
                newEndDate = new Date(req.body.new_end_date);
            } else {
                const currentAppResult = await pool.query(
                    `SELECT jatuh_temponext FROM applications WHERE id = $1 LIMIT 1`,
                    [req.params.id]
                );
                const baseDate = currentAppResult.rows[0]?.jatuh_temponext ? new Date(currentAppResult.rows[0].jatuh_temponext) : new Date();
                newEndDate = new Date(baseDate);
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            }
            const newEndDateStr = newEndDate.toISOString().split('T')[0];
            fields.push(`status = $${paramIdx++}`); params.push('active');
            fields.push(`jatuh_temponext = $${paramIdx++}`); params.push(newEndDateStr);
        }

        if (status === 'active') {
            const checkResult = await pool.query('SELECT box_size, box_room, box_number FROM applications WHERE id = $1', [req.params.id]);
            const currentApp = checkResult.rows[0];
            if (currentApp) {
                const room = currentApp.box_room || '1';
                if (!currentApp.box_number) {
                    const availableNum = await generateAvailableBoxNumber(currentApp.box_size, room);
                    if (!availableNum) {
                        return res.status(400).json({
                            success: false,
                            message: `No available slots for SDB Type ${currentApp.box_size} in Room ${room}.`
                        });
                    }
                    fields.push(`box_number = $${paramIdx++}`);
                    params.push(availableNum);
                }
                if (!currentApp.box_room) {
                    fields.push(`box_room = $${paramIdx++}`);
                    params.push(room);
                }
            }
        }

        if (fields.length === 0) return res.status(400).json({ message: 'No fields to update' });

        params.push(req.params.id);
        await pool.query(`UPDATE applications SET ${fields.join(', ')} WHERE id = $${paramIdx}`, params);

        if (status === 'active') {
            pool.query(
                `SELECT full_name, email, tracking_code, box_size, box_number, start_date, jatuh_temponext FROM applications WHERE id = $1 LIMIT 1`,
                [req.params.id]
            ).then((result) => {
                if (!result.rows.length) return;
                const appl = result.rows[0];
                const fmt = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null;
                sendApprovalEmail(
                    appl.email, appl.full_name, appl.tracking_code, appl.box_size,
                    fmt(start_date || appl.start_date),
                    fmt(end_date || appl.jatuh_temponext)
                ).catch(err => console.error('[Mailer] Approval email gagal:', err.message));
            }).catch(err => console.error('[DB] Gagal ambil data untuk approval email:', err.message));
        }

        res.json({
            success: true,
            message: 'Updated successfully',
            newEndDate: newEndDate ? newEndDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// =====================================================
// AUTO-EXPIRY SCHEDULER
// Runs every hour — marks any active contract whose
// jatuh_temponext has passed as expired + payment late
// =====================================================
async function runAutoExpiry() {
    try {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const result = await pool.query(
            `UPDATE applications
             SET status = 'expired', payment_status = 'late'
             WHERE status = 'active'
               AND jatuh_temponext IS NOT NULL
               AND jatuh_temponext < $1`,
            [today]
        );
        if (result.rowCount > 0) {
            console.log(`[Auto-Expiry] ✅ ${result.rowCount} kontrak diubah ke expired.`);
        }
    } catch (err) {
        console.error('[Auto-Expiry] ❌ Error:', err.message);
    }
}

export default app;
