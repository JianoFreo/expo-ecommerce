import { requireAuth } from "@clerk/clerk-sdk-node";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.config.js";

// clerk and JWT are both authentication methods. 
// Clerk is a third-party service that provides user authentication and management, 
// while JWT (JSON Web Tokens) is a standard for securely 
// transmitting information between parties as a JSON object. 
// In this code, we are using Clerk's `requireAuth` middleware to 
// protect our routes and ensure that only authenticated users can access them. 
// The `protectRoute` middleware checks if the user is authenticated using Clerk and then 
// verifies if the user exists in our database before allowing access to the protected route.

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const clerkId = req.auth.userId; //"Is the request authenticated?"
            if (!clerkId) return res.status(401).json({ message: "Unauthorized -  invalid token" });

            const user = await User.findOne({ clerkId }); //"Does this authenticated user exist in OUR database?"
            if (!user) return res.status(404).json({ message: "User not found - user not found" });

            req.user = user;
            // "If the user exists, attach the user object to the 
            // request and move on to the next middleware or route handler."
            next();
        } catch (error) {
            console.error("Error in protectRoute middleware:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }]