@echo off
setlocal enabledelayedexpansion
title DhanForge - Windows Toolkit
cd /d "%~dp0"

:menu
cls
echo.
echo  ================================================================
echo    DHANFORGE -- Synthetic Indian Household Finance Lab
echo    Windows Toolkit
echo  ================================================================
echo.
echo    [1]  Install dependencies          (npm install)
echo    [2]  Start dev server              (npm run dev)
echo    [3]  Build for production          (npm run build)
echo    [4]  Publish to GitHub as "kk-dhanforge"
echo    [5]  Open preview of last build    (dist\index.html)
echo    [6]  Exit
echo.
set "choice="
set /p "choice=  Choose an option [1-6]: "
if "%choice%"=="1" goto install
if "%choice%"=="2" goto dev
if "%choice%"=="3" goto build
if "%choice%"=="4" goto publish
if "%choice%"=="5" goto preview
if "%choice%"=="6" goto :eof
echo.
echo  Invalid choice. Try again.
timeout /t 2 /nobreak >nul
goto menu

:install
cls
echo  Checking for Node.js...
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo  Node.js was not found on this machine.
  echo  Download and install it from https://nodejs.org, then re-run.
  echo.
  pause
  goto menu
)
echo.
echo  Installing dependencies...
call npm install
echo.
echo  Done.
pause
goto menu

:dev
cls
echo  Starting dev server... press Ctrl+C to stop.
echo.
call npm run dev
goto menu

:build
cls
echo  Building for production...
echo.
call npm run build
echo.
echo  Build finished. Output is in the "dist" folder.
pause
goto menu

:preview
if exist "dist\index.html" (
  start "" "dist\index.html"
) else (
  echo.
  echo  No build found. Run option 3 first.
  pause
)
goto menu

:publish
cls
echo  ================================================================
echo    Publish to GitHub as repository "kk-dhanforge"
echo  ================================================================
echo.
where git >nul 2>&1
if errorlevel 1 (
  echo  Git was not found. Install it from https://git-scm.com/download/win
  echo  then re-run this script.
  echo.
  pause
  goto menu
)

where gh >nul 2>&1
if not errorlevel 1 goto publish_gh

:publish_manual
echo  GitHub CLI (gh) not found - falling back to plain git.
echo.
set /p "ghuser=  Enter your GitHub username: "
if "!ghuser!"=="" (
  echo  No username entered. Aborting.
  pause
  goto menu
)
echo.
echo  NOTE: the repository must already exist on GitHub.
echo  If it does not, create an empty one here first:
echo  https://github.com/new?name=kk-dhanforge
echo.
if not exist ".git" (
  echo  Initialising local repository...
  git init
  git branch -M main
) else (
  echo  Local repository already initialised.
)
echo  Staging files...
git add .
echo  Committing...
git commit -m "DhanForge - synthetic Indian household finance generator" --allow-empty >nul 2>&1
echo  Pointing remote at https://github.com/!ghuser!/kk-dhanforge.git ...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/!ghuser!/kk-dhanforge.git
echo  Pushing to main...
git push -u origin main
if errorlevel 1 (
  echo.
  echo  Push failed. Check that:
  echo   - the repo "kk-dhanforge" exists under your account
  echo   - you are authenticated ^(git credential manager or a PAT^)
  goto publish_done
)
goto publish_done

:publish_gh
echo  GitHub CLI detected.
gh auth status >nul 2>&1
if errorlevel 1 (
  echo  Signing you in to GitHub...
  gh auth login
)
echo  Creating repo and pushing ^(creates it if missing^)...
gh repo create kk-dhanforge --public --source=. --remote --push
if errorlevel 1 (
  echo.
  echo  gh reported a problem. If the repo already exists remotely, try:
  echo    git push -u origin main
)

:publish_done
if not defined ghuser (
  for /f "delims=" %%u in ('gh api user --jq .login 2^>nul') do set "ghuser=%%u"
)
if not defined ghuser set "ghuser=YOUR-USERNAME"
echo.
echo  ================================================================
echo    Publish finished.
echo    Repo: https://github.com/!ghuser!/kk-dhanforge
echo.
echo    Optional live site:
echo    Settings -^> Pages -^> Source -^> GitHub Actions
echo    ^(a deploy workflow is already included in .github\workflows\)
echo  ================================================================
echo.
pause
goto menu
