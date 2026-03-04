import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    tracking_code: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    nik: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    account_number: { type: String, required: true },
    account_type: { type: String },
    credit_card_type: { type: String },
    box_size: { type: String, required: true },
    box_room: { type: String, default: '1' },
    box_number: { type: Number },
    status: { type: String, default: 'pending' },
    payment_status: { type: String, default: 'unpaid' },
    rejection_reason: { type: String },
    ktp_path: { type: String },
    passbook_path: { type: String },
    signature_path: { type: String },
    price: { type: Number },
    start_date: { type: Date },
    jatuh_temponext: { type: Date },
    created_at: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);
export default Application;
