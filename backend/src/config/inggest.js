// src/inngest/client.ts

import { Inngest } from "inngest";
import { connectDB } from "./db";
import User from "../models/User";

export const inngest = new Inngest({ id: "ecommerce-app" });

export const syncUser = inngest.createFunction(
    { id: "sync-user" },
    { event: "clerk/user.created" },

    async ({ event }) => {
        // The event variable comes from Inngest itself.
        // When this runs:
        // inngest.createFunction(...)
        // Inngest automatically calls your function and passes an object containing the event data.
        await connectDB();

        const { // const data = event.data;
            id,
            email_addresses,
            first_name,
            last_name,
            image_url,
        } = event.data;

        const newUser = {
            clerkId: id,
            email: email_addresses[0]?.email_address,
            name: `${first_name || ""} ${last_name || ""}` || "User",
            imageUrl: image_url,
            addresses: [],
            wishlist: [],
        };

        await User.create(newUser);
    }
);

const deleteUserFromDB = inngest.createFunction(
    { id: "delete-user-from-db" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
        await connectDB();

        const { id } = event.data; //“Get the Clerk user ID from the webhook payload.”
        await User.deleteOne({ clerkId: id });
    }
);

export const functions = [syncUser, deleteUserFromDB];