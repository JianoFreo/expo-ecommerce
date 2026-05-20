import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bannerImage: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  slug: { type: String, index: true },
}, { timestamps: true });

export const Shop = mongoose.model('Shop', shopSchema);
