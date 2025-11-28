export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const validateNumber = (value) => {
  return !isNaN(value) && parseFloat(value) > 0;
};

export const validateDate = (date) => {
  return date && !isNaN(Date.parse(date));
};

export const validateMinLength = (value, minLength) => {
  return value && value.toString().length >= minLength;
};

export const validateTransaction = (transaction) => {
  const errors = {};

  if (!validateRequired(transaction.user_id)) {
    errors.user_id = 'User ID is required';
  }

  if (!validateRequired(transaction.amount)) {
    errors.amount = 'Amount is required';
  } else if (!validateNumber(transaction.amount)) {
    errors.amount = 'Amount must be a positive number';
  }

  if (!validateRequired(transaction.type)) {
    errors.type = 'Type is required';
  } else if (!['income', 'expense'].includes(transaction.type)) {
    errors.type = 'Type must be either income or expense';
  }

  if (!validateRequired(transaction.category)) {
    errors.category = 'Category is required';
  }

  if (!validateRequired(transaction.date)) {
    errors.date = 'Date is required';
  } else if (!validateDate(transaction.date)) {
    errors.date = 'Date must be a valid date';
  }

  if (!validateRequired(transaction.payment_method)) {
    errors.payment_method = 'Payment method is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateUser = (user, isRegister = false) => {
  const errors = {};

  if (isRegister) {
    if (!validateRequired(user.username)) {
      errors.username = 'Username is required';
    } else if (!validateMinLength(user.username, 3)) {
      errors.username = 'Username must be at least 3 characters long';
    }
  }

  if (!validateRequired(user.email)) {
    errors.email = 'Email is required';
  } else if (!validateEmail(user.email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!validateRequired(user.password)) {
    errors.password = 'Password is required';
  } else if (!validateMinLength(user.password, 6)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};


