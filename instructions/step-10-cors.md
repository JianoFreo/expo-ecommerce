install cors package
```bash
cd backend
npm install cors
```

Then, in `backend/src/app.js`, add the following code:

```javascript
import cors from "cors";

// add this before your routes
app.use(cors({
    origin: process.env.CLIENT_URL
    credentials: true
}));    
``` 
on your env vairables, add the following:
```env
# cors
# development
CLIENT_URL=the url of your frontend, e.g. http://localhost:5173 or http://myapp.com
``` 
