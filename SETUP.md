# AutoFlow Intelligence Setup Guide

## 1. Prerequisites
- Node.js v20+
- Docker & Docker Compose
- Git
- Solana CLI (for deploying the program on testnet)

## 2. Clone & Setup
Clone the repository, then copy the environment file:
```bash
cp .env.example .env
```
Open `.env` and fill in all the required API keys (Gemini, Pinata, Slack).

## 3. Deploy Solana Program
The audit registry needs to be deployed first so you have a program ID for the backend.
```bash
cd blockchain
npm install
anchor build
anchor deploy --provider.cluster testnet
```
Once deployed, copy the output program ID and update `PROGRAM_ID` in `.env`.

## 4. Start Services
Go back to the root directory and run Docker Compose to start the backend, database, redis, and n8n.
```bash
cd ..
docker-compose up -d --build
```

## 5. Import n8n Workflows
See the instructions in `n8n/README.md` to import all six workflows into your local n8n instance and configure the required credentials.

## 6. Verify Services
- **n8n**: http://localhost:5678 (admin / autoflow2026)
- **Backend**: http://localhost:3001/api/pipeline/status

## 7. Troubleshooting
- **Docker Issues**: Ensure ports 5432, 6379, 3001, and 5678 are free before starting.
- **n8n Imports**: If importing fails, ensure you copy the raw JSON of each workflow exactly.
- **Solana Faucets**: You will need test SOL for Testnet. Use `solana airdrop 2` or check online testnet faucets for free test tokens.
