# PPT-KIT Justfile
# Usage: vx just <command>
# 
# This file provides convenient commands for development, building, and testing.
# All commands are designed to work with vx environment manager.

# Set shell for Windows compatibility
set shell := ["pwsh", "-NoProfile", "-Command"]

# Default recipe - show available commands
default:
    @just --list

# ============================================================================
# Development
# ============================================================================

# Start development server
dev:
    npm run dev

# Start development server with host binding (for remote access)
dev-host:
    npm run dev -- --host

# Preview production build
preview:
    npm run preview

# ============================================================================
# Build
# ============================================================================

# Build the project for production
build:
    npm run build

# Build MCP server module only
build-mcp:
    npm run mcp:build

# Build everything (UI + MCP)
build-all: build build-mcp

# Clean build artifacts
clean:
    rm -rf dist
    rm -rf node_modules/.vite

# Clean and rebuild
rebuild: clean build

# ============================================================================
# Office Add-in
# ============================================================================

# Start Office Add-in (no debug)
start:
    npm run start

# Start Office Add-in with debugging
start-debug:
    npm run start:debug

# Stop Office Add-in debugging
stop:
    npm run stop

# Validate Office Add-in manifest
validate:
    npm run validate

# ============================================================================
# MCP Server
# ============================================================================

# Run MCP server in stdio mode (default)
mcp:
    npm run mcp:server

# Run MCP server in HTTP mode
mcp-http:
    TRANSPORT=http npm run mcp:server

# Run MCP server on custom port
mcp-port port="3100":
    TRANSPORT=http PORT={{port}} npm run mcp:server

# ============================================================================
# Code Quality
# ============================================================================

# Run ESLint
lint:
    npm run lint

# Run ESLint with auto-fix
lint-fix:
    npm run lint -- --fix

# Type check without emitting
typecheck:
    npx tsc --noEmit

# ============================================================================
# Dependencies
# ============================================================================

# Install dependencies
install:
    npm install

# Update dependencies
update:
    npm update

# Audit dependencies for security issues
audit:
    npm audit

# Clean install (remove node_modules and reinstall)
reinstall:
    rm -rf node_modules
    rm -f package-lock.json
    npm install

# ============================================================================
# Testing
# ============================================================================

# Run tests (placeholder - add test framework as needed)
test:
    @echo "No tests configured yet. Add a test framework to package.json"

# ============================================================================
# Utilities
# ============================================================================

# Show project info
info:
    @echo "PPT-KIT Office Add-in"
    @echo "====================="
    @echo ""
    @echo "Node version:"
    @node --version
    @echo ""
    @echo "NPM version:"
    @npm --version
    @echo ""
    @echo "Package info:"
    @npm pkg get name version

# Generate SSL certificates for local development
certs:
    npx office-addin-dev-certs install

# Verify SSL certificates
verify-certs:
    npx office-addin-dev-certs verify

# ============================================================================
# Git Helpers
# ============================================================================

# Show git status
status:
    git status

# Add all changes
add:
    git add -A

# Commit with message
commit message:
    git commit -m "{{message}}"

# Push to remote
push:
    git push

# Pull from remote
pull:
    git pull

# ============================================================================
# Docker
# ============================================================================

# Build Docker image
docker-build:
    docker build -t ppt-kit:latest .

# Build Docker image for MCP server
docker-build-mcp:
    docker build --target mcp-server -t ppt-kit-mcp:latest .

# Run with Docker Compose
docker-up:
    docker-compose up -d

# Stop Docker Compose services
docker-down:
    docker-compose down

# View Docker logs
docker-logs:
    docker-compose logs -f

# ============================================================================
# Release
# ============================================================================

# Bump patch version
bump-patch:
    npm version patch --no-git-tag-version

# Bump minor version
bump-minor:
    npm version minor --no-git-tag-version

# Bump major version
bump-major:
    npm version major --no-git-tag-version

# ============================================================================
# Deploy
# ============================================================================

# Deploy to production (requires configuration)
deploy:
    @echo "Deploying to production..."
    @echo "1. Build: just build"
    @echo "2. Docker: just docker-build && just docker-up"
    @echo "3. Or upload dist/ to your hosting provider"

# Generate Office Store submission package
package-store:
    @echo "Preparing Office Store submission..."
    @mkdir -p release
    @cp manifest/manifest.prod.xml release/manifest.xml
    @cp -r dist/* release/
    @echo "Package ready in release/ directory"

# ============================================================================
# GitHub Pages Deployment
# ============================================================================

# Build for GitHub Pages (with base path)
build-pages repo="ppt-kit":
    VITE_BASE_PATH=/{{repo}}/ npm run build

# Generate manifest for GitHub Pages
gen-pages-manifest repo="ppt-kit" owner="loonghao":
    @echo "Generating manifest for: https://{{owner}}.github.io/{{repo}}"
    @sed -e 's|https://localhost:5000|https://{{owner}}.github.io/{{repo}}|g' \
         -e 's|https://localhost:3000|https://{{owner}}.github.io/{{repo}}|g' \
         manifest/manifest.local.xml > dist/manifest.xml
    @echo "Manifest generated: dist/manifest.xml"

# Full GitHub Pages build (build + manifest)
pages repo="ppt-kit" owner="loonghao": (build-pages repo) (gen-pages-manifest repo owner)
    @echo "=== GitHub Pages Build Complete ==="
    @echo "Deploy dist/ to GitHub Pages"
    @echo "Users can download manifest from: https://{{owner}}.github.io/{{repo}}/manifest.xml"
