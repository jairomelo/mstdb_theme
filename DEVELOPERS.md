# Developer Documentation

## Project Structure

### Configuration (`src/conf/`)
The configuration directory contains several key files that define the application's behavior:

#### `contributors.js`
Manages the project's contributors information in a structured format:
- `coordinators`: Project coordinators with their institutional affiliations
- `collaborators`: Research collaborators with detailed bios
- `researchAssistants`: Research support staff
- `developers`: Technical team members

#### `filters.js`
Defines the search/browse filters configuration:
- Configures available filter types (documents, enslaved persons, non-enslaved persons, etc.)
- Includes icons and display names for each filter type
- Provides utility functions for filter management

#### `local.js`
Contains localization and branding configuration:
- Defines the main title stem and its variations
- Manages title animations and display logic

### Library (`src/lib/`)

#### API Integration (`api.js`)
Central API communication module:
- Handles all backend API requests
- Implements fetch wrapper with base URL configuration
- Manages endpoint-specific functions for:
  - Search operations
  - Browse operations
  - Detail view data retrieval

#### Data Management

##### `browse-store.js` & `search-store.js`
Svelte stores for managing application state:
- Document browsing state
- Search results and pagination
- Filter states and counts

##### `datatable.js`
Configures and manages interactive data tables:
- Defines column configurations for different data types
- Handles server-side pagination and sorting
- Implements custom renderers for special data types

#### UI Components

##### `bootstrap-actions.js`
Bootstrap integration utilities:
- Dropdown menu initialization
- Collapse functionality
- Tooltip management
- Server-side rendering compatibility

##### `maintitle.js`
Title animation and management:
- Handles title suffix rotation
- Manages color transitions
- Controls animation timing

##### `textanimation.js`
Text animation implementation using Anime.js:
- Character-by-character animation
- Timing and easing controls
- Animation sequence management

#### Utilities

##### `documentTree.js`
Generates hierarchical document structure:
- Processes archive metadata
- Creates nested tree structure
- Handles special document types

##### `logger.js`
Logging system implementation:
- Configures log levels
- Manages server-side logging
- Handles error reporting

##### `utils.js`
General utility functions:
- Date formatting
- Common helper functions

## Getting Started with Development

1. **Environment Setup**
```bash
npm install
```

2. **Development Server**
```bash
npm run dev
```

3. **Key Areas for Contribution**
- UI Components: `src/routes/` directory
- Data Management: `src/lib/` stores and API integration
- Configuration: `src/conf/` for system-wide settings

## Best Practices

1. **Code Style**
- Use ES6+ features
- Implement proper error handling
- Document complex functions
- Use TypeScript types where possible

2. **Component Development**
- Keep components focused and single-responsibility
- Use Svelte stores for state management
- Implement proper loading and error states

3. **API Integration**
- Use the centralized API module
- Implement proper error handling
- Cache responses where appropriate

## Testing

[Work in progress]

## Deployment

[Work in progress]

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Submit a pull request

## Support

[Work in progress]
