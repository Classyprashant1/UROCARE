/**
 * Standardized database error format.
 */
export interface DbResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Handles Zod validation errors and returns a formatted DbResult.
 */
export function handleZodError(error: any): DbResult<any> {
  return {
    success: false,
    error: "Validation failed. Please check the fields and try again.",
    fieldErrors: error.flatten().fieldErrors,
  };
}

/**
 * Handles Supabase database errors and returns a formatted DbResult.
 */
export function handleSupabaseError(error: any): DbResult<any> {
  console.error("[DB ERROR]:", error);
  
  // Custom message mapping based on Postgres error codes could go here
  // e.g. '23505' -> 'This record already exists'
  let message = "An unexpected error occurred while saving your data.";
  
  if (error?.code === '23505') {
    message = "This time slot is already booked or the record already exists.";
  } else if (error?.message) {
    message = error.message;
  }

  return {
    success: false,
    error: message,
  };
}
