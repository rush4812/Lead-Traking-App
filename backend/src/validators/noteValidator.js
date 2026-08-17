/**
 * Validates note creation data (POST /api/leads/:id/notes)
 */
export const validateCreateNote = (data) => {
  const errors = [];
  const { content } = data;

  if (!content || typeof content !== 'string' || content.trim() === '') {
    errors.push('Note content is required and cannot be empty.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: {
      content: content ? content.trim() : ''
    }
  };
};
