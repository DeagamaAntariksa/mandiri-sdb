import mongoose from 'mongoose';

const boxInventorySchema = new mongoose.Schema({
    box_size: { type: String, required: true, unique: true },
    total_slots: { type: Number, default: 1700 }
});

const BoxInventory = mongoose.model('BoxInventory', boxInventorySchema);
export default BoxInventory;
