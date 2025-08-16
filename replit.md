# Overview

This is a comprehensive university academic management system called "LAUTECH Portal" built for Ladoke Akintola University of Technology. The application provides a complete platform for students, faculty, and administrators to manage academic activities including news, events, faculty directory, real-time chat, document management, and administrative functions.

The system features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data storage and WebSocket for real-time communication. It includes robust authentication through Replit's OAuth system and supports role-based access control with multiple admin levels.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built using React with TypeScript and follows a component-based architecture. It uses Vite as the build tool and development server, providing hot module replacement for efficient development. The UI is constructed with shadcn/ui components built on top of Radix UI primitives, ensuring accessibility and consistency.

Key architectural decisions:
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: Leverages TanStack Query for server state management and caching
- **Styling**: Implements Tailwind CSS with a custom design system featuring LAUTECH branding
- **Form Handling**: Uses React Hook Form with Zod for validation
- **Real-time Communication**: WebSocket integration for live chat functionality

## Backend Architecture
The server follows a RESTful API design pattern built with Express.js and TypeScript. It implements a layered architecture separating concerns between routing, business logic, and data access.

Core architectural patterns:
- **Authentication**: Integrated Replit OAuth using OpenID Connect with Passport.js
- **Session Management**: PostgreSQL-backed session store for persistent authentication
- **Database Layer**: Drizzle ORM for type-safe database operations
- **File Handling**: Multer middleware for file uploads with configurable storage
- **WebSocket Server**: Real-time bidirectional communication for chat features
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Data Storage Architecture
The application uses PostgreSQL as the primary database with Drizzle ORM providing type-safe database interactions. The schema is designed to support the academic management requirements with proper relationships and constraints.

Database design decisions:
- **User Management**: Supports OAuth integration with user profiles and role-based permissions
- **Academic Entities**: Faculty, news, events, and document management with proper categorization
- **Communication**: Chat channels and messages with real-time synchronization
- **Administration**: Site settings, user reports, and administrative controls
- **Session Storage**: Dedicated session table for authentication persistence

## Authentication and Authorization
The system implements OAuth 2.0 authentication through Replit's identity provider, ensuring secure user access without managing passwords directly. Authorization is role-based with three levels: regular users, admins, and super admins.

Security features:
- **Session Management**: Secure HTTP-only cookies with proper expiration
- **Role-Based Access**: Granular permissions for different user types
- **User Moderation**: Ban/unban functionality with expiration dates
- **Protected Routes**: Frontend and backend route protection based on authentication status

# External Dependencies

## Database Services
- **Neon PostgreSQL**: Serverless PostgreSQL database with connection pooling
- **Drizzle Kit**: Database migration and schema management tool

## Authentication Services
- **Replit OAuth**: OpenID Connect authentication provider for seamless login
- **Passport.js**: Authentication middleware for Node.js applications

## UI and Styling
- **shadcn/ui**: High-quality component library built on Radix UI
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide Icons**: Consistent icon set for the user interface

## Development Tools
- **Vite**: Build tool and development server with HMR support
- **TypeScript**: Static type checking for enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

## Communication and Real-time Features
- **WebSocket**: Native WebSocket implementation for real-time chat
- **TanStack Query**: Data fetching and caching library for React

## File Handling
- **Multer**: Middleware for handling multipart/form-data file uploads
- **File System**: Local file storage with configurable limits and validation