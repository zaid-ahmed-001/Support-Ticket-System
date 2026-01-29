# Ticket System

A comprehensive support ticket management application built with modern web technologies.

## Features

- **Multi-role Dashboard**: Separate dashboards for agents, customers, managers, QA, and supervisors
- **Ticket Management**: Create, view, and track support tickets
- **Analytics**: Built-in analytics dashboard for performance monitoring
- **Case Management**: Detailed case handling and tracking
- **Rule Management**: Supervisor-level rule configuration
- **Responsive UI**: Modern component-based interface with badges, tables, and forms

## Tech Stack

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Database**: Prisma ORM
- **Styling**: Tailwind CSS with PostCSS
- **Linting**: ESLint
- **Components**: Custom UI component library

## Installation

1. Clone the repository and navigate to the project:
    ```bash
    cd ticket-system
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Configure environment variables:
    ```bash
    cp .env.example .env
    ```

4. Set up the database:
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

5. Start the development server:
    ```bash
    npm run dev
    ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
ticket-system/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   ├── dashboard/                # Dashboard pages
│   ├── tickets/                  # Ticket management pages
│   ├── analytics/                # Analytics dashboard
│   └── layout.tsx                # Root layout
├── components/                   # Reusable UI components
│   ├── dashboard/                # Dashboard-specific components
│   ├── tickets/                  # Ticket-related components
│   ├── common/                   # Shared components (buttons, modals, etc.)
│   └── forms/                    # Form components
├── lib/                          # Utility functions and helpers
│   ├── auth.ts                   # Authentication logic
│   ├── db.ts                     # Database client
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Data models
│   └── migrations/               # Database migrations
├── styles/                       # Global styles
├── types/                        # TypeScript type definitions
└── public/                       # Static assets

```

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **Customer** | Create tickets, view own tickets |
| **Agent** | View/update assigned tickets, add comments |
| **Manager** | View team tickets, generate reports |
| **QA** | Review tickets, validate resolutions |
| **Supervisor** | Full access, manage rules, configuration |

## Database Schema

Key entities:
- **Users**: User accounts with roles
- **Tickets**: Support tickets with status tracking
- **Comments**: Ticket discussions
- **Rules**: Automated workflow rules
- **Analytics**: Performance metrics and logs

## Environment Variables

```env
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## Development Guidelines

- Use TypeScript for type safety
- Follow ESLint configuration
- Create components in respective feature folders
- Write tests for critical functionality
- Use Prisma for all database queries

## Deployment

Deploy to Vercel, AWS, or your preferred platform. Ensure environment variables are configured in production.
# actions.ts Documentation

`actions.ts` is a module that defines and exports action creators or action handlers for state management. This file typically:

- **Defines action types**: Constants representing different actions that can be dispatched in the application
- **Creates action creators**: Functions that generate action objects with a specific type and payload
- **Handles side effects**: May include asynchronous operations, API calls, or middleware logic
- **Manages state transitions**: Provides the interface through which components dispatch changes to application state
- **Enables predictable state updates**: Works with Redux, Vuex, or similar state management patterns to ensure consistent state mutations

This file is commonly used in flux-based architectures to centralize and organize all possible state modifications in one location.
## Available Actions

- `createTicket`: Dispatches ticket creation with user input
- `updateTicket`: Modifies existing ticket properties
- `deleteTicket`: Removes a ticket from the system
- `addComment`: Appends a comment to a ticket discussion
- `assignTicket`: Assigns ticket to an agent
- `changeStatus`: Updates ticket status (open, in-progress, resolved, closed)
- `fetchTickets`: Retrieves tickets based on filters
- `fetchAnalytics`: Loads performance and trend data
- `applyRule`: Executes automated workflow rules
- `setUserRole`: Updates user permissions and access level