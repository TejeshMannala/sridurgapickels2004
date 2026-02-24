# Sri Kanaka Durga Pickles - Client

The frontend React application for Sri Kanaka Durga Pickles e-commerce platform.

## Features

- Beautiful, responsive design
- Product catalog with categories
- Shopping cart functionality
- User authentication
- Order management
- Modern React with Vite

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Redux (optional)
- React Toastify
- React Icons

## Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── routes/        # Route components
├── services/      # API services
├── context/       # Context providers
└── utils/         # Utility functions