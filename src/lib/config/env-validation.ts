// Environment variables validation utility

import { validateGeoapifyApiKey } from '../api/geoapify';

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

  // Check OpenRouter DS_KEY (required for core functionality)
  if (!process.env.DS_KEY || process.env.DS_KEY.trim() === '') {
    missingKeys.push('DS_KEY');
    errors.push('OpenRouter DS_KEY is missing or invalid');
  }

  // Check Geoapify API key (optional - only warn if missing)
  if (!validateGeoapifyApiKey()) {
    console.warn('Geoapify API key is missing or invalid. Distance calculations will use fallback estimates.');
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
    openrouter: {
      configured: !!(process.env.DS_KEY && process.env.DS_KEY.trim() !== ''),
      keyPresent: !!(process.env.DS_KEY && process.env.DS_KEY.trim() !== '')
    },
    geoapify: {
      configured: validateGeoapifyApiKey(),
      keyPresent: !!(process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY && process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY.trim() !== '')
    }
  };
}

// Log API status (for development)
export function logApiStatus() {
  const status = getApiStatus();
  console.log('API Configuration Status:', {

    geoapify: status.geoapify.configured ? '✅ Ready' : '❌ Not configured'
  });

  if (!status.geoapify.configured) {
    console.warn('Some APIs are not properly configured. Check your .env file.');
  }
}