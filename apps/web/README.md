# Web Application

TypeScript-based frontend application for property search and recommendations, built with Vite and vanilla TypeScript.

## Prerequisites

- Node.js 18+ and npm/pnpm
- API service running (see `apps/api/README.md`)

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

Or with npm:

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

The default API URL is `http://localhost:8000` if not specified.

### 3. Run Development Server

```bash
pnpm dev
```

Or with npm:

```bash
npm run dev
```

The application will be available at http://localhost:3001

### 4. Build for Production

```bash
pnpm build
```

Or with npm:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### 5. Preview Production Build

```bash
pnpm start
```

Or with npm:

```bash
npm start
```

## Project Structure

```
apps/web/
├── pages/                    # Page-specific HTML files
│   ├── index/                # Home page
│   │   ├── index.html
│   │   ├── index.css
│   │   └── index.ts
│   ├── search/               # Search page
│   │   ├── index.html
│   │   ├── index.css
│   │   └── index.ts
│   ├── detail/               # Asset detail page
│   │   ├── index.html
│   │   ├── index.css
│   │   └── index.ts
│   ├── chat/                 # RAG chat page
│   │   ├── index.html
│   │   ├── index.css
│   │   └── index.ts
│   └── chat/ai/              # AI chat page
│       ├── index.html
│       ├── index.css
│       └── index.ts
├── src/
│   ├── main.ts               # Application entry point
│   ├── env.ts                # Environment configuration
│   ├── components/           # Reusable UI components
│   │   ├── AssetCard.ts      # Property card component
│   │   ├── AuthModal.ts      # Authentication modal
│   │   ├── ChatButton.ts     # Chat button component
│   │   ├── FilterOverlay.ts  # Filter overlay component
│   │   ├── Header.ts          # Header component
│   │   ├── InlineFilters.ts  # Inline filter controls
│   │   ├── Map.ts             # Leaflet map component
│   │   └── PropertyTypeTabs.ts # Property type tabs
│   ├── pages/                 # Page initialization logic
│   │   ├── index.ts          # Home page logic
│   │   ├── search.ts         # Search page logic
│   │   ├── detail.ts         # Detail page logic
│   │   └── chat.ts            # Chat page logic
│   ├── services/             # API integration
│   │   ├── api.ts            # Main API client
│   │   └── search.ts         # Search service
│   ├── types/                # TypeScript type definitions
│   │   └── asset.ts          # Asset-related types
│   ├── utils/                # Utility functions
│   │   ├── clientId.ts       # Client ID management
│   │   ├── filters.ts        # Filter parsing utilities
│   │   └── format.ts         # Formatting utilities
│   ├── styles/               # Global styles
│   │   ├── index.css         # Main stylesheet
│   │   └── modules/          # CSS modules
│   │       ├── assetCard.module.css
│   │       ├── authModal.module.css
│   │       ├── bottomNav.module.css
│   │       ├── chat.module.css
│   │       ├── detail.module.css
│   │       ├── filterOverlay.module.css
│   │       ├── header.module.css
│   │       ├── inlineFilters.module.css
│   │       ├── map.module.css
│   │       └── search.module.css
│   └── style.css             # Additional global styles
├── public/                   # Static assets
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Pages

### Home Page (`/`)

- Displays all properties with filtering
- Property type tabs for quick filtering
- Interactive map showing property locations
- Filter overlay for advanced filtering (price, bedrooms, bathrooms)
- Asset cards with property details

### Search Page (`/search`)

- Hybrid search with semantic and keyword matching
- Real-time search as you type (debounced)
- Natural language query parsing:
  - Price filters: "ต่ำกว่า 5M บาท", "under 3M baht"
  - Location filters: "รัศมี 5 km จาก สยาม"
- Fallback to simple text search if API fails
- Alternative search suggestions for zero results

### Detail Page (`/detail`)

- Property detail view with full information
- Interactive map showing property location
- Countdown timer for auction closing
- Property specifications (bedrooms, bathrooms, area)
- Description and pricing information

### Chat Page (`/chat`)

- RAG (Retrieval-Augmented Generation) chatbot
- Retrieves context from property database
- Answers questions about available properties

### AI Chat Page (`/chat/ai`)

- Basic AI chat with conversation history
- Session-based conversation context
- Uses Ollama LLM for responses

## Components

### AssetCard

Renders property cards with:
- Property type labels
- Property name and code
- Price formatting
- Click tracking for recommendations
- Navigation to detail page

### Map

Leaflet-based map component:
- Displays multiple properties with markers
- Single property detail view
- Interactive zoom and pan
- Custom markers for property types

### FilterOverlay

Advanced filtering interface:
- Price range (min/max)
- Bedrooms minimum
- Bathrooms minimum
- Asset type selection
- Apply/reset functionality

### Header

Main navigation header:
- Search input
- Filter navigation
- Chat button
- Authentication modal trigger

### PropertyTypeTabs

Property type filtering tabs:
- Dynamic tabs based on available asset types
- "All" option to show all properties
- Visual type indicators

### InlineFilters

Inline filter controls for quick access:
- Price range slider
- Bedroom count selector
- Quick filter buttons

### AuthModal

Authentication modal (placeholder for future auth):
- Client ID management
- User profile handling

### ChatButton

Floating chat button:
- Persistent across pages
- Opens chat interface

## Services

### API Service (`src/services/api.ts`)

Main API client with methods:

- `searchAssets(request)` - POST search with filters
- `searchAssetsGET(params)` - GET search with query params
- `getAllAssets(page, pageSize)` - List all assets
- `getAssetById(id)` - Get asset by ID
- `getAssetByCode(code)` - Get asset by code
- `getAssetTypes()` - List all asset types
- `trackRecommendationAction(assetId, actionType)` - Track user actions
- `getUserRecommendations()` - Get personalized recommendations
- `chatWithAI(message, sessionId)` - AI chat endpoint

All methods include error handling and logging.

### Search Service (`src/services/search.ts`)

Search utilities:

- `simpleTextSearch(properties, searchTerm)` - Client-side text search
- `hybridSearchAPI(query)` - API-based hybrid search with fallback
- `getParsedFilters(query)` - Parse natural language filters

## Types

### Asset Types (`src/types/asset.ts`)

- `Asset` - Full property model
- `AssetType` - Property type model
- `AssetResult` - Search result model
- `AssetListResponse` - Paginated asset list
- `SearchRequest` - Search request payload
- `SearchResponse` - Search response with pagination
- `SearchFilter` - Filter parameters

## Utilities

### Client ID (`src/utils/clientId.ts`)

Manages unique client identifier:
- Generates UUID on first visit
- Stores in localStorage
- Used for recommendation tracking

### Filters (`src/utils/filters.ts`)

Natural language query parsing:
- Price filter extraction ("ต่ำกว่า 5M บาท")
- Location radius parsing ("รัศมี 5 km จาก สยาม")
- Query text cleaning

### Format (`src/utils/format.ts`)

Formatting utilities:
- `formatPrice(price)` - Thai number formatting
- `getAssetTypeById(types, id)` - Get type name by ID
- `extractAssetTypes(assets)` - Extract unique types from assets

## Routing

Vite plugin handles multi-page routing:
- `/` → `pages/index/index.html`
- `/search` → `pages/search/index.html`
- `/detail` → `pages/detail/index.html`
- `/chat` → `pages/chat/index.html`
- `/chat/ai` → `pages/chat/ai/index.html`

All routes are configured in `vite.config.ts` with custom middleware.

## Styling

- Global styles in `src/style.css` and `src/styles/index.css`
- CSS modules for component-specific styles
- Responsive design with mobile-first approach
- Thai language support with proper typography

## Development

### Adding a New Page

1. Create HTML file in `pages/[page-name]/index.html`
2. Create TypeScript file in `pages/[page-name]/index.ts`
3. Create CSS file in `pages/[page-name]/index.css`
4. Add route in `vite.config.ts` (both middleware and build input)
5. Add initialization in `src/main.ts` if needed

### Adding a New Component

1. Create component file in `src/components/[ComponentName].ts`
2. Export initialization function
3. Import and call in relevant pages or `src/main.ts`
4. Add CSS module if needed in `src/styles/modules/`

### Adding a New API Endpoint

1. Add method to `src/services/api.ts`
2. Add types to `src/types/asset.ts` if needed
3. Use in components or pages

## Build Configuration

### Vite Config

- Development server on port 3001
- Multi-page routing plugin
- TypeScript support
- CSS modules support

### TypeScript Config

- Strict mode enabled
- ES2022 target
- ESNext modules
- No unused locals/parameters
- Bundler module resolution

## Features

### Recommendation Tracking

- Automatic click tracking on asset cards
- Save action tracking (future feature)
- User profile updates via background tasks
- Personalized recommendations based on profile

### Error Handling

- Graceful API error handling
- Fallback to simple search on API failure
- User-friendly error messages
- Console logging for debugging

### Performance

- Lazy loading of map components
- Debounced search input
- Efficient asset filtering
- Optimized re-renders

## Troubleshooting

### API Connection Issues

- Verify `VITE_API_URL` in `.env`
- Check API server is running
- Check CORS configuration on API
- Review browser console for errors

### Build Issues

- Clear `node_modules` and reinstall
- Check TypeScript errors: `pnpm run build`
- Verify all imports are correct

### Routing Issues

- Check `vite.config.ts` routing configuration
- Verify HTML files exist in `pages/` directory
- Check browser console for routing errors

## Dependencies

### Production

- `leaflet` - Interactive maps
- `zod` - Schema validation for environment variables

### Development

- `typescript` - TypeScript compiler
- `vite` - Build tool and dev server
- `@types/leaflet` - Leaflet type definitions
- `@types/node` - Node.js type definitions

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Preview production build
- `pnpm lint` - Run Biome linter

## References

- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Leaflet Documentation](https://leafletjs.com/)
- [Zod Documentation](https://zod.dev/)
