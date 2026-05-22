#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/models/user.model.js';
import { ENV } from '../src/config/env.js';

dotenv.config();
const DB = process.env.DB_URL || ENV.DB_URL;
if (!DB) process.exit(1);

async function run() {
  await mongoose.connect(DB);
  const superEmail = (ENV.ADMIN_EMAIL || 'magtangob65@gmail.com').toLowerCase();
  const admin = await User.findOne({ email: superEmail });
  if (!admin) {
    console.log('Admin user not found for', superEmail);
  } else {
    console.log('Admin user:', { id: admin._id.toString(), email: admin.email, clerkId: admin.clerkId, name: admin.name });
  }
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
