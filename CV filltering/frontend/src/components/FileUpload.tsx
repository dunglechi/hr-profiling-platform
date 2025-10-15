import React, { useState, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  isProcessing = false 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    if (validFile) {
      onFileSelect(validFile);
    } else {
      alert('Please select a PDF or DOCX file');
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div className="file-upload-container">
      <div 
        className={`file-upload-zone ${isDragOver ? 'drag-over' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <p>Processing CV...</p>
          </div>
        ) : (
          <>
            <div className="upload-icon">📄</div>
            <h3>Upload CV for Analysis</h3>
            <p>Drag and drop a PDF or DOCX file here, or</p>
            <label className="file-input-label">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileInput}
                style={{ display: 'none' }}
              />
              <button type="button" className="select-file-btn">
                Select File
              </button>
            </label>
            <div className="supported-formats">
              <small>Supported formats: PDF, DOCX</small>
            </div>
          </>
        )}
      </div>
    </div>
  );
};