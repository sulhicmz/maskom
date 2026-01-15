"use client";

import { UseFormRegisterReturn, FieldError, FieldValues, UseFormTrigger } from "react-hook-form";
import { useState, useCallback, useEffect } from "react";
import { useDebouncedCallback } from "@/hooks/useDebounce";

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
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
  trigger?: UseFormTrigger<TFieldValues>;
  debounceMs?: number;
  ariaLive?: "off" | "polite" | "assertive";
}

const FormField = <TFieldValues extends FieldValues = FieldValues>({
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
  trigger,
  debounceMs = 300,
  ariaLive = "polite",
}: FormFieldProps<TFieldValues>) => {
  const errorId = `${id}_error`;
  const descriptionId = `${id}_description`;
  const [showPassword, setShowPassword] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [localError, setLocalError] = useState<FieldError | undefined>(error);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  const showError = !!(error || localError);
  const displayError = error || localError;

  const debouncedTrigger = useCallback(
    useDebouncedCallback(() => {
      if (trigger) {
        trigger(id as any); // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }
    }, debounceMs),
    [trigger, id, debounceMs]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);

      if (register.onChange) {
        register.onChange(e);
      }

      if (trigger) {
        debouncedTrigger();
      }
    },
    [register.onChange, trigger, debouncedTrigger]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLocalError(error);
  }, [error]);

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
          onChange={handleChange}
        />
      );
    }

    return <input {...commonProps} type={inputType} onChange={handleChange} />;
  };

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
      {showError && displayError && (
        <p id={errorId} className="form_error" role="alert" aria-live={ariaLive}>
          {displayError.message}
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
