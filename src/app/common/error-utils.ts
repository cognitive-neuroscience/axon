/**
 * Utility functions for safely handling errors without causing DataCloneError
 * when passing through Angular Router state
 */

/**
 * Safely extracts error information from any type of error object
 * without passing non-serializable objects through router state
 */
export function getSafeErrorInfo(err?: any): string {
    let errorMessage = 'An error occurred';
    let errorDetails = '';

    if (err) {
        if (typeof err === 'string') {
            errorMessage = err;
        } else if (err instanceof Error) {
            errorMessage = err.message;
            errorDetails = err.stack || '';
        } else if (err && typeof err === 'object') {
            // Handle HttpErrorResponse and other objects
            if (err.message) {
                errorMessage = err.message;
            } else if (err.error) {
                errorMessage = typeof err.error === 'string' ? err.error : 'HTTP Error';
            } else if (err.status) {
                errorMessage = `HTTP ${err.status}: ${err.statusText || 'Request failed'}`;
            }

            // Safely extract additional details
            if (err.status) {
                errorDetails = `Status: ${err.status}`;
                if (err.statusText) {
                    errorDetails += ` - ${err.statusText}`;
                }
            }
        }
    }

    return `${errorMessage}\n${errorDetails}`.trim();
}
