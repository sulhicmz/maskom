"use client";

import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { useState, useEffect } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea";
  placeholder?: string;
  register: UseFormRegisterReturn<string>;
  error?: FieldError;
  disabled?: boolean;
  rows?: number;
  required?: boolean;
  description?: string;
  maxLength?: number;
}

const FormField = ({
  id,
  label,
  type = "text",
  placeholder,
  register,
  error,
  disabled,
  rows = 4,
  required = false,
  description,
  maxLength,
}: FormFieldProps) => {
  const errorId = `${id}_error`;
  const descriptionId = `${id}_description`;
  const [showPassword, setShowPassword] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const showError = !!error;

  const commonProps = {
    id,
    ...register,
    disabled,
    placeholder,
    className: `form-control ${showError ? "form-control-error" : ""}`,
    "aria-invalid": showError,
    "aria-required": required,
    "aria-describedby": `${description ? descriptionId : ""} ${showError ? errorId : ""}`.trim() || undefined,
  };

  const renderInput = () => {
    if (type === "textarea") {
      return (
        <textarea
          {...commonProps}
          rows={rows}
          maxLength={maxLength}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            if (register.onChange) {
              register.onChange(e);
            }
          }}
        />
      );
    }

    return <input {...commonProps} type={inputType} />;
  };

  useEffect(() => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (textarea && type === "textarea") {
      setCharCount(textarea.value.length);
    }
  }, [id, type]);

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && <span className="required-indicator" aria-label="wajib diisi">*</span>}
      </label>
      {description && (
        <p id={descriptionId} className="form-description">
          {description}
        </p>
      )}
      {isPassword ? (
        <div className="input-wrapper">
          {renderInput()}
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={showPassword}
            disabled={disabled}
          >
            {showPassword ? <i className="fa fa-eye-slash" aria-hidden="true" /> : <i className="fa fa-eye" aria-hidden="true" />}
          </button>
        </div>
      ) : (
        renderInput()
      )}
      {showError && (
        <p id={errorId} className="form_error" role="alert" aria-live="polite">
          {error.message}
        </p>
      )}
      {type === "textarea" && maxLength && (
        <p className="char-count" aria-live="off">
          {charCount} / {maxLength} karakter
        </p>
      )}
    </div>
  );
};

export default FormField;
