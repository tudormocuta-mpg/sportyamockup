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