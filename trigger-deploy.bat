@echo off
echo Triggering GitHub Pages deployment...

REM Make a small change to trigger the workflow
echo // Deployment triggered at %date% %time% >> frontend\src\App.jsx

REM Commit and push
git add frontend\src\App.jsx
git commit -m "Trigger deployment - %date% %time%"
git push origin main

echo Deployment triggered! Check GitHub Actions for progress.
echo Once complete, your site will be available at: https://[your-username].github.io/RISA-management-system/
pause 