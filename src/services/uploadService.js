import axiosClient from '@/api/axiosClient';
import { ENDPOINTS } from '@/api/endpoints';

export const uploadService = {
  /**
   * Upload a single file (image or document)
   * @param {File} file
   * @param {string} folder - 'requests' | 'documents' | 'profiles'
   */
  async uploadFile(file, folder = 'requests') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await axiosClient.post(ENDPOINTS.UPLOAD.SINGLE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Upload multiple files
   * @param {FileList | File[]} files
   * @param {string} folder - 'requests' | 'documents' | 'profiles'
   */
  async uploadFiles(files, folder = 'requests') {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    formData.append('folder', folder);

    const response = await axiosClient.post(ENDPOINTS.UPLOAD.MULTIPLE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};
