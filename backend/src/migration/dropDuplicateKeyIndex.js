import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

async function fixOrderIndex() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✓ Connected to MongoDB");

    const ordersCollection = mongoose.connection.collection("orders");

    // Get current indexes
    const indexes = await ordersCollection.getIndexes();
    console.log("\n📊 Current indexes:");
    console.log(indexes);

    // Check if clerkId_1 unique index exists
    if (indexes.clerkId_1) {
      console.log("\n⚠️  Found unique index on clerkId. Dropping it...");
      await ordersCollection.dropIndex("clerkId_1");
      console.log("✓ Dropped unique index on clerkId");
    }

    // Create a non-unique index on clerkId for faster queries
    console.log("\n📝 Creating non-unique index on clerkId...");
    await ordersCollection.createIndex({ clerkId: 1 });
    console.log("✓ Created non-unique index on clerkId");

    // Verify new indexes
    const newIndexes = await ordersCollection.getIndexes();
    console.log("\n✅ Updated indexes:");
    console.log(newIndexes);

    console.log("\n✓ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

fixOrderIndex();
