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