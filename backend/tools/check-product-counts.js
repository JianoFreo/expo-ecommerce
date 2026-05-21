#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/product.model.js';
import { Shop } from '../src/models/shop.model.js';
import { User } from '../src/models/user.model.js';
import { ENV } from '../src/config/env.js';

dotenv.config();
const DB = process.env.DB_URL || ENV.DB_URL;
if (!DB) {
  console.error('DB_URL not set');
  process.exit(1);
}

const SUPER_ADMIN_EMAIL = (ENV.ADMIN_EMAIL || 'magtangob65@gmail.com').toLowerCase();
const MIGRATED_SELLER_EMAIL = 'jianofreomagtangob@gmail.com'.toLowerCase();

async function run() {
  await mongoose.connect(DB);
  console.log('Connected');

  const admin = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  const jiano = await User.findOne({ email: MIGRATED_SELLER_EMAIL });

  if (!admin) console.log('Admin user not found:', SUPER_ADMIN_EMAIL);
  if (!jiano) console.log('Migrated seller not found:', MIGRATED_SELLER_EMAIL);

  const adminShops = admin ? await Shop.find({ owner: admin._id }).select('_id') : [];
  const jianoShops = jiano ? await Shop.find({ owner: jiano._id }).select('_id') : [];

  const adminShopIds = adminShops.map((s) => s._id);
  const jianoShopIds = jianoShops.map((s) => s._id);

  const adminCount = adminShopIds.length > 0 ? await Product.countDocuments({ shop: { $in: adminShopIds } }) : 0;
  const jianoCount = jianoShopIds.length > 0 ? await Product.countDocuments({ shop: { $in: jianoShopIds } }) : 0;

  console.log('Admin shops:', adminShops.length, 'products:', adminCount);
  console.log('Jiano shops:', jianoShops.length, 'products:', jianoCount);

  // list product ids for jiano shops
  if (jianoShopIds.length > 0) {
    const prods = await Product.find({ shop: { $in: jianoShopIds } }).select('name _id').limit(50);
    console.log('Sample Jiano products:', prods.map(p => ({ id: p._id.toString(), name: p.name })));
  }

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
