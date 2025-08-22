# Taskly Frontend

A modern, responsive task management application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: JWT-based login/register system
- **Task Management**: Create, read, update, delete, and toggle task completion
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Updates**: Instant feedback for all user actions
- **Advanced Filtering**: Filter tasks by completion status and due date
- **Pagination**: Efficient task loading with pagination support
- **Form Validation**: Client-side validation using Zod and React Hook Form
- **Modern UI**: Clean, intuitive interface with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **State Management**: React Context API
- **Authentication**: JWT tokens stored in localStorage

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see main project README)

### Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment variables:

   ```bash
   # Create .env.local file
   NEXT_PUBLIC_API_URL=https://localhost:7001
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout with AuthProvider
│   │   └── page.tsx          # Home page with redirects
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   │   ├── Button.tsx    # Button component
│   │   │   ├── Input.tsx     # Input component
│   │   │   └── Textarea.tsx  # Textarea component
│   │   ├── TaskCard.tsx      # Individual task display
│   │   ├── TaskForm.tsx      # Task creation/editing form
│   │   ├── LoginForm.tsx     # Login form
│   │   ├── RegisterForm.tsx  # Registration form
│   │   └── ProtectedRoute.tsx # Route protection component
│   ├── lib/                   # Core utilities
│   │   ├── api.ts            # API client with axios
│   │   ├── auth-context.tsx  # Authentication context
│   │   └── validations.ts    # Zod validation schemas
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts          # All application types
│   └── hooks/                 # Custom React hooks
└── public/                    # Static assets
```

## Key Components

### Authentication System

- **AuthProvider**: Manages authentication state across the app
- **ProtectedRoute**: Guards routes that require authentication
- **JWT Management**: Automatic token handling and refresh

### Task Management

- **TaskCard**: Displays individual tasks with actions
- **TaskForm**: Modal form for creating/editing tasks
- **Dashboard**: Main interface with filtering and pagination

### Form Handling

- **React Hook Form**: Efficient form state management
- **Zod Validation**: Type-safe schema validation
- **Error Handling**: User-friendly error messages

## API Integration

The frontend integrates with your Taskly backend API:

- **Base URL**: Configurable via `NEXT_PUBLIC_API_URL`
- **Endpoints**:
  - `POST /api/auth/login` - User authentication
  - `POST /api/auth/register` - User registration
  - `GET /api/tasks` - List tasks with filters
  - `POST /api/tasks` - Create new task
  - `PUT /api/tasks/{id}` - Update task
  - `DELETE /api/tasks/{id}` - Delete task
  - `POST /api/tasks/{id}/toggle` - Toggle completion

## Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Responsive grid layouts
- **Touch Friendly**: Large touch targets and gestures
- **Accessibility**: ARIA labels and keyboard navigation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (if configured)
- **Component Structure**: Consistent component patterns

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms

- **Netlify**: Static site hosting
- **AWS Amplify**: Full-stack hosting
- **Docker**: Containerized deployment

## Environment Variables

```bash
# Required
NEXT_PUBLIC_API_URL=https://your-api-url.com

# Optional
NODE_ENV=production
```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for all new code
3. Add proper error handling
4. Test responsive design on multiple devices
5. Update this README for new features

## Troubleshooting

### Common Issues

1. **API Connection**: Ensure backend is running and accessible
2. **CORS Errors**: Check backend CORS configuration
3. **Build Errors**: Clear `.next` folder and reinstall dependencies
4. **Type Errors**: Run `npm run type-check` to identify issues

### Performance

- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Built-in Next.js image optimization
- **Bundle Analysis**: Use `@next/bundle-analyzer` for optimization

## License

This project is part of the Taskly application suite.
