import mongoose from "mongoose";
import dotenv from "dotenv";
import { Order } from "../models/order.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

async function removeDuplicateOrders() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    // Find orders with duplicate clerkIds and keep only the most recent one
    const duplicates = await Order.aggregate([
      {
        $group: {
          _id: "$clerkId",
          count: { $sum: 1 },
          orders: { $push: "$$ROOT" },
          maxCreatedAt: { $max: "$createdAt" },
        },
      },
      {
        $match: { count: { $gt: 1 } },
      },
    ]);

    console.log(`\n📊 Found ${duplicates.length} clerkIds with duplicate orders`);

    for (const dup of duplicates) {
      console.log(`\n🔍 Processing clerkId: ${dup._id} (${dup.count} orders)`);

      // Keep the most recent order, delete others
      const ordersToDelete = dup.orders.filter(
        (order) => order.createdAt.getTime() !== dup.maxCreatedAt.getTime()
      );

      console.log(`  - Keeping: ${dup.maxCreatedAt}`);
      console.log(`  - Deleting ${ordersToDelete.length} old order(s)`);

      for (const order of ordersToDelete) {
        await Order.deleteOne({ _id: order._id });
        console.log(`    ✓ Deleted order ${order._id}`);
      }
    }

    console.log("\n✅ Duplicate removal completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

removeDuplicateOrders();
