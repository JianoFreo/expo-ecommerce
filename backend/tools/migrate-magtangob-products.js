#!/usr/bin/env node
// One-off migration script to move products from SUPER_ADMIN shops to the migrated seller's shop.
// Usage: NODE_ENV=development node tools/migrate-magtangob-products.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../src/models/product.model.js';
import { Shop } from '../src/models/shop.model.js';
import { User } from '../src/models/user.model.js';
import { ENV } from '../src/config/env.js';

dotenv.config();

const DB = process.env.DB_URL || ENV.DB_URL;
if (!DB) {
  console.error('DB_URL not set in environment');
  process.exit(1);
}

const SUPER_ADMIN_EMAIL = (ENV.ADMIN_EMAIL || 'magtangob65@gmail.com').toLowerCase();
const MIGRATED_SELLER_EMAIL = 'jianofreomagtangob@gmail.com'.toLowerCase();

async function run() {
  try {
    await mongoose.connect(DB);
    console.log('Connected to DB');

    const sourceUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    if (!sourceUser) {
      console.error('Source admin user not found for', SUPER_ADMIN_EMAIL);
      process.exit(1);
    }

    let targetUser = await User.findOne({ email: MIGRATED_SELLER_EMAIL });
    if (!targetUser) {
      // Create a minimal target user so we can create a shop
      console.log('Target migrated seller not found, creating minimal user for', MIGRATED_SELLER_EMAIL);
      targetUser = await User.create({
        name: 'Jiano',
        email: MIGRATED_SELLER_EMAIL,
        clerkId: '',
        addresses: [],
        wishlist: [],
      });
    }

    // Ensure target shop exists
    let targetShop = await Shop.findOne({ owner: targetUser._id });
    if (!targetShop) {
      console.log('Creating target shop for migrated seller');
      targetShop = await Shop.create({ owner: targetUser._id, name: "Jiano's Shop", description: 'Migrated shop' });
    }

    const sourceShops = await Shop.find({ owner: sourceUser._id });
    if (sourceShops.length === 0) {
      console.log('No source shops to migrate');
      process.exit(0);
    }

    const sourceShopIds = sourceShops.map((s) => s._id);
    const result = await Product.updateMany({ shop: { $in: sourceShopIds } }, { shop: targetShop._id });

    // Optionally remove source shops
    await Shop.deleteMany({ _id: { $in: sourceShopIds } });

    console.log('Migration complete. Modified count:', result.modifiedCount);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
