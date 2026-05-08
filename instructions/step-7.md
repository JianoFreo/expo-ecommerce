install cloudinary

cloudinary is a cloud-based service that provides an end-to-end image and video management solution, including uploads, storage, manipulations, optimizations, and delivery. It offers a powerful API and a user-friendly dashboard for developers and businesses to manage their media assets efficiently.


because we will be uploading images to cloudinary from our backend, we need to install the cloudinary package in our backend project.


aftter logging in cloudinary , go to setting - api key - genereate a new api key and secret and add it to your backend .env file as shown below
for the cloud name -- go to home and you can see the cloud name under product envirenment section
then paste the following in your backend/.env file as CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET and CLOUDINARY_CLOUD_NAME



make a cloudinary file under config folder

then install cloudinary package in the backend

```bash
cd backend
```

```bash 
npm install cloudinary@2.8.0
```
or you can just install them withouit specifying the version and it will install the latest version of cloudinary package

```bash
npm install cloudinary
```

then add the following code to the cloudinary.js file we created under config folder

```javascript