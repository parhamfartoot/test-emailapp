# Deployment Guide for Earth Promises

This guide will walk you through deploying the Earth Promises application to a production environment.

## Prerequisites

- A hosting service account (see recommended options below)
- A domain name (optional but recommended)
- Node.js installed on your local machine
- Git (optional, but recommended for deployment)

## Recommended Hosting Options

For beginners, these platforms offer the easiest deployment experience:

1. **Vercel** - Great for React apps (client)
2. **Netlify** - Another excellent option for the client
3. **Render** - Good for hosting both client and server
4. **Heroku** - Easy to use for Node.js applications (server)
5. **MongoDB Atlas** - Already being used for database hosting

## Step 1: Prepare Your Application for Deployment

### 1.1 Update Environment Variables

1. In the client directory:
   - Modify the `build:prod` script in `package.json` to use your actual server domain
   - Example: `"build:prod": "cross-env REACT_APP_API_URL=https://your-api-domain.com react-scripts build"`

2. In the server directory:
   - Create a `.env` file based on `.env.example` for your production environment
   - Update the `corsOptions` in `server.js` with your actual client domain

### 1.2 Build the Client

```bash
cd client
npm run build:prod  # Creates optimized production build in the build/ folder
```

## Step 2: Deploy the Client (React Application)

### Using Vercel (Recommended for Beginners)

1. Sign up for a free account at [vercel.com](https://vercel.com)
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Navigate to your client directory and run:
   ```bash
   cd client
   vercel login
   vercel
   ```
4. Follow the prompts to complete deployment

### Using Netlify

1. Sign up for a free account at [netlify.com](https://netlify.com)
2. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
3. Navigate to your client directory and run:
   ```bash
   cd client
   netlify login
   netlify deploy
   ```
4. For production deployment:
   ```bash
   netlify deploy --prod
   ```

## Step 3: Deploy the Server (Node.js Application)

### Using Render

1. Sign up for a free account at [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository or upload your code
4. Configure the service:
   - Build Command: `npm install`
   - Start Command: `npm run start:prod`
   - Add all environment variables from your `.env` file

### Using Heroku

1. Sign up for a free account at [heroku.com](https://heroku.com)
2. Install the Heroku CLI:
   ```bash
   npm install -g heroku
   ```
3. Navigate to your server directory and run:
   ```bash
   cd server
   heroku login
   heroku create
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```
4. Set up environment variables:
   ```bash
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_APP_PASSWORD=your-app-password
   # Add all other variables from .env
   ```

## Step 4: Connect Your Domain (Optional)

If you have a custom domain name:

1. For Vercel or Netlify: Add your domain in the dashboard settings
2. Configure DNS settings with your domain registrar
3. Set up SSL certificates (usually automatic with these services)

## Step 5: Test Your Deployed Application

1. Visit your deployed client application
2. Test all features (form submission, viewing promises, admin login)
3. Check for any errors in the browser console

## Troubleshooting

- If the client can't connect to the server, verify your API_BASE_URL and CORS settings
- For database issues, check your MongoDB Atlas connection string and network access settings
- Verify that all environment variables are correctly set on your hosting provider

## Maintenance

- Set up monitoring for your application (Render and Heroku provide basic monitoring)
- Create a backup schedule for your MongoDB database
- Consider setting up CI/CD for automated deployments

# Earth Promises Deployment Guide (Render.com)

This guide will help you deploy your application to Render.com, which allows deploying both the frontend and backend services.

## Prerequisites

1. Create a [Render account](https://render.com/)
2. Have your codebase ready in a Git repository (GitHub, GitLab, etc.)

## Step 1: Deploy the Backend (API)

1. In your Render dashboard, click "New" and select "Web Service"
2. Connect your Git repository
3. Configure the service:
   - **Name**: `earth-promises-api` (or any name you prefer)
   - **Runtime**: `Node`
   - **Root Directory**: `server` (if your repo has both client and server folders)
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Free (or select appropriate plan)

4. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` (Render requires this specific port)
   - `EMAIL_USER`: [Your email]
   - `EMAIL_APP_PASSWORD`: [Your app password]
   - `MONGODB_URI`: [Your MongoDB connection string]
   - `JWT_SECRET`: [Your JWT secret]
   - `ADMIN_USERNAME`: [Your admin username]
   - `ADMIN_PASSWORD`: [Your admin password]
   - `CLIENT_DOMAIN`: [Will add after frontend deployment]

5. Click "Create Web Service"
6. Wait for the deployment to complete and note the URL (e.g., `https://earth-promises-api.onrender.com`)

## Step 2: Deploy the Frontend (Client)

1. In your Render dashboard, click "New" and select "Static Site"
2. Connect your Git repository
3. Configure the service:
   - **Name**: `earth-promises-client` (or any name you prefer)
   - **Root Directory**: `client` (if your repo has both client and server folders)
   - **Build Command**: `npm install && npm run build:prod`
   - **Publish Directory**: `build`

4. Add the following environment variable:
   - `REACT_APP_API_URL`: [Your backend URL from Step 1]

5. Click "Create Static Site"
6. Wait for the deployment to complete and note the URL (e.g., `https://earth-promises-client.onrender.com`)

## Step 3: Update CORS Configuration

1. Go back to your backend service in Render dashboard
2. Add the `CLIENT_DOMAIN` environment variable with your frontend URL
3. Trigger a redeploy of the backend service

## Step 4: Verify Deployment

1. Visit your frontend URL in a browser
2. Test the functionality to ensure the frontend can communicate with the backend
3. Check for any errors in the browser console

## Troubleshooting

If you encounter issues:

1. Check Render logs for both services
2. Verify environment variables are set correctly
3. Test CORS configuration by making a test API request
4. Ensure MongoDB is accessible from Render

## Maintenance

For future updates:
1. Push changes to your Git repository
2. Render will automatically rebuild and deploy your services 