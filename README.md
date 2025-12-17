# Frontend - Landline Shuttle Booking Widget

React/TypeScript frontend application for the Landline Shuttle Booking Widget.

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication

## Features

- User authentication (signup/signin)
- Protected routes requiring authentication
- Trip search with origin/destination validation
- Real-time seat availability by level (1, 2, 3)
- Seat selection with visual indicators
- Booking management (view, cancel)
- Responsive design

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.tsx    # Route protection wrapper
│   │   └── TripCard.tsx          # Trip display component
│   ├── pages/
│   │   ├── SearchPage.tsx        # Trip search
│   │   ├── ResultsPage.tsx       # Available trips
│   │   ├── BookingPage.tsx       # Seat selection and booking
│   │   ├── ConfirmationPage.tsx # Booking confirmation
│   │   ├── MyBookingsPage.tsx   # User's bookings
│   │   ├── SignupPage.tsx       # User registration
│   │   └── SigninPage.tsx       # User login
│   ├── services/
│   │   └── api.ts                # API client with interceptors
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── App.css                   # Global styles
│   ├── index.tsx                 # Application entry point
│   └── index.css                 # Base styles
├── public/
│   └── index.html                # HTML template
├── package.json
└── tsconfig.json                 # TypeScript configuration
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file (optional):
   ```bash
   REACT_APP_API_URL=http://localhost:3001/api
   ```

3. Start development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Key Components

### ProtectedRoute
Wraps routes that require authentication. Redirects to sign-in page if user is not authenticated.

### SearchPage
- Displays available routes
- Validates that origin and destination are different
- Defaults date to today
- Hides search button when origin equals destination

### BookingPage
- Displays seats organized by level (1, 2, 3)
- Shows unavailable seats as inactive
- Allows seat selection with visual feedback
- Validates passenger information

### MyBookingsPage
- Displays authenticated user's bookings
- Allows cancellation of bookings
- Shows booking details including seat level

## API Integration

All API calls are made through the `api.ts` service file which includes:
- Axios instance with base URL configuration
- Request interceptor for adding JWT tokens
- Response interceptor for error handling
- Type-safe API methods

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001/api)

## TypeScript

The application is fully typed with TypeScript:
- All components have proper type definitions
- API responses are typed
- Form data and state are typed
- Type safety prevents runtime errors

## Authentication Flow

1. User signs up or signs in
2. JWT token is stored in localStorage
3. Token is included in API requests via interceptor
4. Protected routes check for token
5. User can access booking features when authenticated