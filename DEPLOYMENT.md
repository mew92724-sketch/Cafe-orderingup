# Deployment to Render - Step-by-Step Guide

## Prerequisites
- GitHub account with the repo pushed
- Render account (free at https://render.com)

## Step 1: Sign up for Render

1. Go to https://render.com
2. Click **Sign up** and authenticate with GitHub
3. Authorize Render to access your repositories

## Step 2: Create a New Web Service

1. In the Render dashboard, click **New +** → **Web Service**
2. Select **Deploy an existing repository** → choose **Cafe-ordering**
3. Click **Connect**

## Step 3: Configure the Service

Fill in the deployment settings:

| Field | Value |
|---|---|
| **Name** | `cafe-ordering` (or any name you prefer) |
| **Environment** | `Python 3` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn --bind 0.0.0.0:$PORT app:app` |

### Environment Variables

Click **Environment** and add:

| Key | Value |
|---|---|
| `SECRET_KEY` | Generate a random string (e.g., `your-secret-key-here`) **(Required - app will not start without it)** |
| `FLASK_ENV` | `production` |

To generate a secure key, you can use:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Step 4: Deploy

1. Click **Create Web Service**
2. Wait for the build to complete (2-3 minutes)
3. Once complete, you'll see a URL like: `https://cafe-ordering.onrender.com`

## Step 5: Test the Live App

1. Open `https://cafe-ordering.onrender.com/owner/signup`
2. Create your first owner account
3. You should see the dashboard with table management

## Step 6: Generate Table QR Codes

1. Sign in to the dashboard
2. Create a table (e.g., "Table 1")
3. Download the QR code
4. Print and place the QR code at the table

## Step 7: Test Table Ordering

1. Scan the QR code with a phone
2. It opens the table ordering page
3. Add items and place an order
4. See the order appear in the owner dashboard

## Step 8: Optional - Update GitHub Pages

Add a redirect from the GitHub Pages site to your live app.

Update `docs/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0; url=https://cafe-ordering.onrender.com/owner/signup" />
  </head>
  <body>
    <p><a href="https://cafe-ordering.onrender.com/owner/signup">Click here to access the Cafe Ordering Portal</a></p>
  </body>
</html>
```

Then commit and push:
```bash
git add docs/index.html
git commit -m "Redirect GitHub Pages to live Render app"
git push origin main
```

Now `https://k89293676-creator.github.io/Cafe-ordering/` redirects to your live app.

## Important Notes

- **Data Storage**: Orders are saved to `orders.json` on the Render instance. Render uses ephemeral storage, so data resets on redeploy.
- **Persistent Database**: For production, add PostgreSQL to Render and update the code to use SQLAlchemy instead of JSON files.
- **Secret Key**: Never commit your `SECRET_KEY`. Always set it via Render's environment variables.

## Troubleshooting

If the app doesn't start:

1. Check the **Logs** tab in Render dashboard
2. Look for error messages
3. Verify `Procfile` and `runtime.txt` are in the repo root
4. Ensure `requirements.txt` includes all imports (Flask, qrcode, gunicorn, Werkzeug)

## Need Help?

- Render docs: https://render.com/docs
- Flask deployment: https://flask.palletsprojects.com/en/latest/deployment/
- Check Render logs for specific errors during deployment
