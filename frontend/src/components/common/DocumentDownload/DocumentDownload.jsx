import React, { useState, useEffect } from 'react';
import { BiDownload } from 'react-icons/bi';
import { toast } from 'react-toastify';
import '../../../styles/components/common/DocumentDownload.css';

const DocumentDownload = ({ 
  system, 
  recordId, 
  documentType = 'documents',
  buttonText = 'Download',
  buttonClass = 'document-download-btn btn-outline-secondary btn-sm',
  showIcon = true,
  filePath = null, // Add filePath prop for direct file access
  fileName = null  // Add fileName prop for the actual filename
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!system || !recordId) {
      toast.error('Missing system or record ID for download');
      return;
    }

    setIsLoading(true);
    try {
      // Use direct file path if provided, otherwise fall back to API
      if (filePath && fileName) {
        await downloadDirectFile(filePath, fileName);
      } else {
        // Fallback to API method (for backward compatibility)
        await downloadViaAPI();
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDirectFile = async (filePath, fileName) => {
    try {
      // Use VITE_DOWNLOAD_URL for file downloads, fallback to API URL, then default
      const downloadBaseUrl = import.meta.env.VITE_DOWNLOAD_URL 
        || import.meta.env.VITE_API_URL?.replace('/api', '') 
        || 'http://localhost:4000';
      
      // filePath already includes /uploads/..., so we just need the base URL
      // If VITE_DOWNLOAD_URL is set to http://localhost:4000/uploads, we need to remove /uploads from filePath
      let finalFilePath = filePath;
      if (downloadBaseUrl.endsWith('/uploads') && filePath.startsWith('/uploads')) {
        // Remove /uploads from filePath since it's already in the base URL
        finalFilePath = filePath.replace(/^\/uploads/, '');
      }
      
      const fileUrl = `${downloadBaseUrl}${finalFilePath}`;
      
      console.log('Downloading file from:', fileUrl);
      console.log('Download base URL:', downloadBaseUrl);
      console.log('Original file path:', filePath);
      console.log('Final file path:', finalFilePath);
      
      // Fetch the file
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get the file as blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading direct file:', error);
      toast.error('Failed to download file');
    }
  };

  const downloadViaAPI = async () => {
    try {
      // This is the old API method - keeping for backward compatibility
      const { documentDownloadAPI } = await import('../../../services/api');
      
      // Get document list for this specific record
      const response = await documentDownloadAPI.getDocumentList(system, recordId);
      
      if (response.success && response.data && response.data.length > 0) {
        // If there are documents, download the first one directly
        const document = response.data[0];
        await downloadDocument(document.filename);
      } else {
        toast.info('No documents found for this record');
      }
    } catch (error) {
      console.error('Error downloading via API:', error);
      toast.error('Failed to download document');
    }
  };

  const downloadDocument = async (filename) => {
    try {
      const { documentDownloadAPI } = await import('../../../services/api');
      const response = await documentDownloadAPI.downloadDocument(system, recordId, documentType, filename);
      
      // Create blob and download - handle response properly
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  return (
    <button
      className={buttonClass}
      onClick={handleDownload}
      disabled={isLoading}
      title="Download Documents"
    >
      {isLoading ? (
        <span className="spinner" role="status" aria-hidden="true"></span>
      ) : (
        showIcon && <BiDownload className="download-icon" />
      )}
      {buttonText}
    </button>
  );
};

export default DocumentDownload;
