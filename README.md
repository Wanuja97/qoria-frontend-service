# Next.js Application Setup 

A Next.js frontend application for the dashboard interface.

## Prerequisites

- Node.js 
- npm package manager

## Quick Start

### Step 1: Clone the Application
```bash
git clone [your-repository-url]
cd [project-directory]
```

### Step 2: Environment Configuration
Create a `.env` file in the root directory and add the following variable:

```env
NEXT_PUBLIC_API_URL
```
**Example:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Development Mode
To run the application in development mode:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Step 5: Production Build and Run
To build and run the application for production:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API base URL
  - Development: `http://localhost:8080/api/v1`
  - Production: Update with your production API URL

## Available Scripts

- `npm run dev` - Starts development server
- `npm run build` - Creates production build
- `npm run start` - Starts production server
- `npm run lint` - Runs ESLint

## Support

For additional support or questions, please reach out to me through `wanuja18@gmail.com`.
