"use client";

import React, { createContext, useContext, useState, useCallback, useRef, useEffect, FormHTMLAttributes, ReactNode } from 'react';

interface FormContextValue {
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  clearErrors: () => void;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form');
  }
  return context;
};

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  id?: string;
  children: ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onValidationError?: (errors: Record<string, string>) => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const Form = ({
  id,
  children,
  onSubmit,
  onValidationError,
  ariaLabel,
  ariaDescribedBy,
  className = '',
  ...props
}: FormProps) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const formErrors: Record<string, string> = {};

    for (const [key, value] of formData.entries()) {
      const input = event.currentTarget.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${key}"]`);
      if (input && input.required && !value) {
        const label = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby') || key;
        formErrors[key] = `${label} wajib diisi`;
      }
    }

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      onValidationError?.(formErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit?.(event);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0 && formRef.current) {
      const firstErrorField = formRef.current.querySelector<HTMLElement>(`[aria-invalid="true"]`);
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }, [errors]);

  const contextValue: FormContextValue = {
    errors,
    setErrors,
    clearErrors,
    setFieldError,
    clearFieldError,
    isSubmitting,
  };

  const errorCount = Object.keys(errors).length;
  const hasErrors = errorCount > 0;

  return (
    <FormContext.Provider value={contextValue}>
      <form
        ref={formRef}
        id={id}
        onSubmit={handleSubmit}
        className={`form ${className}`}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        noValidate
        {...props}
      >
        {hasErrors && (
          <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }} role="alert" aria-live="assertive" aria-atomic="true">
            Formulir memiliki {errorCount} error. Harap perbaiki sebelum mengirim.
          </div>
        )}
        {children}
      </form>
    </FormContext.Provider>
  );
};

export interface FormFieldsetProps {
  legend?: string;
  children: ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

const FormFieldset = ({ legend, children, disabled, ariaLabel }: FormFieldsetProps) => {
  return (
    <fieldset disabled={disabled} aria-label={ariaLabel}>
      {legend && <legend>{legend}</legend>}
      {children}
    </fieldset>
  );
};

export interface FormRowProps {
  children: ReactNode;
  className?: string;
}

const FormRow = ({ children, className = '' }: FormRowProps) => {
  return <div className={`row ${className}`}>{children}</div>;
};

export interface FormActionsProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'space-between';
  className?: string;
}

const FormActions = ({ children, align = 'right', className = '' }: FormActionsProps) => {
  const alignClass = {
    left: 'justify-content-start',
    center: 'justify-content-center',
    right: 'justify-content-end',
    'space-between': 'justify-content-between',
  }[align];

  return (
    <div className={`d-flex gap-2 ${alignClass} ${className} mt-3`}>
      {children}
    </div>
  );
};

Form.Fieldset = FormFieldset;
Form.Row = FormRow;
Form.Actions = FormActions;

export default Form;
