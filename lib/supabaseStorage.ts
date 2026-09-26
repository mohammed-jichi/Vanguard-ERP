/**
 * Vanguard ERP - Global Supabase Cloud Asset Storage Engine
 * Provides resilient cloud storage upload for tenant logos, legal certificates,
 * brand assets, and user avatars to Supabase Storage ('brand-assets' bucket).
 */

import { supabase } from './supabaseClient';

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const BRAND_ASSETS_BUCKET = 'brand-assets';

/**
 * Uploads a File or Blob to Supabase Storage and returns its persistent public URL.
 * Handles filename sanitization, content-type detection, and error reporting.
 */
export async function uploadBrandAsset(
  file: File | Blob,
  fileNamePrefix: string = 'logo',
  tenantId: string = '00000000-0000-0000-0000-000000000001'
): Promise<StorageUploadResult> {
  try {
    if (!file) {
      return { success: false, error: 'No file provided for upload.' };
    }

    // Determine extension
    let extension = 'png';
    if (file instanceof File && file.name) {
      const ext = file.name.split('.').pop();
      if (ext) extension = ext.toLowerCase();
    } else if (file.type) {
      const match = file.type.match(/image\/(png|jpe?g|webp|svg\+xml|gif)/);
      if (match) {
        extension = match[1] === 'jpeg' ? 'jpg' : match[1] === 'svg+xml' ? 'svg' : match[1];
      }
    }

    // Clean tenant prefix
    const cleanTenantId = (tenantId || '00000000-0000-0000-0000-000000000001').replace(/[^a-zA-Z0-9_-]/g, '');
    const timestamp = Date.now();
    const filePath = `${cleanTenantId}/${fileNamePrefix}_${timestamp}.${extension}`;

    // Attempt upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BRAND_ASSETS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'image/png'
      });

    if (error) {
      console.warn('Supabase storage upload notice:', error.message);
      return {
        success: false,
        error: `Supabase Storage upload: ${error.message}`
      };
    }

    // Retrieve public URL
    const { data: urlData } = supabase.storage
      .from(BRAND_ASSETS_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return {
        success: false,
        error: 'Failed to generate public URL for uploaded asset.'
      };
    }

    return {
      success: true,
      url: urlData.publicUrl
    };
  } catch (err: any) {
    console.error('Exception during Supabase storage upload:', err);
    return {
      success: false,
      error: err?.message || 'Unexpected exception during file upload.'
    };
  }
}

/**
 * Uploads a Data URL (base64) or direct HTTPS URL to Supabase Storage.
 * If already a remote HTTPS URL, returns it directly.
 */
export async function uploadDataUrlToStorage(
  dataUrl: string,
  fileNamePrefix: string = 'logo',
  tenantId: string = '00000000-0000-0000-0000-000000000001'
): Promise<StorageUploadResult> {
  if (!dataUrl) {
    return { success: false, error: 'No image data provided.' };
  }

  // Already a persistent public HTTP/HTTPS URL
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return { success: true, url: dataUrl };
  }

  // If base64 data URL, convert to Blob and upload
  if (dataUrl.startsWith('data:')) {
    try {
      const arr = dataUrl.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/png';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      return await uploadBrandAsset(blob, fileNamePrefix, tenantId);
    } catch (e: any) {
      return { success: false, error: `Failed to process image data: ${e.message}` };
    }
  }

  return { success: false, error: 'Invalid image format provided.' };
}
