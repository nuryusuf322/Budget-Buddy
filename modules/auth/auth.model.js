const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const dataPath = path.join(__dirname, '../../../data/users.json');

// Helper functions
const readUsers = async () => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeUsers = async (users) => {
  try {
    await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
  } catch (error) {
    throw new Error('Error saving users');
  }
};

// GET all users (without passwords)
const getAllUsers = async () => {
  try {
    const users = await readUsers();
    return users.map(({ password, ...user }) => user);
  } catch (error) {
    throw error;
  }
};

// GET user by ID
const getUserById = async (id) => {
  try {
    const users = await readUsers();
    const user = users.find(u => u.user_id === id);
    if (!user) return null;
    
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// GET user by email
const getUserByEmail = async (email) => {
  try {
    const users = await readUsers();
    return users.find(u => u.email === email) || null;
  } catch (error) {
    throw error;
  }
};

// REGISTER new user
const registerUser = async (userData) => {
  try {
    const users = await readUsers();
    
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user ID
    const newUserId = 'user' + Date.now();
    
    const newUser = {
      user_id: newUserId,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      currency: userData.currency || 'USD',
      monthly_income: userData.monthly_income || 0,
      financial_goals: userData.financial_goals || [],
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeUsers(users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// LOGIN user
const loginUser = async (email, password) => {
  try {
    const user = await getUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

// UPDATE user profile
const updateUserProfile = async (id, updateData) => {
  try {
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.user_id === id);
    
    if (userIndex === -1) {
      return null;
    }

    // If updating password, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      user_id: id // Don't change ID
    };

    await writeUsers(users);
    
    // Return user without password
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  registerUser,
  loginUser,
  updateUserProfile
};