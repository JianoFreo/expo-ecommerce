import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

// clerk and JWT are both authentication methods. 
// Clerk is a third-party service that provides user authentication and management, 
// while JWT (JSON Web Tokens) is a standard for securely 
// transmitting information between parties as a JSON object. 
// In this code, we are using Clerk's `requireAuth` middleware to 
// protect our routes and ensure that only authenticated users can access them. 
// The `protectRoute` middleware checks if the user is authenticated using Clerk and then 
// verifies if the user exists in our database before allowing access to the protected route.

export const protectRoute = [ ///============================important : is is the function that builds req.user object =====================================================
    /* `requireAuth()` is a middleware function provided by Clerk that is used for authentication in
    the context of this code. When `requireAuth()` is called within a route handler, it checks if
    the incoming request is authenticated. If the request is authenticated, it allows the request to
    proceed to the next middleware or route handler. If the request is not authenticated, it
    typically responds with a 401 status code indicating unauthorized access. */
    requireAuth(),
    async (req, res, next) => {
        try {
            const clerkId = req.auth.userId; //"Is the request authenticated?"
            if (!clerkId) return res.status(401).json({ message: "Unauthorized -  invalid token" });

            let user = await User.findOne({ clerkId }); //"Does this authenticated user exist in OUR database?"
            // If the user does not exist in our DB yet, create a minimal record so
            // protected routes don't block first-time sign-ins when the Inngest
            // webhook (or other user-sync) isn't running. This lets sellers create
            // a shop immediately after signing in from the frontend.
            if (!user) {
                user = await User.create({
                    clerkId,
                    email: "",
                    name: "User",
                    imageUrl: "",
                    addresses: [],
                    wishlist: [],
                });
            }

            // Check if user is banned
            if (user.isBanned) {
                return res.status(403).json({ message: "Your account has been banned. Reason: " + (user.bannedReason || "No reason provided") });
            }

            req.user = user; 
            //This is a property you manually attach to the request object:
            // "If the user exists, attach the user object to the 
            // request and move on to the next middleware or route handler."
            next();
        } catch (error) {
            console.error("Error in protectRoute middleware:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }]
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - user not authenticated" });
    }
    const adminEmail = (ENV.ADMIN_EMAIL || "magtangob65@gmail.com").toLowerCase();
    const currentEmail = (req.user.email || "").toLowerCase();

    if (currentEmail !== adminEmail) { 
        // that’s why adminOnly must be used AFTER protectRoute.
        // if the protectRoute middleware is not used before adminOnly, 
        // then req.user will be undefined and 
        // we will get an error when we try to access req.user.email.
        return res.status(403).json({ message: "Forbidden - admin access only" });
    }
    next(); // mean user is admin / authorized
}
export const superAdminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - user not authenticated" });
    }
    const superAdminEmail = "magtangob65@gmail.com".toLowerCase();
    const currentEmail = (req.user.email || "").toLowerCase();

    if (currentEmail !== superAdminEmail) {
        return res.status(403).json({ message: "Forbidden - super admin access only" });
    }
    next();
}