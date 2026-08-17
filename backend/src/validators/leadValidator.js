const ALLOWED_STATUSES = ['new', 'contacted', 'qualified', 'lost'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates lead data for creation (POST /api/leads)
 */
export const validateCreateLead = (data) => {
  const errors = [];
  const { name, email, phone, status } = data;

  // Name validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and cannot be empty.');
  }

  // Email validation
  if (!email || typeof email !== 'string' || email.trim() === '') {
    errors.push('Email is required and cannot be empty.');
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push('Invalid email format. Please provide a valid email address.');
  }

  // Phone validation
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    errors.push('Phone is required and cannot be empty.');
  }

  // Status validation (optional on creation, defaults to 'new')
  if (status !== undefined && !ALLOWED_STATUSES.includes(status)) {
    errors.push(`Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      name: name ? name.trim() : '',
      email: email ? email.trim().toLowerCase() : '',
      phone: phone ? phone.trim() : '',
      status: status || 'new'
    }
  };
};

/**
 * Validates lead data for partial update (PATCH /api/leads/:id)
 */
export const validateUpdateLead = (data) => {
  const errors = [];
  const sanitizedData = {};

  if (!data || Object.keys(data).length === 0) {
    return {
      isValid: false,
      errors: ['At least one field (name, email, phone, or status) must be provided for update.'],
      sanitizedData: {}
    };
  }

  // Optional Name
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim() === '') {
      errors.push('Name cannot be empty.');
    } else {
      sanitizedData.name = data.name.trim();
    }
  }

  // Optional Email
  if (data.email !== undefined) {
    if (typeof data.email !== 'string' || data.email.trim() === '') {
      errors.push('Email cannot be empty.');
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.push('Invalid email format. Please provide a valid email address.');
    } else {
      sanitizedData.email = data.email.trim().toLowerCase();
    }
  }

  // Optional Phone
  if (data.phone !== undefined) {
    if (typeof data.phone !== 'string' || data.phone.trim() === '') {
      errors.push('Phone cannot be empty.');
    } else {
      sanitizedData.phone = data.phone.trim();
    }
  }

  // Optional Status
  if (data.status !== undefined) {
    if (!ALLOWED_STATUSES.includes(data.status)) {
      errors.push(`Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}.`);
    } else {
      sanitizedData.status = data.status;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
};
