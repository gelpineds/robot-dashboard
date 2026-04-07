# Frontend Tech Stack

## Core Technologies

### Framework & Build
- **React 18.3.1** - UI library for building interactive components
- **Vite 5.4.19** - Modern build tool and dev server (fast HMR and bundling)
- **TypeScript 5.8.3** - Type safety and better developer experience

### Routing
- **React Router DOM 6.30.1** - Client-side routing and navigation

### State Management & Data
- **TanStack React Query 5.83.0** - Server state management and API caching
- **React Hook Form 7.61.1** - Efficient form state management
- **Zod 3.25.76** - Schema validation for forms and API responses

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Unstyled, accessible UI components
- **Lucide React** - Icon library
- **Framer Motion 11.0.0** - Animation library

### Data Visualization
- **Recharts 2.15.4** - Charts and visualization components

### Development & Testing
- **Vitest 3.2.4** - Unit and component testing
- **Playwright 1.57.0** - End-to-end testing
- **ESLint** - Code linting and quality

## Project Structure
```
frontend/
├── src/
│   ├── pages/          # Page components
│   ├── App.jsx         # Root component with routing
│   ├── main.jsx        # React entry point
│   └── assets/         # Images and static files
├── package.json        # Dependencies
└── vite.config.js      # Vite configuration
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm lint
```
