@echo off
echo ========================================
echo  Set Supabase Service Role Key
echo ========================================
echo.
echo This script will help you set the PRIVATE_SERVICE_ROLE_KEY for your Edge Functions.
echo.
echo Step 1: Get your Service Role Key
echo   1. Go to https://supabase.com/dashboard
echo   2. Select your project
echo   3. Go to Settings -^> API
echo   4. Copy the 'service_role' key (the long JWT token)
echo.
echo Step 2: Paste it below when prompted
echo.
set /p SERVICE_KEY="Enter your Service Role Key: "
echo.
echo Setting secret...
npx supabase secrets set PRIVATE_SERVICE_ROLE_KEY=%SERVICE_KEY%
echo.
echo ========================================
echo  Done! The secret has been set.
echo ========================================
echo.
echo You can now test the payment flow again.
echo.
pause
