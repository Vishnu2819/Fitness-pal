# Fitness Pal

A macro calculator. Enter your stats and goal, and it works out your daily calories, a protein/carb/fat split, a meal-by-meal plan and a projected timeline to your target weight.

**Live demo:** https://vishnu2819.github.io/Fitness-pal/

## What it does

- **Calories:** BMR from Mifflin-St Jeor, or Katch-McArdle when you enter a body-fat %, times an activity factor to get maintenance (TDEE), then a deficit or surplus based on your weekly pace (about 7,700 kcal per kg).
- **Safety checks:** it never goes below 1,200 kcal (women) or 1,500 kcal (men), and it warns about aggressive deficits, fast bulks, a target weight that contradicts the goal, and under-18 users.
- **Macros:** five diet styles (balanced, high protein, low carb, keto, or custom sliders). Protein is set in g/kg and is based on lean mass when body fat is known.
- **Meal plan:** splits the day across 2–6 meals, with snacks weighted at half a meal.
- **Timeline:** a weekly weight projection with your goal line, plus weeks-to-target.
- **Extras:** BMI, water and fiber targets, lean mass.
- **Convenience:** switching between imperial and metric converts the values already entered. Inputs are saved to `localStorage`, and **Share this plan** copies a link that recreates your inputs.
- **Accessible and responsive:** labelled controls, radio-group semantics for toggles, a text alternative on each chart, and automatic dark mode.

## Tech

React 18 · TypeScript · Vite · Vitest · ESLint, with no UI libraries. The charts are hand-written SVG.

All the math is in [`src/lib/calc.ts`](src/lib/calc.ts) as pure functions with unit tests in [`src/lib/calc.test.ts`](src/lib/calc.test.ts). Form parsing, validation and unit conversion are in [`src/lib/state.ts`](src/lib/state.ts).

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests
npm run build    # production build in ./dist
```

## Deploy

Every push to `main` runs lint, tests and the build in GitHub Actions, then publishes `dist/` to GitHub Pages (`.github/workflows/deploy.yml`).

---

*These are estimates from standard formulas, not medical advice.*
