# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains a UI Kit built with Eleventy, SCSS, and Twig templating. It's a frontend component library used for building better and simpler UI interfaces.

## Build and Development

### Installation

```bash
npm install
```

### Development Commands

- **Start Development Server**: Builds the site and starts development servers with watch mode for Eleventy, SASS, and JavaScript
  ```bash
  npm start
  ```

- **Build for Production**: Creates a production build in the `_site` directory
  ```bash
  npm run build
  ```

### Component Development

Individual commands that can be run:

- **Compile SASS**: `npm run compile:sass`
- **Watch SASS**: `npm run watch:sass`
- **Build JavaScript**: `npm run build:js`
- **Watch JavaScript**: `npm run watch:js`
- **Build Settings JS**: `npm run build:settings`
- **Watch Settings JS**: `npm run watch:settings`
- **Watch Eleventy**: `npm run watch:eleventy`

### Linting

This project uses Stylelint for SCSS linting with a custom configuration defined in `.stylelintrc.json`. To run the linter:

```bash
npx stylelint "**/*.scss"
```

## Architecture

### Project Structure

- `src/`: Source files
  - `_includes/`: Layouts, partials, and components used by Eleventy
  - `assets/`: 
    - `scss/`: SCSS files for styling
    - `scripts/`: JavaScript files
  - `*.twig`: Top-level Twig template files

- `frontend/`: SCSS component library organized following atomic design principles
  - `atoms/`: Basic building blocks (buttons, headings, etc.)
  - `molecules/`: Groups of atoms (forms, navigation, cards, etc.)
  - `organisms/`: Complex UI components 
  - `templates/`: Page-specific layouts
  - `utilities/`: Mixins, functions, and variables

- `_site/`: Generated output folder (not committed to git)

### Technology Stack

- **Template Engine**: Twig via Eleventy
- **CSS Processor**: SASS
- **JS Bundler**: esbuild
- **CSS Architecture**: Custom component-based structure with atomic design principles
- **CSS Frameworks**: Uses "illusion" (custom framework) and modern-normalize

### Build Process

The build process:
1. Cleans the `_site` directory
2. Compiles SCSS to CSS
3. Bundles JavaScript files
4. Processes Twig templates with Eleventy
5. Minifies CSS with CleanCSS

## Conventions

### CSS/SCSS

- Follows a component-based architecture
- Uses BEM naming convention for CSS classes
- Organized into atoms, molecules, and organisms following atomic design principles
- CSS properties are ordered according to a specific sequence defined in Stylelint config