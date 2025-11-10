# Frontend Application

A modern React 18 application built with Vite, TypeScript, and Tailwind CSS.

## Features

- ⚡ Vite for fast development and building
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🚦 React Router for navigation
- 🔄 Axios for API communication
- 🪝 Zustand for state management
- 🧪 ESLint and Prettier for code quality
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API services
├── types/         # TypeScript type definitions
├── state/         # State management (Zustand)
├── App.tsx        # Main app component
├── main.tsx       # Application entry point
└── index.css      # Global styles
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Frontend App
VITE_APP_VERSION=0.1.0
```

## API Integration

The application includes a fully typed API client with:

- Authentication services
- Profile management
- Likes and matching functionality
- Error handling and interceptors

## Styling

The project uses Tailwind CSS with custom theme tokens:

- Extended color palette
- Custom animations
- Responsive utilities
- Component classes

## State Management

State is managed using Zustand with:

- Authentication state
- UI state
- Persistent storage options

## TypeScript

The project is fully typed with:

- Strict mode enabled
- Path aliases configured
- API response types
- Component prop types

## Contributing

1. Follow the existing code style
2. Run linting and type checking before committing
3. Add tests for new features
4. Update documentation as needed