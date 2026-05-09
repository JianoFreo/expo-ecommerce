/* This JavaScript code snippet is importing the `v2` module from the `cloudinary` library and
assigning it an alias `cloudinary`. It also imports an object named `ENV` from a local file named
`env.js`. */
import { v2 as cloudinary } from "cloudinary"

import { ENV } from "./env.js"

cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET
})

export default cloudinary
// whenver we want to upload or delete images. we would be using this object from our code base


//By passing this configuration we are able to use are cloudinary account
// we are able to upload images to which will be visible on the media libary
