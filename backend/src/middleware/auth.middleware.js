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
                // Attempt to fetch fuller profile from Clerk if we have a secret key.
                let email = "";
                let name = "User";
                let imageUrl = "";

                try {
                    if (ENV.CLERK_SECRET_KEY) {
                        const resp = await fetch(`https://api.clerk.dev/v1/users/${clerkId}`, {
                            headers: { Authorization: `Bearer ${ENV.CLERK_SECRET_KEY}` },
                        });
                        if (resp.ok) {
                            const data = await resp.json();
                            email = data.email_addresses?.[0]?.email_address || "";
                            name = (data.first_name || "") + (data.last_name ? ` ${data.last_name}` : "") || data.full_name || name;
                            imageUrl = data.image_url || "";
                        }
                    }
                } catch (err) {
                    console.warn("Clerk lookup failed, continuing with minimal user:", err?.message || err);
                }

                user = await User.create({
                    clerkId,
                    email,
                    name,
                    imageUrl,
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
    // adminOnly is now an alias for superAdminOnly (backwards compatibility for web admin routes)
    const superAdminEmail = (ENV.ADMIN_EMAIL || "magtangob65@gmail.com").toLowerCase();
    const currentEmail = (req.user.email || "").toLowerCase();

    if (currentEmail !== superAdminEmail) {
        return res.status(403).json({ message: "Forbidden - admin access only" });
    }
    next(); // mean user is admin / authorized
}

export const sellerOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - user not authenticated" });
    }
    // Sellers, legacy admins, and super-admins can access seller endpoints
    if (req.user.role !== 'seller' && req.user.role !== 'admin' && req.user.role !== 'super-admin') {
        return res.status(403).json({ message: "Forbidden - seller access required" });
    }
    next();
}

export const superAdminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized - user not authenticated" });
    }
    const superAdminEmail = (ENV.ADMIN_EMAIL || "magtangob65@gmail.com").toLowerCase();
    const currentEmail = (req.user.email || "").toLowerCase();

    if (currentEmail !== superAdminEmail) {
        return res.status(403).json({ message: "Forbidden - super admin access only" });
    }
    next();
}
