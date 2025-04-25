import { forwardRef, useState } from 'react';
import { FaExclamationCircle, FaFile, FaUpload } from 'react-icons/fa';
import '../../../styles/components/common/Input.css';

const Input = forwardRef(
  (
    {
      label,
      error,
      type = 'text',
      className = '',
      required = false,
      helperText,
      startIcon,
      endIcon,
      accept,
      onFileSelect,
      ...props
    },
    ref
  ) => {
    const [selectedFileName, setSelectedFileName] = useState('');

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFileName(file.name);
        if (onFileSelect) onFileSelect(file);
      }
    };

    if (type === 'file') {
      return (
        <div className={`input-wrapper ${className}`}>
          {label && (
            <label className="input-label">
              {label}
              {required && <span className="input-required">*</span>}
            </label>
          )}

          <div className="input-container file-input-container">
            <input
              ref={ref}
              type="file"
              className="file-input"
              onChange={handleFileChange}
              accept={accept}
              {...props}
            />
            <div className="file-input-display">
              <FaUpload className="upload-icon" />
              <span>{selectedFileName || 'Choose a file...'}</span>
            </div>
            {selectedFileName && (
              <div className="selected-file">
                <FaFile /> {selectedFileName}
              </div>
            )}
          </div>

          {(error || helperText) && (
            <p className={`input-helper ${error ? 'error' : ''}`}>
              {error || helperText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={`input-wrapper ${className}`}>
        {label && (
          <label className="input-label">
            {label}
            {required && <span className="input-required">*</span>}
          </label>
        )}

        <div className="input-container">
          {startIcon && <span className="input-icon start">{startIcon}</span>}

          <input
            ref={ref}
            type={type}
            className={`input-field ${startIcon ? 'has-start-icon' : ''} ${endIcon || error ? 'has-end-icon' : ''} ${error ? 'input-error' : ''}`}
            {...props}
          />

          {endIcon && <span className="input-icon end">{endIcon}</span>}
          {error && !endIcon && (
            <FaExclamationCircle className="input-icon end error-icon" />
          )}
        </div>

        {(error || helperText) && (
          <p className={`input-helper ${error ? 'error' : ''}`}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
