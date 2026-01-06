import { supabase } from './supabase';

export interface UploadResponse {
  success: boolean;
  data?: { path: string; url: string };
  error?: string;
}

/**
 * Upload document to storage
 */
export const uploadDocument = async (
  userId: string,
  file: { uri: string; name: string; type: string },
  documentType: string
): Promise<UploadResponse> => {
  try {
    const fileName = `${userId}/${documentType}/${Date.now()}-${file.name}`;
    
    // Convert file URI to blob
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, blob, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    return {
      success: true,
      data: { path: fileName, url: urlData.publicUrl },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Upload insurance card image
 */
export const uploadInsuranceCard = async (
  userId: string,
  file: { uri: string; name: string; type: string }
): Promise<UploadResponse> => {
  return uploadDocument(userId, file, 'insurance-cards');
};

/**
 * Upload lab result
 */
export const uploadLabResult = async (
  labRequestId: string,
  file: { uri: string; name: string; type: string }
): Promise<UploadResponse> => {
  try {
    const fileName = `lab-results/${labRequestId}/${Date.now()}-${file.name}`;
    
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('lab-results')
      .upload(fileName, blob, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('lab-results')
      .getPublicUrl(fileName);

    return {
      success: true,
      data: { path: fileName, url: urlData.publicUrl },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (
  userId: string,
  file: { uri: string; name: string; type: string }
): Promise<UploadResponse> => {
  try {
    const fileName = `profiles/${userId}/avatar-${Date.now()}.jpg`;
    
    const response = await fetch(file.uri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update user profile with avatar URL
    await supabase
      .from('users')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId);

    return {
      success: true,
      data: { path: fileName, url: urlData.publicUrl },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Delete file from storage
 */
export const deleteFile = async (bucket: string, filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

/**
 * Get file URL
 */
export const getFileUrl = (bucket: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};
