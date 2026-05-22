#!/usr/bin/env node
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from '../src/models/user.model.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.DB_URL);
  const result = await User.updateOne(
    { email: 'jianofreomagtangob@gmail.com' },
    { $set: { role: 'seller' } }
  );

  const updated = await User.findOne({ email: 'jianofreomagtangob@gmail.com' }).select('email role clerkId name');
  console.log(JSON.stringify({ modifiedCount: result.modifiedCount, matchedCount: result.matchedCount, updated }, null, 2));
  await mongoose.disconnect();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
