export function validateImageFile(file: File, maxSizeMB: number = 5): { success: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { success: false, error: 'File is empty.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { success: false, error: `File is too large. Maximum size is ${maxSizeMB}MB.` };
  }

  return { success: true };
}
