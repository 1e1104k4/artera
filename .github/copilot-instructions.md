# GitHub Copilot Instructions for Artera AI Chatbot

## Project Overview

This is a sophisticated AI-powered chatbot application called **Chat SDK** built with Next.js and the AI SDK. The project provides a flexible template for building powerful chatbot applications with advanced AI capabilities, Model Context Protocol (MCP) integration, and comprehensive chat management features.

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI/ML**: AI SDK with support for multiple providers (xAI Grok, OpenAI, Anthropic, etc.)
- **Database**: Drizzle ORM with Postgres (Neon Serverless)
- **Authentication**: Auth.js (NextAuth.js v5)
- **File Storage**: Vercel Blob
- **Model Context Protocol**: Integration with external MCP servers
- **Testing**: Playwright for E2E testing
- **Build Tools**: Biome for linting/formatting, ESLint

## Project Structure

```
/
├── app/                    # Next.js App Router pages and layouts
│   ├── (chat)/            # Chat-related pages and components
│   └── api/               # API routes and server actions
├── components/            # Reusable React components
├── lib/                   # Utility libraries and configurations
│   ├── ai/                # AI-related utilities, prompts, and tools
│   │   ├── tools/         # MCP tools and integrations
│   │   ├── prompts.ts     # System prompts and AI instructions
│   │   └── mcp-config.ts  # MCP server configurations
│   └── db/                # Database schemas and migrations
├── hooks/                 # Custom React hooks
├── artifacts/             # Document and code artifacts
└── tests/                 # Test files and utilities
```

## Key Features and Patterns

### 1. AI Integration
- Multiple AI model providers supported via AI SDK
- Streaming responses with real-time updates
- Document creation and editing (artifacts system)
- Code generation with syntax highlighting
- Spreadsheet creation and manipulation

### 2. Model Context Protocol (MCP)
- Integration with OpenSea MCP server for NFT data
- Extensible tool system for external MCP servers
- Configuration in `lib/ai/mcp-config.ts`
- Tools located in `lib/ai/tools/`

### 3. Chat Management
- Persistent chat history with database storage
- User authentication and session management
- Real-time streaming responses
- Message attachments and file handling

### 4. Document System (Artifacts)
- Create, update, and manage documents
- Support for text, code, and spreadsheet artifacts
- Real-time collaborative editing
- Document versioning and suggestions

## Development Guidelines

### Code Style
- Use TypeScript with strict type checking
- Follow React best practices with hooks and functional components
- Use Tailwind CSS for styling with shadcn/ui components
- Implement server-side rendering where appropriate
- Use React Server Components for data fetching

### AI Integration Patterns
- System prompts are defined in `lib/ai/prompts.ts`
- Use streaming responses for better UX
- Implement proper error handling for AI operations
- Follow the artifacts pattern for document creation

### Database Patterns
- Use Drizzle ORM for type-safe database operations
- Migrations are in `lib/db/migrate.ts`
- Follow the existing schema patterns in `lib/db/schema.ts`

### MCP Integration
- New MCP tools should be added to `lib/ai/tools/`
- Configure servers in `lib/ai/mcp-config.ts`
- Follow the existing OpenSea integration pattern
- Implement proper error handling and validation

### Component Structure
- Use shadcn/ui components as base building blocks
- Implement proper TypeScript interfaces for props
- Use React.memo for performance optimization where needed
- Follow the existing component patterns in the codebase

### API Routes
- Use Next.js App Router API routes
- Implement proper authentication checks
- Use server actions for data mutations
- Follow RESTful conventions where applicable

## Testing
- Use Playwright for end-to-end testing
- Test files are in the `tests/` directory
- Mock AI responses for consistent testing
- Test critical user flows and integrations

## Environment Configuration
- Copy `.env.example` to `.env.local` for development
- Configure AI provider API keys
- Set up database connection strings
- Configure authentication secrets

## Common Tasks

### Adding a New AI Tool
1. Create tool file in `lib/ai/tools/`
2. Define tool schema and implementation
3. Add tool to the chat route in `app/api/chat/route.ts`
4. Test integration with MCP server if applicable

### Creating New Components
1. Use shadcn/ui CLI to add base components
2. Create custom components in `components/`
3. Follow TypeScript interface patterns
4. Implement proper accessibility

### Database Changes
1. Update schema in `lib/db/schema.ts`
2. Generate migration with `npm run db:generate`
3. Run migration with `npm run db:migrate`
4. Update related API routes and components

## Important Files to Understand

- `lib/ai/prompts.ts` - System prompts and AI behavior configuration
- `app/api/chat/route.ts` - Main chat API endpoint
- `lib/ai/tools/` - MCP tools and integrations
- `components/chat/` - Chat interface components
- `components/document.tsx` - Document/artifact handling
- `lib/db/schema.ts` - Database schema definitions

## AI Behavior Notes

- The system uses different prompts for different chat models
- Artifacts are created for substantial content (>10 lines)
- The AI can create and update documents, code, and spreadsheets
- MCP integration allows access to external data sources
- Streaming responses provide real-time feedback

## Deployment

- Optimized for Vercel deployment
- Uses Vercel Edge Runtime for AI operations
- Supports serverless Postgres with Neon
- Integrated with Vercel Blob for file storage

When working on this codebase, focus on maintaining the existing patterns, ensuring type safety, and following the established AI integration conventions. The project emphasizes user experience through streaming responses and real-time updates.