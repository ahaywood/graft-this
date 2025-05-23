# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-05-15

### Added
- Added shadcn UI setup tool (`npx graftthis shadcn`)
- Created a pre-configured components.json file for RedwoodSDK projects
- Added utilities to automatically install shadcn dependencies
- Implemented proper Document.tsx file updates for style imports
- Added comprehensive documentation for the shadcn tool

### Fixed
- Fixed issue with Tailwind setup not properly adding style imports to Document.tsx
- Improved error handling in configuration file updates
- Enhanced robustness of tsconfig.json and vite.config.ts modifications

## [0.1.0] - 2025-05-12

### Added
- Initial CLI framework for installing utility tools in RedwoodSDK projects
- Added routes generator tool (`npx graftthis routes`)
- Added component generator tool with Plop integration (`npx graftthis component`)
- Added Tailwind CSS setup tool (`npx graftthis tailwind`)
- Implemented automatic dependency installation
- Created comprehensive documentation for all tools
