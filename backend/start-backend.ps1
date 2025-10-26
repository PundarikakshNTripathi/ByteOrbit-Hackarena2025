# START BACKEND - Run this in PowerShell

# Navigate to backend directory
Set-Location -Path "C:\PROFESSIONAL\Hackathons\Hackarena2025\ByteOrbit-Hackarena2025\backend"

# Activate conda environment
conda activate CivicAgent

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
