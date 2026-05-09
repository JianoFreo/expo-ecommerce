import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import { User } from "../models/user.model.js";

export const inngest = new Inngest({ id: "ecommerce-app" });

export const syncUser = inngest.createFunction(
    {
        id: "sync-user",
        triggers: [{ event: "clerk/user.created" }],
    },

    async ({ event }) => {
         // The event variable comes from Inngest itself.
        // When this runs:
        // inngest.createFunction(...)
        // Inngest automatically calls your function and passes an object containing the event data.
        await connectDB();

        const {
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
    {
        id: "delete-user-from-db",
        triggers: [{ event: "clerk/user.deleted" }],
    },

    async ({ event }) => {
        await connectDB();

        const { id } = event.data;

        await User.deleteOne({ clerkId: id });
    }
);

export const functions = [syncUser, deleteUserFromDB];




///========= Old code ===========
// this one is fr the older version of inngest that doesnt work any more
// the older sytax uses triggers: [{ event: "clerk/user.created" }] instead of { event: "clerk/user.created" } directly in the createFunction options. The newer version allows for a more concise syntax, while the older version requires the triggers array to specify the events that should trigger the function.
// but the newer version is more straightforward and easier to read, as it eliminates the need for an additional array and nested object structure. The older version can be more verbose and less intuitive, especially for simple use cases where only one event is being listened to.

/*
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

export const functions = [syncUser, deleteUserFromDB]; */
