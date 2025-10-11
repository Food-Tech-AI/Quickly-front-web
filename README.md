# Quickly Landing Page

A beautiful, modern landing page built with Next.js 15, TypeScript, and Tailwind CSS, showcasing the Quickly application.

## Features

- ✨ **Modern Design**: Beautiful gradient backgrounds and smooth animations
- 🎨 **Brand Colors**: Uses the exact color palette from the FoodTech mobile app
- 📱 **Responsive**: Fully responsive design that works on all devices
- ⚡ **Performance**: Built with Next.js 15 for optimal performance
- 🎭 **Fake Data**: Pre-populated with mock recipes, testimonials, and features

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Images**: Next.js Image Optimization

## Color Palette

The landing page uses the Quickly brand colors:

- **Primary**: `#40E0D8` (Teal/Turquoise)
- **Secondary**: `#5EBEC4` (Light teal)
- **Accent**: `#FCE283` (Light yellow)
- **Background**: `#FDF9F2` (Cream/off-white)
- **Text**: `#2D2D2D` (Dark gray)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
landing-page/
├── app/
│   ├── components/          # React components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── Hero.tsx        # Hero section
│   │   ├── Features.tsx    # Features showcase
│   │   ├── HowItWorks.tsx  # How it works section
│   │   ├── RecipeShowcase.tsx  # Recipe cards
│   │   ├── Testimonials.tsx    # User testimonials
│   │   ├── CTA.tsx         # Call to action
│   │   └── Footer.tsx      # Footer
│   ├── data/
│   │   └── fakeData.ts     # Mock data for recipes, features, etc.
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── tailwind.config.ts      # Tailwind configuration
├── next.config.ts          # Next.js configuration
└── package.json
```

## Sections

1. **Hero**: Eye-catching gradient header with stats
2. **Features**: Showcase of app capabilities (6 features)
3. **How It Works**: 3-step process visualization
4. **Recipe Showcase**: Grid of 6 featured recipes
5. **Testimonials**: User reviews and ratings
6. **CTA**: Call-to-action for app downloads
7. **Footer**: Links and social media

## Customization

### Adding Real Data

Replace the fake data in `/app/data/fakeData.ts` with real data from your backend API.

### Connecting to Backend

When ready to connect to the backend:

1. Install axios or your preferred HTTP client
2. Create API service files in `/app/services/`
3. Replace static data with API calls
4. Add loading states and error handling

### Modifying Colors

Update colors in `tailwind.config.ts` to match any brand changes.

## Notes

- All data is currently mocked and does NOT connect to the backend
- Images are sourced from Unsplash (recipes) and Pravatar (avatars)
- Smooth scroll behavior is enabled for navigation links
- All buttons and links are non-functional (design only)

## License

This project is part of the Quickly application suite.
# Quickly-front-web
