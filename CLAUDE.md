# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sportya is a comprehensive **multisport platform** consisting of multiple repositories that work together to provide a complete sports event management and player engagement solution. This repository (sportya) is currently a Next.js prototype, but the full platform consists of:

## Multi-Repository Architecture

### 1. **multisport-api** - Microservices Backend
- **Architecture**: Event-driven microservices with Kafka messaging
- **Tech Stack**: Node.js, Express, MongoDB, Redis, Kafka (RedPanda)
- **Services**:
  - **ApiGateway** (Port 2000) - Main API gateway with authentication
  - **Accounts** (Port 2001) - User management, authentication, profiles
  - **Clubs** (Port 2002) - Sports club management and bookings
  - **Events** (Port 2004) - Sports events and competitions
  - **Emails** (Port 2003) - Email service and notifications
  - **Jobs** (Port 2007) - Background job processing
  - **ActivityLogs** (Port 2008) - Activity logging and tracking
  - **Payments** (Port 2005) - Payment processing (likely Stripe)
  - **Notifications** (Port 2006) - Push and in-app notifications
  - **Leaderboards** (Port 2009) - Rankings and statistics
  - **Chat** (Port 2010) - Real-time messaging
  - **Friends** (Port 2011) - Social features and friendships
  - **MeiliSearch** (Port 7700) - Search functionality

### 2. **club-management** - Club Admin Interface
- **Framework**: Next.js 12 with TypeScript
- **Purpose**: Backend interface for sports clubs to manage their facilities, bookings, and events
- **Tech Stack**: React 18, Redux Toolkit, Socket.io, Sentry
- **Features**: Club management, court bookings, event organization, team management
- **Port**: 3002 (development)

### 3. **multisport-web** - Main Public Website
- **Framework**: React 17 (Create React App)
- **Purpose**: Main website for sport practitioners to find events, clubs, and connect with other players
- **Tech Stack**: React, Redux, Stripe integration, Socket.io, i18n
- **Features**: Event discovery, player profiles, payments, social features, PWA support

### 4. **control-panel** - Admin Dashboard
- **Framework**: React 17 (Admin Dashboard)
- **Purpose**: System administration interface for platform operators
- **Tech Stack**: React, Redux Saga, Bootstrap, charts and analytics
- **Features**: User management, system analytics, content management, reports

### 5. **terraform** - Infrastructure as Code
- **Purpose**: AWS infrastructure deployment and management
- **Services**: ECS, ALB, DocumentDB, ElastiCache, MSK (Kafka), S3, CloudFront
- **Environments**: Development, Production
- **Architecture**: Containerized microservices on AWS ECS

### 6. **tp** - Legacy Tournament Platform
- **Tech Stack**: PHP, MySQL, jQuery
- **Purpose**: Legacy tournament management system (appears to be being migrated)
- **Features**: Tournament brackets, player management, results tracking

## Development Commands by Repository

### Current Repository (Sportya Prototype)
```bash
npm run dev    # Next.js development server
npm run build  # Production build
npm start      # Start production server
npm run lint   # Run linting
```

### Multisport API (Microservices)
```bash
# Development (Docker Compose)
./dev_up.sh    # Start all services
./dev_down.sh  # Stop all services

# Individual services
npm run dev    # Development with hot reload
npm run build  # Transpile with Babel
npm run start  # Production mode
npm run lint   # ESLint checking
npm run test   # Jest testing
```

### Club Management
```bash
npm run dev     # Next.js development (port 3002)
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint
```

### Multisport Web
```bash
npm start       # Development server (Create React App)
npm run build   # Production build
npm test        # Run tests
```

### Control Panel
```bash
npm start       # Development server
npm run build   # Production build
npm run lint    # ESLint
```

## Architecture Patterns

### Event-Driven Microservices
- **Message Broker**: Kafka (RedPanda) for service communication
- **Caching**: Redis for session management and caching
- **Database**: MongoDB for most services, separate databases per service
- **API Gateway**: Centralized authentication and routing

### Frontend Architecture
- **State Management**: Redux/Redux Toolkit across all frontends
- **Real-time**: Socket.io for live updates
- **Internationalization**: i18next for multi-language support
- **Payments**: Stripe integration
- **Analytics**: Sentry for error tracking, Mixpanel for user analytics

### Infrastructure
- **Containerization**: Docker for all services
- **Orchestration**: AWS ECS for production
- **CDN**: CloudFront for static assets
- **Search**: MeiliSearch for fast search functionality
- **Monitoring**: Elastic APM and Winston logging

## Development Environment Setup

1. **API Development**: Use Docker Compose in multisport-api repository
2. **Frontend Development**: Each frontend runs independently
3. **Database**: MongoDB and Redis via Docker
4. **Message Queue**: Kafka via RedPanda container

## Key Integration Points

- **Authentication**: Centralized through ApiGateway
- **Real-time Updates**: Socket.io across all client applications
- **Search**: MeiliSearch indexes data from multiple services
- **Payments**: Stripe webhooks processed by Payments service
- **Notifications**: Email and push notifications via dedicated services

## Production Deployment

- **Infrastructure**: Terraform manages AWS resources
- **Container Registry**: AWS ECR
- **Load Balancing**: Application Load Balancer
- **SSL**: AWS Certificate Manager
- **DNS**: Route53
- **Monitoring**: CloudWatch and Elastic APM

## Tournament Scheduling Module Implementation

This repository implements a comprehensive tournament scheduling system with the following specifications:

### Core Features
1. **Multi-View Scheduling Interface**
   - GridView: Table-style view with courts as columns and time slots as rows
   - ListView: Sortable list with bulk operations and filtering
   - TimelineView: Gantt-chart style timeline visualization

2. **Drag-and-Drop Functionality**
   - Visual drag-and-drop for match scheduling
   - Real-time conflict detection and validation
   - Visual feedback for valid/invalid drops

3. **Tournament Management**
   - Player management with Sportya levels
   - Court resource management
   - Match status tracking and updates
   - Blocker management for court conflicts

4. **Mock Data Integration**
   - 16 comprehensive player profiles
   - 6 courts with different specifications
   - 20+ matches across multiple draws
   - 9 blocker scenarios for conflict testing

### Technical Architecture
- **Framework**: Next.js 15.4.6 with TypeScript
- **Styling**: Tailwind CSS with custom tournament components
- **State Management**: React Context API
- **UI Components**: Headless UI for modals and interactions
- **Type Safety**: Comprehensive TypeScript interfaces

### Key Components
- `TournamentLayout`: Main layout with tab navigation
- `GridView`: Primary scheduling interface with drag-and-drop
- `ListView`: Detailed list view with sorting and filtering
- `TimelineView`: Timeline visualization with zoom controls
- `MatchDetailsCard`: Individual match information and editing
- `Blockers`: Court conflict management interface
- `Configuration`: Tournament rules and settings
- `ScheduleGenerationWizard`: Automated scheduling assistant

### Development Notes
- All tournament components are located in `/components/tournament/`
- Type definitions are in `/types/tournament.ts`
- Global state management through `/contexts/TournamentContext.tsx`
- Main tournament page at `/pages/tournament-scheduler.tsx`

### White Page Issue Prevention
**CRITICAL**: This application is prone to white page issues caused by React rendering conflicts and Next.js cache corruption. After EVERY code change, you MUST run one of these commands to prevent white pages:

```bash
# Option 1: Full reset (recommended after significant changes)
npm run dev-clean

# Option 2: Windows batch script (fastest)
dev-restart.bat

# Option 3: Manual steps
rm -rf .next && rm -rf node_modules/.cache && npm cache clean --force && npm run dev

# Option 4: Use different port if conflicts persist
PORT=3013 npm run dev
```

**When to use**: After ANY change to React components, especially:
- State management modifications
- Component structure changes 
- New hooks or context usage
- TypeScript interface changes
- Complex nested component updates

The white page issue is recurring and MUST be addressed proactively with every development iteration.

### Deployment Notes
- Application is deployed to Vercel at: https://sportyamockup.vercel.app/
- Repository: https://github.com/tudormocuta-mpg/sportyamockup (migrated from Bitbucket)
- Vercel deploys from GitHub `main` branch
- Main entry point: /pages/tournament-scheduler.tsx
- **Manual deployment** (if GitHub auto-deploy is not connected): `vercel --prod --yes`
  - Requires Vercel CLI login first: `vercel login` (select GitHub)

### Git Configuration
- **IMPORTANT**: Every commit MUST have an author set. Vercel will reject deployments from commits without a proper author.
- **BEFORE EVERY COMMIT**, ensure git config is set:
  ```bash
  git config user.email "tudor.mocuta@sportya.net"
  git config user.name "Tudor Mocuta"
  ```
- These must be set per-repo (not just globally) to avoid "A commit author is required" errors on deployment.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.