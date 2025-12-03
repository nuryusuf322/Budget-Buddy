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

## Phase 5: Authentication, Authorization & Email-Based MFA

### 🎯 Phase 5 Objectives Completed
- ✅ Implemented JWT-based token authentication
- ✅ Added email-based Multi-Factor Authentication (OTP)
- ✅ Created Role-Based Access Control (RBAC) system
- ✅ Protected all backend routes with authentication middleware
- ✅ Implemented role-based route authorization
- ✅ Created OTP verification flow in frontend
- ✅ Updated login flow to include OTP verification step
- ✅ Added JWT token storage and automatic attachment to API requests
- ✅ Implemented role-based UI elements (showing/hiding based on user role)
- ✅ Added token expiration handling and automatic logout

### 🛠️ Technologies Used
- **jsonwebtoken** - JWT token generation and verification
- **nodemailer** - Email service for OTP delivery
- **MongoDB** - OTP storage with automatic expiration
- **Express Middleware** - Authentication and authorization middleware

### 🔐 Authentication Flow

#### 1. User Roles
- **user** - Default role for regular users (can only access their own data)
- **admin** - Full access to all data and user management
- **manager** - Can access all data but limited user management

#### 2. Login with MFA Flow
1. User enters email and password
2. Backend validates credentials
3. Backend generates 6-digit OTP and sends to user's email
4. OTP is stored in database with 10-minute expiration
5. User is redirected to OTP verification page
6. User enters OTP code
7. Backend verifies OTP
8. Backend generates and returns JWT token
9. Frontend stores token and redirects to Transactions page

#### 3. Protected Routes

**Public Routes** (No authentication required):
- `GET /` - API welcome message
- `GET /api/test` - API test endpoint
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (sends OTP)
- `POST /api/auth/verify-otp` - OTP verification

**Protected Routes** (Require valid JWT token):
- All transaction routes (`/api/transactions/*`)
- All budget routes (`/api/budgets/*`)
- All goal routes (`/api/goals/*`)
- All category routes (`/api/categories/*`)
- `GET /api/auth/users` - List all users
- `GET /api/auth/users/:id` - Get user by ID
- `PUT /api/auth/users/:id` - Update user (users can only update themselves)

**Role-Restricted Routes** (Require specific roles):
- `DELETE /api/auth/users/:id` - Requires `admin` or `manager` role

#### 4. Authorization Rules
- **Regular users** (`user` role): Can only access their own transactions, budgets, goals, and categories
- **Admins/Managers**: Can access all users' data
- **User updates**: Users can only update their own profile unless they're admin/manager

### 📧 Email Configuration

To enable OTP email sending, configure these environment variables in `.env`:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

**For Gmail:**
1. Enable 2-Step Verification on your Google account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password as `EMAIL_PASS`

### 🔒 Security Features

1. **JWT Tokens**: 
   - Tokens expire after 24 hours (configurable)
   - Tokens are stored in localStorage
   - Automatically attached to all API requests
   - Automatic logout on token expiration

2. **OTP Security**:
   - 6-digit numeric OTP
   - 10-minute expiration
   - Maximum 5 verification attempts
   - OTP deleted after successful verification

3. **Password Security**:
   - Currently stored as plain text (should be hashed in production)
   - Minimum 6 characters required

4. **Role-Based Access**:
   - Middleware checks user role before allowing access
   - Frontend hides UI elements based on user role

### 🧪 Testing Scenarios

#### Test Cases Implemented:
1. ✅ Login with valid credentials → OTP sent
2. ✅ Login with invalid credentials → Error message
3. ✅ OTP verification with correct code → JWT token received
4. ✅ OTP verification with incorrect code → Error message
5. ✅ OTP expiration after 10 minutes
6. ✅ Accessing protected routes without token → 401 Unauthorized
7. ✅ Accessing role-restricted routes with wrong role → 403 Forbidden
8. ✅ User can only access their own data
9. ✅ Admin/Manager can access all data
10. ✅ Token expiration handling → Auto logout

### 👥 Phase 5 Team Contributions

#### Abdallah Aidaruse
- JWT token implementation and utilities
- OTP service creation (generate, send email, verify)
- Email configuration and nodemailer setup
- Authentication middleware implementation
- OTP verification route
- Updated login flow to include OTP
- Frontend OTP verification component
- Token storage and API interceptor setup
- README documentation for Phase 5

#### Yusuf Nur
- Role-Based Access Control (RBAC) middleware
- User model role field addition
- Route protection implementation
- Authorization rules for all routes
- Frontend role-based UI elements
- Protected route component updates
- Testing and validation of authentication flow
- Bug fixes and security improvements

### 🎉 Phase 5 Completion Status
**✅ ALL TASKS COMPLETED SUCCESSFULLY**

### 📝 Phase 5 Notes
- Email service requires proper configuration in `.env` file
- OTP expires after 10 minutes
- JWT tokens expire after 24 hours (configurable)
- All protected routes require valid JWT token
- Role-based access control enforced on both backend and frontend
- Users can only access their own data unless they have admin/manager role

---

## Additional Features & Enhancements

### 🎯 Enhanced Features Implemented

#### 1. Budget Management Enhancements
- ✅ **Category-Specific Budgets**: Set spending limits for individual expense categories (e.g., Groceries, Entertainment)
- ✅ **Monthly Budget Limits**: Set an overall monthly spending limit that applies to all expenses
- ✅ **Automatic Budget Warnings**: Real-time warnings when budgets are exceeded
- ✅ **Budget Recalculation**: Manual and automatic recalculation of budget spending from transactions
- ✅ **Budget Progress Tracking**: Visual progress bars showing spending against limits
- ✅ **Unified Budget Form**: Single form interface to create both category and monthly budgets

#### 2. Category Management
- ✅ **Category Creation**: Create custom expense and income categories
- ✅ **Automatic Color Coding**: 
  - Green for income categories
  - Red for expense categories
- ✅ **Category Dropdown**: Transaction form uses dropdown populated from created categories (prevents spelling errors)
- ✅ **Category Filtering**: Filter categories by type (all/expense/income)

#### 3. Advanced Analytics & Insights
- ✅ **Monthly Spending Overview**: Comprehensive dashboard showing:
  - Total Spending (current month)
  - Total Income (current month)
  - Average Per Transaction
  - Net Balance (Income vs Spending comparison)
  - Spending Ratio (percentage of income spent)
- ✅ **Real-time Statistics**: Automatically updates when transactions are created, updated, or deleted
- ✅ **Visual Indicators**: Color-coded cards (green for positive balance, red for overspending)

#### 4. Transaction Management Improvements
- ✅ **Date Timezone Fix**: Fixed date display issues to show correct dates regardless of timezone
- ✅ **Category Dropdown Integration**: Transaction form uses category dropdown instead of free text input
- ✅ **Budget Warning Integration**: Transaction creation shows warnings if budget limits are exceeded
- ✅ **Automatic Budget Updates**: Budget spending automatically updates when transactions are created, updated, or deleted

#### 5. User Experience Enhancements
- ✅ **Improved UI Layout**: Consistent structure across all pages (Transactions, Budgets, Categories)
- ✅ **Better Spacing**: Improved button spacing and layout
- ✅ **Clear Visual Feedback**: Enhanced warning messages and success notifications
- ✅ **Responsive Design**: All features work seamlessly on different screen sizes

### 🛠️ Technical Improvements
- ✅ **Route Order Optimization**: Fixed route ordering to prevent conflicts (monthly budget routes before generic routes)
- ✅ **Date Handling**: Proper UTC date handling to prevent timezone-related display issues
- ✅ **Error Handling**: Improved error messages and validation feedback
- ✅ **Code Organization**: Better code structure and component organization

### 📊 Features Summary

**Budget Features:**
- Category-specific budget limits
- Overall monthly budget limits
- Automatic budget recalculation
- Real-time budget warnings
- Budget progress visualization

**Analytics Features:**
- Monthly spending overview
- Income vs spending comparison
- Average transaction calculation
- Net balance tracking
- Spending ratio analysis

**Category Features:**
- Custom category creation
- Automatic color assignment
- Category type filtering
- Dropdown integration in forms

**Transaction Features:**
- Accurate date display
- Category dropdown selection
- Budget integration
- Enhanced filtering and search

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
   - Add the following variables:
     ```env
     MONGODB_URL=your-mongodb-connection-string
     PORT=3001
     NODE_ENV=development
     JWT_SECRET=your-secret-key-change-in-production
     JWT_EXPIRES_IN=24h
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-app-password
     ```
   - For Gmail: Enable 2-Step Verification and create an App Password

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
