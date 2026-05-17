import express from 'express';
import path from 'path';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express';


import { serve } from 'inngest/express';
import { functions, inngest } from './config/inngest.js';

import adminRoutes from './routes/admin.route.js'; // the name "adminRoutes" can be anything, it is just a variable name that we are importing the default export from the admin.route.js file
import userRoutes from './routes/user.route.js';
import orderRoutes from './routes/order.route.js';


const app = express();
const __dirname = path.resolve();
//=================================parsing incoming requests with JSON payloads======================
/* `app.use(express.json())` is setting up middleware in Express to parse incoming requests with JSON
payloads. This middleware will parse the request body and make it available under `req.body` in your
route handlers. This is commonly used when working with APIs that send data in JSON format. */
app.use(express.json())
//=================================middlewares=================================
// Clerk middleware to handle authentication and user management// req.auth
//adds auth objkect under the request object
app.use(clerkMiddleware()); 


//=================================middlewares=================================
/* The line `app.use("/api/inngest", serve({ client: inngest, functions }));` is setting up a
middleware in Express that serves the Inngest client and functions under the `/api/inngest`
endpoint. */
app.use("/api/inngest", serve({ client: inngest, functions }));
//===============================================================================


//===============================health check test endpoint=====================
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
  console.log("Health check endpoint hit");
});
//==============================================================================


//=================================routes folder=================================
app.use("/api/admin", adminRoutes)
app.use("/api/users", userRoutes)
app.use("/api/orders", orderRoutes)
//===============================================================================


//=================================deployment setup=================================
// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist"))) // dirname means “the current folder this file is inside”.
  // express.static() is middleware that tells Express:
  // “Serve files from this folder directly to the browser.”


  app.get("/{*any}", (_, res) => { // if its on any routes exept api routes
    res.sendFile(path.join(__dirname, "../admin/dist", "index.html"));
    //path.join is used to join the path of the dist folder and index.html file
    //Instead of:
    //__dirname + "/admin/dist"
    //we use:
    //path.join(__dirname, "admin", "dist")

    //sendFile() is an Express method used to send an actual file to the browser.
  });
}
//===============================================================================


//===============================start the server=================================
const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`Server is up and running on http://localhost:${ENV.PORT}`);
    console.log("NODE_ENV:", ENV.NODE_ENV);
  });
};


startServer();
//===============================================================================