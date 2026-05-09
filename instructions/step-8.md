authentiocation

cd to admin

if you dont have clerk installed run this command

```bash
npm install @clerk/clerk-react
```

remnmove all the uncessary files

dist, assets, app.css and remove all the contents from the app. jsx


also run in the app.jsx rfce( its an extenstion for the react function component)
make sure you have ES7+ react extension installed in your vscode to run the rfce command

go to clerk dash board
copy the step 2 and install the clerk react package in the admin folder

cd admin

npm install @clerk/react


put this on you main.jsx file
```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
);

```

we neeed to use inggest as a webhook to gather the data on the clerk and put it on the mongoDb database 


go to clerk dashboard and configure click on the webhooks and add a new webhook on the developers dropdown

select "Add an Endpoint"
selct inngest

press connect to inngest

then scrooll to the bottom and click on "Create Webhook"

go to subscribed events and select "User Created" and "User Updated"

go to inggest.com and select docs and follow the instrructions to install inngest in the backend folder
cd backend

npm install inngest
