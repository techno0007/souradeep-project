# Souradeep Dey Designs Dashboard

## Overview

This project is a full-stack web application built for a photography and design business. It features a modern dashboard for managing clients, bookings, payments, and notifications. The application uses a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM for data management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Design System**: shadcn/ui component library

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for bundling server code

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript schema definitions
- **Migrations**: Drizzle Kit for schema management
- **Connection**: @neondatabase/serverless for edge-compatible connections

## Key Components

### Database Schema
The application uses five main entities:
- **Users**: Authentication and user management
- **Clients**: Customer information and contact details
- **Bookings**: Service bookings with dates and amounts
- **Payments**: Payment tracking linked to bookings
- **Notifications**: System notifications and alerts

### Frontend Components
- **Dashboard Views**: Home, Clients, Due Payments, Notifications, Profile
- **Navigation**: Tab-based navigation system
- **Modal Components**: Booking creation modal
- **UI Components**: Comprehensive set of reusable components

### API Layer
- **RESTful Endpoints**: Organized route handlers in server/routes.ts
- **Mock Data**: Placeholder responses for development
- **Error Handling**: Centralized error middleware

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **Server Processing**: Express.js routes handle requests and business logic
3. **Database Operations**: Drizzle ORM manages database interactions
4. **Response Handling**: JSON responses with proper error handling
5. **State Updates**: TanStack Query manages caching and updates

## External Dependencies

### UI and Styling
- **Radix UI**: Headless UI components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management

### Data and State
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **date-fns**: Date manipulation utilities

### Database and Backend
- **Drizzle ORM**: Type-safe database operations
- **connect-pg-simple**: PostgreSQL session store
- **@neondatabase/serverless**: Edge-compatible PostgreSQL client

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Port**: 5000 (mapped to external port 80)
- **Command**: `npm run dev` using tsx for TypeScript execution

### Production Build
- **Build Process**: 
  1. Vite builds frontend assets to `dist/public`
  2. esbuild bundles server code to `dist/index.js`
- **Start Command**: `npm run start` runs the bundled server
- **Database**: Configured for production PostgreSQL via DATABASE_URL

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Static Assets**: Served from `dist/public` in production
- **Session Management**: PostgreSQL-backed sessions

### Autoscale Deployment
- **Target**: Configured for autoscale deployment
- **Build Command**: `npm run build`
- **Run Command**: `npm run start`

## Changelog

```
Changelog:
- June 14, 2025. Initial setup
- June 14, 2025. Complete redesign with modern colorful UI, Supabase integration, mobile-friendly horizontal menu buttons, logo integration, and booking system
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```