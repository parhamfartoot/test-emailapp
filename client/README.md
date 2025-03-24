# Earth Promise App - Netlify Deployment

This document outlines the steps to deploy this application on Netlify.

## Preparation

1. **Create a Netlify Account**
   - Sign up at [netlify.com](https://www.netlify.com/) if you don't have an account

2. **Install Dependencies**
   - Make sure all dependencies are installed:
     ```
     npm install
     ```

3. **Generate Hashed Admin Password**
   - Run the password hashing script to generate a secure password hash:
     ```
     node functions/hash-password.js
     ```
   - Copy the generated hash for use in your Netlify environment variables

## Deployment Steps

1. **Push your code to GitHub**
   - Create a new GitHub repository
   - Push your code to the repository

2. **Connect to Netlify**
   - Log in to Netlify
   - Click "New site from Git"
   - Select GitHub as your Git provider
   - Authorize Netlify to access your GitHub account
   - Select the repository with your code

3. **Configure Build Settings**
   - Set the build command to: `npm run build:prod`
   - Set the publish directory to: `build`
   - Click "Show advanced" and add the following environment variables:

     | Key | Value |
     |-----|-------|
     | MONGODB_URI | mongodb+srv://promisetotheearth:GbCsxU4VFpzPyizX@cluster0.ar6tf.mongodb.net/earth-promises?retryWrites=true&w=majority |
     | EMAIL_USER | promisetotheearth@gmail.com |
     | EMAIL_APP_PASSWORD | wips rbku ztdh obly |
     | JWT_SECRET | eWm9VHTuPqJ7z6X9n5TgK3LsCvBxA2F8dR4E5Y3pQaS |
     | ADMIN_USERNAME | adminEarthPromise2024 |
     | ADMIN_PASSWORD_HASH | (use the hash generated in step 3 of Preparation) |

4. **Deploy the Site**
   - Click "Deploy site"
   - Wait for the build to complete

5. **Set Up Scheduled Functions** (Optional)
   - To enable automatic email reminders, set up a scheduled function trigger in Netlify:
     - Go to Site settings > Functions
     - Click "Add scheduled function"
     - Set the path to: `/emails`
     - Set a cron schedule (e.g., `0 0 * * *` for daily at midnight)

## Testing

After deployment, verify the following:

1. Visit your deployed site
2. Test submitting a new pledge
3. Test admin login functionality
4. Test email functionality if possible

## Troubleshooting

If you encounter issues:

1. Check the Netlify function logs in the Netlify dashboard
2. Verify all environment variables are set correctly
3. Make sure MongoDB Atlas IP access is configured to allow connections from any IP

## Local Development

For local development:

```
npm install
npm run dev
```

This will start the Netlify development server which emulates the production environment locally. 