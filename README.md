# Budget Buddy - Personal Finance Management App

## 📋 Project Overview
Budget Buddy is a comprehensive personal finance management application that helps users track expenses, set budgets, manage financial goals, and categorize transactions.

---

## Phase 4: React Frontend Development

### 🎯 Phase 4 Objectives Completed
- ✅ Set up React.js frontend application with modern tooling
- ✅ Created API service layer using Axios for backend integration
- ✅ Implemented React Router for navigation between pages
- ✅ Built Authentication UI (Login/Register) with form validation
- ✅ Developed Transactions UI with full CRUD operations (Create, Read, Update, Delete)
- ✅ Added client-side form validation (required fields, email, number validation)
- ✅ Implemented user-friendly error/success message components
- ✅ Created protected routes for authenticated users
- ✅ Integrated all CRUD operations with backend API (no hard-coded data)
- ✅ Added filtering, search, and pagination features in Transactions UI
- ✅ Implemented responsive design with modern UI/UX

### 🛠️ Technologies Used
- **React.js** - Frontend framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with modern design patterns
- **Context API** - State management for authentication

### 📁 Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Auth.css
│   │   ├── Home.css
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Message.css
│   │   ├── Message.js
│   │   ├── Navbar.css
│   │   ├── Navbar.js
│   │   ├── ProtectedRoute.js
│   │   ├── TransactionForm.css
│   │   ├── TransactionForm.js
│   │   ├── Transactions.css
│   │   └── Transactions.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── services/
│   │   └── api.js
│   ├── utils/
│   │   └── validation.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
└── package.json
```

### 🎨 Features Implemented

#### 1. Authentication System
- **Login Page**: Email and password authentication with validation
- **Register Page**: User registration with username, email, and password validation
- **Auth Context**: Global state management for user authentication
- **Protected Routes**: Routes that require authentication
- **Session Persistence**: User session stored in localStorage

#### 2. Transactions Management (Full CRUD)
- **Create Transaction**: Form with validation for:
  - Amount (number validation, positive values)
  - Type (income/expense)
  - Category (required field)
  - Date (date validation)
  - Payment method (dropdown selection)
  - Description (optional)
- **Read Transactions**: 
  - Display all transactions in a table format
  - Pagination support
  - Real-time data from MongoDB Atlas
- **Update Transaction**: Edit existing transactions with pre-filled form
- **Delete Transaction**: Delete with confirmation dialog
- **Filtering & Search**:
  - Search by description or category
  - Filter by type (income/expense)
  - Filter by category
  - Date range filtering (start date, end date)
  - Clear filters functionality

#### 3. Form Validation
- **Client-side validation** for all forms:
  - Required field validation
  - Email format validation
  - Number validation (positive numbers)
  - Minimum length validation (username, password)
  - Date validation
  - Real-time error display

#### 4. User Feedback
- **Success Messages**: Displayed after successful operations (create, update, delete)
- **Error Messages**: User-friendly error messages from API or validation
- **Loading States**: Loading indicators during API calls
- **Message Component**: Reusable component for all feedback

#### 5. Navigation & Routing
- **React Router**: Client-side routing
- **Navbar**: Navigation bar with user info and logout
- **Home Page**: Landing page with feature overview
- **Protected Routes**: Transactions page requires authentication

### 🔌 API Integration
All frontend operations are connected to the Express + MongoDB backend:
- **Auth API**: `/api/auth/login`, `/api/auth/register`
- **Transactions API**: 
  - `GET /api/transactions` - List with filters and pagination
  - `GET /api/transactions/:id` - Get single transaction
  - `POST /api/transactions` - Create transaction
  - `PUT /api/transactions/:id` - Update transaction
  - `DELETE /api/transactions/:id` - Delete transaction

### 🧪 Testing Instructions
1. **Start Backend Server**:
   ```bash
   cd Budget-Buddy
   npm start
   ```
   Server runs on `http://localhost:3001`

2. **Start Frontend Development Server**:
   ```bash
   cd Budget-Buddy/frontend
   npm start
   ```
   Frontend runs on `http://localhost:3000`

3. **Test Authentication**:
   - Navigate to Register page and create a new account
   - Login with registered credentials
   - Verify session persistence (refresh page)

4. **Test Transactions CRUD**:
   - **Create**: Click "Add Transaction", fill form, submit
   - **Read**: View transactions in table, test pagination
   - **Update**: Click "Edit" on a transaction, modify, save
   - **Delete**: Click "Delete" on a transaction, confirm
   - **Filter**: Use filters to search and filter transactions

5. **Test Validation**:
   - Try submitting forms with empty required fields
   - Enter invalid email format
   - Enter negative or zero amounts
   - Verify error messages display correctly

6. **Verify Backend Integration**:
   - Check MongoDB Atlas to verify data is being saved/updated/deleted
   - Verify all operations reflect in database

### 👥 Phase 4 Team Contributions

#### Abdallah Aidaruse
- React frontend project setup and configuration
- API service layer implementation with Axios
- Authentication context and state management
- Login and Register components with validation
- Protected routes implementation
- Home page and navigation components
- Form validation utilities
- Error and success message components
- README documentation for Phase 4

#### Yusuf Nur
- Transactions component with full CRUD operations
- Transaction form component with validation
- Filtering, search, and pagination features
- UI/UX design and styling (CSS)
- Responsive design implementation
- Table display and data formatting
- Modal form implementation
- Testing and bug fixes

### 🎉 Phase 4 Completion Status
**✅ ALL TASKS COMPLETED SUCCESSFULLY**

### 📝 Notes
- Backend API must be running for frontend to function
- Default API URL: `http://localhost:3001/api` (configurable via environment variable)
- Backend runs on port 3001, Frontend runs on port 3000
- User authentication is required to access Transactions page
- All form validations work both client-side and server-side
- Data is persisted in MongoDB Atlas and retrieved in real-time

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

1. **Clone the repository**
2. **Install backend dependencies**:
   ```bash
   cd Budget-Buddy
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd Budget-Buddy/frontend
   npm install
   ```

4. **Configure environment variables** (backend):
   - Create `.env` file in `Budget-Buddy/` directory
   - Add MongoDB connection string and other required variables

5. **Start backend server**:
   ```bash
   cd Budget-Buddy
   npm start
   ```

6. **Start frontend development server** (in a new terminal):
   ```bash
   cd Budget-Buddy/frontend
   npm start
   ```

7. **Access the application**:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001/api`

---

## 📄 License
MIT

## 👥 Authors
- Abdallah Aidaruse
- Yusuf Nur
