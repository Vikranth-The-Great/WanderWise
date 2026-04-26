// Environment variables validation utility

export interface ApiValidationResult {
  isValid: boolean;
  missingKeys: string[];
  errors: string[];
}

// Validate all required environment variables
/**
 * Checks if all required environment variables are set and valid.
 * @returns Object indicating validity, missing keys, and error messages.
 */
export function validateEnvironmentVariables(): ApiValidationResult {
  const missingKeys: string[] = [];
  const errors: string[] = [];

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
    missingKeys.push('OPENAI_API_KEY');
    errors.push('OPENAI_API_KEY is missing or invalid');
  }

  if (!process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY.trim() === '') {
    missingKeys.push('GOOGLE_MAPS_API_KEY');
    errors.push('GOOGLE_MAPS_API_KEY is missing or invalid');
  }

  return {
    isValid: missingKeys.length === 0,
    missingKeys,
    errors
  };
}

// Check if APIs are ready for use
export function areApisReady(): boolean {
  const validation = validateEnvironmentVariables();
  return validation.isValid;
}

// Get API status for debugging
export function getApiStatus() {
  return {
    openai: {
      configured: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== ''),
      keyPresent: !!(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '')
    },
    googleMaps: {
      configured: !!(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY.trim() !== ''),
      keyPresent: !!(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY.trim() !== '')
    }
  };
}

// Log API status (for development)
export function logApiStatus() {
  const status = getApiStatus();
  console.log('API Configuration Status:', {
    openai: status.openai.configured ? '✅ Ready' : '❌ Not configured',
    googleMaps: status.googleMaps.configured ? '✅ Ready' : '❌ Not configured'
  });

  if (!status.openai.configured || !status.googleMaps.configured) {
    console.warn('Some APIs are not properly configured. Check your .env file.');
  }
}