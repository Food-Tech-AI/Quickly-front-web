# FoodTech Landing Page

A modern, full-featured web application built with Next.js 15, TypeScript, and Tailwind CSS. This application provides a beautiful interface for browsing and managing recipes, with complete backend integration.

## 🚀 Quick Start

**New to this project?** See [QUICK_START.md](./QUICK_START.md) for setup instructions.

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (interactive)
./setup-env.sh

# 3. Start development server
npm run dev
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Setup and getting started guide
- **[API_CONFIG.md](./API_CONFIG.md)** - API configuration and architecture details
- **[API_SETUP.md](./API_SETUP.md)** - Backend integration setup
- **[FRONTEND_README.md](./FRONTEND_README.md)** - Frontend development guide

## ✨ Features

- 🔐 **Authentication**: Secure login with JWT tokens and HttpOnly cookies
- 📖 **Recipe Management**: Browse, search, and view detailed recipes
- 🎨 **Modern UI**: Beautiful gradient designs with smooth animations
- 📱 **Responsive**: Works perfectly on all devices
- ⚡ **Fast**: Built with Next.js 15 for optimal performance
- 🛡️ **Type-Safe**: Full TypeScript support throughout
- 🔄 **Real-time Search**: Instant recipe search with pagination
- 🍳 **Categories**: Filter recipes by categories
- 📊 **Nutrition Info**: Display nutritional information for recipes

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Authentication**: JWT with HttpOnly cookies
- **Image Optimization**: Next.js Image component

## 🎨 Color Palette

- **Primary**: `#40E0D8` (Teal/Turquoise)
- **Secondary**: `#5EBEC4` (Light teal)
- **Accent**: `#FCE283` (Light yellow)
- **Background**: `#FDF9F2` (Cream/off-white)
- **Text**: `#2D2D2D` (Dark gray)

## 🏗 Architecture

This application uses a **proxy pattern** for API communication:

```
Client Components → Next.js API Routes → Backend API
```

### Why This Pattern?

✅ **Security**: Tokens stored in HttpOnly cookies (not accessible to JavaScript)  
✅ **No CORS Issues**: All requests appear to come from the same origin  
✅ **Centralized Error Handling**: Consistent error handling across the app  
✅ **Easy Logging**: Log all requests in one place  
✅ **Environment Agnostic**: Client code doesn't need to know backend URL

## 📁 Project Structure

```
landing-page/
├── app/
│   ├── api/                    # Next.js API routes (proxy to backend)
│   │   ├── login/             # Login endpoint
│   │   ├── logout/            # Logout endpoint
│   │   ├── session/           # Session check
│   │   ├── recipes/           # Recipe endpoints
│   │   └── categories/        # Category endpoints
│   ├── components/            # Reusable React components
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   └── ...
│   ├── login/                 # Login page
│   ├── recipe/                # Recipe pages
│   │   ├── [id]/             # Single recipe detail
│   │   └── page.tsx          # Recipe list
│   ├── myrecipes/            # User's recipes page
│   └── page.tsx              # Home page
├── lib/
│   ├── config.ts             # Centralized configuration
│   ├── axios.ts              # Server-side API client
│   ├── client-api.ts         # Client-side API utilities
│   ├── utils.ts              # Utility functions
│   └── types/                # TypeScript type definitions
│       ├── auth.ts
│       └── recipe.ts
├── .env.local                # Environment variables (create this!)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
└── package.json
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
BACKEND_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
NODE_ENV=development
```

**Note**: The frontend runs on port **3001** by default, backend on **3000**.

### Port Configuration

To run the frontend on a different port:

```bash
npm run dev -- -p 3002
```

## 🎯 Usage Examples

### Making API Calls in Client Components

```typescript
import { api } from '@/lib/client-api';

// Login
const result = await api.login('user@example.com', 'password');

// Get recipes with pagination and search
const recipes = await api.getRecipes({ 
  page: 1, 
  limit: 12, 
  search: 'pasta' 
});

// Get single recipe
const recipe = await api.getRecipeById(123);

// Logout
await api.logout();
```

### Error Handling

```typescript
import { getClientErrorMessage } from '@/lib/client-api';

try {
  const recipes = await api.getRecipes();
  setRecipes(recipes.data);
} catch (error) {
  const message = getClientErrorMessage(error);
  setError(message);
}
```

## 🧪 Testing

Test your backend connection:

```bash
curl http://localhost:3000/health
```

Expected response: `200 OK`

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Update `.env.local` (or your hosting platform's environment settings):

```env
BACKEND_URL=https://api.yourapp.com
NEXT_PUBLIC_BACKEND_URL=https://api.yourapp.com
NODE_ENV=production
```

### Deployment Platforms

This app can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting platform

Make sure to set environment variables in your platform's dashboard.

## 🐛 Troubleshooting

### Issue: API calls fail with CORS errors

**Solution**: Make sure you're using the Next.js API routes. Don't call the backend directly from client components.

### Issue: 401 Unauthorized

**Solution**: 
1. Check you're logged in
2. Verify backend is running
3. Clear cookies and login again

### Issue: Environment variables not updating

**Solution**:
```bash
rm -rf .next
npm run dev
```

### Issue: Can't connect to backend

**Solution**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check `.env.local` has correct `BACKEND_URL`
3. Restart Next.js dev server

## 📝 Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Make sure you're using the centralized config (`lib/config.ts`)
2. All API calls from client components should use `api.*` from `lib/client-api`
3. Never hardcode URLs - use environment variables
4. Follow TypeScript best practices
5. Keep components small and focused

## 📄 License

This project is part of the FoodTech application suite.
