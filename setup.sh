#!/bin/bash

echo "===================================="
echo " StoreRate - Setup Script (Mac/Linux)"
echo "===================================="
echo ""

echo "[1/4] Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then echo "ERROR: Backend npm install failed"; exit 1; fi

echo ""
echo "[2/4] Setting up backend .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created backend/.env from example."
    echo "IMPORTANT: Edit backend/.env with your PostgreSQL credentials!"
else
    echo ".env already exists, skipping."
fi

echo ""
echo "[3/4] Installing frontend dependencies..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then echo "ERROR: Frontend npm install failed"; exit 1; fi

echo ""
echo "[4/4] Setting up frontend .env file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created frontend/.env from example."
else
    echo ".env already exists, skipping."
fi

cd ..

echo ""
echo "===================================="
echo " Setup Complete!"
echo "===================================="
echo ""
echo "NEXT STEPS:"
echo "1. Edit backend/.env with your PostgreSQL credentials"
echo "2. Run the database schema:"
echo "   psql -U postgres -d store_rating_db -f backend/src/config/schema.sql"
echo "3. Start backend:  cd backend && npm run dev"
echo "4. Start frontend: cd frontend && npm start"
echo ""
echo "Default admin login: admin@storerating.com / Admin@1234"
