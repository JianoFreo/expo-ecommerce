import express from 'express';
import path from 'path';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express';


import { serve } from 'inngest/express';
import { functions, inngest } from './config/inngest.js';

import adminRoutes from './routes/admin.route.js';


const app = express();
const __dirname = path.resolve();

/* `app.use(express.json())` is setting up middleware in Express to parse incoming requests with JSON
payloads. This middleware will parse the request body and make it available under `req.body` in your
route handlers. This is commonly used when working with APIs that send data in JSON format. */
app.use(express.json())
//=================================middlewares=================================
app.use(clerkMiddleware()); // Clerk middleware to handle authentication and user management// req.auth
//adds auth objkect under the request object


//=================================middlewares=================================
app.use("/api/inngest", serve({ client: inngest, functions }));

app.use("/api/admin", adminRoutes)
















app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy' });
  console.log("Health check endpoint hit");
});




// make our app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../admin/dist"))) // dirname means “the current folder this file is inside”.
  // express.static() is middleware that tells Express:
  // “Serve files from this folder directly to the browser.”


  app.get("/{*any}", (req, res) => { // if its on any routes exept api routes
    res.sendFile(path.join(__dirname, "../admin/dist", "index.html"));
    //path.join is used to join the path of the dist folder and index.html file
    //Instead of:
    //__dirname + "/admin/dist"
    //we use:
    //path.join(__dirname, "admin", "dist")

    //sendFile() is an Express method used to send an actual file to the browser.
  });
}

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log("Server is up and running");
  });
};


startServer();