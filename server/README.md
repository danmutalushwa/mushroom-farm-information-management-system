# Mushroom Farm Information Management System

An enterprise-grade, web-based information management ecosystem designed to fully automate smart agricultural operations. The system streamlnes commercial mushroom farming by managing lifecycle growth, automated tracking pipelines, role-mapping protocols, and asset cloud storage.

---

## Key System Features

- **Production Lifecycle Tracking:** Monitored via precise cultivation runs (`ProductBatch`) mapping incubation phases, growth metrics, and structural crop yield tracking.
- **Inventory & Supply Control:** Automated shelf-life metrics and instant material usage logs preventing workflow exhaustion.
- **Dynamic Role-Based Notifications:** Cross-department messaging engine allowing administrators to broadcast target alerts cleanly to specific operational tiers (`Farm Worker`, `Inventory Officer`, etc.).
- **Cloud Media Pipeline:** Secure image storage integration optimized via Multer to pipe multi-part payloads instantly to Cloudinary, paired with automatic temporary disk storage cleanups.
- **Advanced Access Architecture:** Granular endpoint security layers guarded by custom token verification and case-insensitive role restriction matrices.
- **Transactional Management:** Full-cycle order processing, real-time invoicing, customer tracking, and operational sales accounting.
- **Analytical Reporting:** Automated generation of data aggregates, system logs, and business performance tracking panels.

---

## Technologies Used

### Backend

- **Node.js** & **Express.js** (High-performance server architecture)
- **MongoDB** & **Mongoose** (Flexible document schema data engines)
- **Cloudinary SDK v2** (Cloud media asset distribution networks)
- **Multer** & **path-to-regexp v8** (Multipart binary streams parsing)

### Frontend

- **React.js** (Component-driven client interface workspace)

### Tools & Deployment

- **Git** / **GitHub** (Version control and codebase management)
- **Postman** (API payload validation and route testing suites)
- **@dotenvx/dotenvx** (Secure system environment variable injection)

---

## Project Structure

```text
mushroom-farm/
├── server/             # Express.js REST API engine
│   ├── src/
│   │   ├── config/      # Cloudinary, Database, and JWT setups
│   │   ├── controllers/ # HTTP boundary response handlers
│   │   ├── middlewares/ # Security guards and file stream capture filters
│   │   ├── models/      # Mongoose schemas (User, Customer, ProductBatch)
│   │   └── services/    # Core business execution pipelines
│   └── package.json
└── client/             # React.js web client interface application
```

---

## Installation & Local Deployment

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/mushroom-farm-information-management-system.git
cd mushroom-farm/server
```

### 2. Initialize System Environment Properties

Create a `.env` file inside your server root directory folder workspace to configure your local keys parameters securely:

```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mushroom_farm_db

JWT_SECRET=your_strong_jwt_secret_hash_here
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install dependencies & launch the server

```bash
npm install
npm run dev
```

The backend engine will spin up and accept communication hooks on communication channel port `5000`.

---

## Academic Author

**Mutalushwa Dan**  
_Bachelor of Information Technology_  
**University of Kigali**
