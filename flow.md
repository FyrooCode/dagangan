# Dagangan - Business Management Platform

**Dagangan** (Indonesian/Malay for "merchandise" or "goods") is a comprehensive **e-commerce and supply chain management platform** designed to help businesses manage products, shipments, returns, payments, and partner relationships efficiently.

---

## 📊 Business Purpose & Use Case

Dagangan serves as a centralized hub for businesses to:

- **Manage Product Inventory**: Track product details, quantities, and availability
- **Coordinate Shipments**: Create, monitor, and manage shipping operations
- **Handle Returns & Refunds**: Process product returns and monitor return analytics
- **Track Revenue & Payments**: Visualize payment histories and financial performance
- **Manage Partnerships**: Maintain partner information and collaboration
- **Monitor Business Metrics**: View dashboard analytics including product performance, revenue trends, and return analysis

### Target Users
- E-commerce business owners
- Supply chain managers
- Customer service teams
- Finance/billing departments
- Partnership managers

---

## 🔄 Business Workflow

### 1. **Authentication & Access Control**
   - Users log in via email/password (Supabase Auth)
   - Session-based access control ensures only authorized users access protected routes
   - Automatic redirect to login if session expires

### 2. **Dashboard Overview**
   - Quick view of key business metrics
   - Revenue area charts
   - Product quantity and top-performing products
   - Return product analytics
   - All data updates in real-time

### 3. **Product Management**
   - View and manage product catalog
   - Track product details and specifications
   - Monitor stock levels
   - Analyze product performance via dashboard charts

### 4. **Shipment Operations**
   - **Create Shipments**: Initiate new orders/shipments
   - **Track Shipments**: View all active and completed shipments
   - **Edit Shipments**: Update shipment information as needed
   - Integration with returns management (shipments can trigger return requests)

### 5. **Returns Management**
   - **Create Returns**: Process product returns linked to specific shipments
   - **Monitor Returns**: Track all returns with status and reason
   - **Analytics**: View top returned products and return trends
   - Integrated with shipment module for traceability

### 6. **Payment Tracking**
   - View payment history and transactions
   - Track payment status and amounts
   - Financial overview and reconciliation

### 7. **Partner Management**
   - Maintain supplier and partner information
   - Manage partner relationships and contracts
   - Track partner performance

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Vue 3 (Composition API)
- **Language**: TypeScript for type safety
- **Build Tool**: Vite (optimized bundling)
- **State Management**: Pinia (centralized store for auth, theme, etc.)
- **Routing**: Vue Router (protected route guards)
- **Styling**: Metronic UI framework (pre-built components and themes)

### Backend Stack
- **Database & Auth**: Supabase (PostgreSQL + Authentication)
- **API**: Supabase client library for real-time operations

### Key Features
- **Dark/Light Theme Support**: Toggle theme preference stored in Pinia
- **TypeScript Support**: Full type checking with `vue-tsc`
- **PWA Ready**: Progressive Web App configuration via Vite plugin
- **Bundle Analysis**: Includes bundle plugins and custom scripts

---

## 📁 Project Structure

```
src/
├── views/              # Page components
│   ├── Dashboard.vue          # Analytics dashboard
│   ├── Login.vue              # Authentication page
│   ├── products/              # Product management
│   ├── shipments/             # Shipment CRUD operations
│   ├── returns/               # Return management
│   ├── payments/              # Payment tracking
│   └── partners/              # Partner management
├── services/           # Business logic & API calls
│   ├── AuthService.ts         # Authentication operations
│   ├── ProductService.ts      # Product CRUD
│   ├── ShipmentService.ts     # Shipment operations
│   ├── ReturnService.ts       # Return operations
│   ├── PaymentService.ts      # Payment tracking
│   ├── PartnerService.ts      # Partner management
│   └── DashboardService.ts    # Analytics data
├── stores/             # Pinia state management
│   ├── auth.ts               # User session state
│   ├── theme.ts              # Dark/light theme state
│   └── counter.ts            # Example store
├── components/         # Reusable Vue components
│   ├── layout/               # Header, Sidebar, Footer
│   └── chart/                # Dashboard charts
├── layouts/            # Page layouts
│   ├── DefaultLayout.vue     # Main app layout
│   └── AuthLayout.vue        # Auth page layout
├── router/             # Vue Router configuration
└── lib/                # Utilities & clients
    └── supabase.ts          # Supabase client setup

public/
├── assets/             # Static assets & Metronic UI
│   ├── css/                  # Compiled stylesheets
│   ├── js/                   # Bundled scripts
│   ├── media/                # Images and media
│   └── plugins/              # Third-party plugins
```

---

## 🚀 Development & Deployment

### Prerequisites
- Node.js: `^20.19.0` or `>=22.12.0`
- npm package manager

### Setup & Running

```bash
# Install dependencies
npm install

# Development server with hot-reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Preview production build
npm run preview
```

### Development Environment
- Vite dev server runs on `http://localhost:5173` by default
- Hot module replacement (HMR) for instant updates
- Vue DevTools integration for debugging

---

## 🔐 Security Features

- **Authentication**: Supabase Auth with secure session management
- **Route Protection**: `requiresAuth` meta guards prevent unauthorized access
- **Type Safety**: TypeScript prevents runtime errors
- **CORS & API Security**: Supabase handles secure API communication

---

## 📊 Data Flow

```
User Login
    ↓
Supabase Auth → Session Created
    ↓
Access Protected Routes (Dashboard, Products, Shipments, etc.)
    ↓
Services fetch data from Supabase
    ↓
Pinia stores update UI state
    ↓
Components re-render with latest data
```

---

## 🛠️ IDE & Browser Setup

### Recommended IDE
[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Debugging Tools
- **Chrome/Edge/Brave**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools addon](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

---

## 📝 License

This project is part of the Dagangan business platform suite.
