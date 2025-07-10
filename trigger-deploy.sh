#!/bin/bash

# Script to trigger GitHub Pages deployment
echo "Triggering GitHub Pages deployment..."

# Make a small change to trigger the workflow
echo "# Deployment triggered at $(date)" >> frontend/src/App.jsx

# Commit and push
git add frontend/src/App.jsx
git commit -m "Trigger deployment - $(date)"
git push origin main

echo "Deployment triggered! Check GitHub Actions for progress."
echo "Once complete, your site will be available at: https://[your-username].github.io/RISA-management-system/" 