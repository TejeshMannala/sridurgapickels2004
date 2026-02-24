# Sri Kanaka Durga Pickles - Admin Panel

The admin panel for Sri Kanaka Durga Pickles e-commerce platform.

## Features

- Dashboard with analytics
- Product management (CRUD operations)
- Order management
- User management
- Category management
- Modern admin interface

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Chart.js for analytics
- React Toastify
- React Icons

## Installation

1. Clone the repository
2. Navigate to the admin directory
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
├── components/     # Reusable admin components
├── pages/         # Admin page components
├── routes/        # Admin route components
├── services/      # Admin API services
├── context/       # Admin context providers
└── utils/         # Admin utility functions
```

## Admin Routes

- `/admin/dashboard` - Analytics and overview
- `/admin/products` - Manage products
- `/admin/products/add` - Add new product
- `/admin/products/edit/:id` - Edit product
- `/admin/orders` - Manage orders
- `/admin/users` - Manage users
- `/admin/login` - Admin login