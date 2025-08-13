# 🐾 GLENNALLEN PANTHERS NEWSLETTER GENERATOR

Welcome to the most **FIERCE** newsletter generator in the game! This isn't your average school newsletter - this baby has CLAWS! 🖤

## 🚀 Features That Roar

- **Multi-Grade Engine**: Smart content for 6th, 7th, 8th graders
- **AI Visual Arsenal**: DALL-E, Stable Diffusion, and more
- **Dynamic Templates**: Rotating panther themes
- **Multi-Format Output**: HTML, PDF, social snippets
- **Weather-Responsive**: Adapts to Glennallen's mood
- **QR Codes**: Bridge digital and physical

## 🔥 Quick Start

```bash
# Install dependencies (unleash the beast)
npm install

# Generate a sample newsletter
npm run generate

# Development mode (prowl while you code)
npm run dev
```

## 🎯 Environment Variables

Create a `.env` file with your API keys:

```bash
# AI Art Generation
OPENAI_API_KEY=your_key_here
STABILITY_AI_API_KEY=your_key_here
REPLICATE_API_TOKEN=your_key_here

# Stock Images
PEXELS_API_KEY=your_key_here
PIXABAY_API_KEY=your_key_here
UNSPLASH_ACCESS_KEY=your_key_here

# Dynamic Content
GIPHY_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
REDDIT_CLIENT_ID=your_key_here
REDDIT_CLIENT_SECRET=your_key_here

# Weather (for responsive themes)
WEATHER_API_KEY=your_key_here
```

## 📁 Project Structure

```
src/
├── cli.ts              # Command line interface
├── core/
│   ├── NewsletterEngine.ts
│   ├── ImageProvider.ts
│   └── ContentCurator.ts
├── templates/          # Handlebars templates
└── types/             # TypeScript definitions
```

## 🌟 Usage

```bash
# Generate with custom data
npm run generate -- --data my-week.json

# Generate with weather theme
npm run generate -- --weather --location "Glennallen, AK"

# Generate PDF version
npm run generate -- --format pdf
```

## 💪 Panther Philosophy

Every line of code embodies the fierce spirit of the Panthers. We don't just generate newsletters - we craft digital roars that command attention and celebrate student achievements with the intensity they deserve!

**Stay fierce. Stay proud. Stay Panther.** 🐾
