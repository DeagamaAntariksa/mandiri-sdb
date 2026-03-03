-- === MANDIRI SDB DATABASE INITIALIZATION ===

-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Insert Default Admin (username: admin, password: password)
INSERT INTO admins (username, password) 
VALUES ('admin', 'password') 
ON DUPLICATE KEY UPDATE username=username;

-- 3. Create Box Inventory Table
CREATE TABLE IF NOT EXISTS box_inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    box_size VARCHAR(10) UNIQUE,
    total_slots INT DEFAULT 1700
) ENGINE=InnoDB;

-- 4. Seed Box Inventory
INSERT INTO box_inventory (box_size, total_slots) VALUES ('30', 1700) ON DUPLICATE KEY UPDATE total_slots = 1700;
INSERT INTO box_inventory (box_size, total_slots) VALUES ('40', 1700) ON DUPLICATE KEY UPDATE total_slots = 1700;
INSERT INTO box_inventory (box_size, total_slots) VALUES ('50', 1700) ON DUPLICATE KEY UPDATE total_slots = 1700;

-- 5. Create Applications Table
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
) ENGINE=InnoDB;
