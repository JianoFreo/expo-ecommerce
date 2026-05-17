go to tailwindcss.com
click on "Get Started" on docs
make sure u use vite as your build tool

then, follow the instructions to install tailwindcss in your frontend project.
Install Tailwind CSS
Install tailwindcss and @tailwindcss/vite via npm.

Terminal
```bash
npm install tailwindcss @tailwindcss/vite
```
Configure the Vite plugin
Add the @tailwindcss/vite plugin to your Vite configuration.

vite.config.ts
```js
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
})
```

Import Tailwind CSS
Add an @import to your CSS file that imports Tailwind CSS.

CSS
```javascript
@import "tailwindcss";
```