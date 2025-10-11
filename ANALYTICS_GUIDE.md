# 📊 Analytics Tracking Guide for Quickly Landing Page

## What's Being Tracked

Your landing page now tracks all user interactions automatically! Here's what you can see:

### 📈 Automatic Metrics (Vercel Analytics)
- **Page Views** - How many people visit the landing page
- **Unique Visitors** - Number of unique users
- **Bounce Rate** - How many leave without interacting
- **Average Time on Page** - How long people stay
- **Device Types** - Mobile, tablet, or desktop
- **Geographic Location** - Where visitors are from

### 🔘 Button Click Tracking

We've added custom event tracking for all key buttons:

#### **Hero Section**
- `Download App Clicked` - Main CTA in hero
- `Watch Demo Clicked` - Demo video button

#### **Grocery Shopping Section**
- `Go Shopping Button Clicked` - With data:
  - `items_remaining` - How many items left
  - `items_checked` - How many items checked off
  - `total_items` - Total items in cart
- `Start Shopping Smarter Clicked` - Secondary CTA

#### **CTA Section**
- `Download iOS Clicked` - iOS download button
- `Download Android Clicked` - Android download button

---

## How to View Analytics

### Option 1: Vercel Dashboard (Recommended)

1. **Deploy to Vercel** (free):
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **View Analytics**:
   - Go to https://vercel.com/dashboard
   - Click on your project
   - Click "Analytics" tab
   - See all metrics and custom events!

### Option 2: Google Analytics (Optional)

If you want more detailed analytics, you can also add Google Analytics:

1. Get your GA4 Measurement ID from Google Analytics
2. Install the package:
   ```bash
   npm install @next/third-parties
   ```
3. Add to your layout.tsx:
   ```tsx
   import { GoogleAnalytics } from '@next/third-parties/google'
   
   // In the body:
   <GoogleAnalytics gaId="G-XXXXXXXXXX" />
   ```

---

## 📊 What You Can Learn

### User Behavior
- Which buttons are most clicked?
- Do people prefer iOS or Android?
- Are people engaging with the grocery cart feature?
- Where do most people drop off?

### Conversion Tracking
- How many visitors click "Download App"?
- Conversion rate from landing page to app store
- Which section drives the most downloads?

### A/B Testing Ideas
- Test different button colors
- Try different headlines
- Compare button placements
- Test different images

---

## Example Analytics Questions You Can Answer

✅ **"How many people launch the app?"**
- See "Download App Clicked" events
- Track by location: hero vs CTA section

✅ **"How many click 'Go Shopping at Your Store'?"**
- See "Go Shopping Button Clicked" events
- View how many items they checked off first

✅ **"Which platform do users prefer?"**
- Compare "Download iOS" vs "Download Android" clicks

✅ **"Are people engaging with features?"**
- Track checkbox interactions
- See button click rates

---

## Next Steps

1. **Deploy to Vercel** to activate analytics
2. **Wait 24 hours** for data to accumulate
3. **Check your dashboard** at https://vercel.com
4. **Optimize** based on what you learn!

---

## 💡 Pro Tips

- **Set up conversion goals** in your analytics dashboard
- **Add UTM parameters** to marketing links to track campaigns
- **Export data** regularly to track trends over time
- **Monitor bounce rate** - aim for under 50%
- **Track time to first click** - optimize above-the-fold content

---

## Need Help?

The analytics are now live and tracking! Just deploy to Vercel and you'll see all the data in your dashboard.

