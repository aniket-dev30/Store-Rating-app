@echo off
echo ====================================
echo  StoreRate - Setup Script (Windows)
echo ====================================
echo.

echo [1/4] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Backend npm install failed & pause & exit /b 1 )

echo.
echo [2/4] Setting up backend .env file...
if not exist .env (
    copy .env.example .env
    echo Created backend/.env from example.
    echo IMPORTANT: Edit backend/.env with your PostgreSQL credentials!
) else (
    echo .env already exists, skipping.
)

echo.
echo [3/4] Installing frontend dependencies...
cd ../frontend
call npm install
if %errorlevel% neq 0 ( echo ERROR: Frontend npm install failed & pause & exit /b 1 )

echo.
echo [4/4] Setting up frontend .env file...
if not exist .env (
    copy .env.example .env
    echo Created frontend/.env from example.
) else (
    echo .env already exists, skipping.
)

cd ..

echo.
echo ====================================
echo  Setup Complete!
echo ====================================
echo.
echo NEXT STEPS:
echo 1. Edit backend/.env with your PostgreSQL credentials
echo 2. Run the database schema:
echo    psql -U postgres -d store_rating_db -f backend/src/config/schema.sql
echo 3. Start the backend:  cd backend ^&^& npm run dev
echo 4. Start the frontend: cd frontend ^&^& npm start
echo.
echo Default admin login: admin@storerating.com / Admin@1234
echo.
pause
