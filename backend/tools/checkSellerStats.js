import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../src/config/db.js';
import mongoose from 'mongoose';
import { Shop } from '../src/models/shop.model.js';
import { Product } from '../src/models/product.model.js';
import { Order } from '../src/models/order.model.js';
import { User } from '../src/models/user.model.js';

const SUPER_ADMIN_EMAIL = 'magtangob65@gmail.com'.toLowerCase();
const MIGRATED_SELLER_EMAIL = 'jianofreomagtangob@gmail.com'.toLowerCase();

async function run() {
  await connectDB();

  // find seller user
  const sellerUser = await User.findOne({ email: MIGRATED_SELLER_EMAIL });
  if (!sellerUser) {
    console.log('Seller user not found:', MIGRATED_SELLER_EMAIL);
  }

  // get shop ids same as server logic
  let shopIds = [];
  if (sellerUser) {
    const ownShops = await Shop.find({ owner: sellerUser._id }).select('_id');
    if (ownShops.length > 0) shopIds = ownShops.map((s) => s._id);
  }

  if (shopIds.length === 0) {
    const adminUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    if (adminUser) {
      const adminShops = await Shop.find({ owner: adminUser._id }).select('_id');
      shopIds = adminShops.map((s) => s._id);
    }
  }

  console.log('Found shops for seller:', shopIds.map((s) => s.toString()));

  const products = await Product.find({ shop: { $in: shopIds } }).select('_id');
  const productIds = products.map((p) => p._id);
  console.log('Product count:', productIds.length);

  const orders = await Order.find({ 'orderItems.product': { $in: productIds } });
  console.log('Orders matching product ids:', orders.length);

  let totalItemsSold = 0;
  for (const order of orders) {
    for (const item of order.orderItems) {
      const itemProductId = item.product?._id?.toString?.() || (typeof item.product === 'string' ? item.product : item.product?.toString?.());
      if (itemProductId && productIds.some((id) => id.toString() === itemProductId)) {
        totalItemsSold += Number(item.quantity || 0);
      }
    }
  }

  console.log('Total items sold (including pending):', totalItemsSold);

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
