"use client";

import { UseFormRegisterReturn, FieldError } from "react-hook-form";

interface FormFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password" | "textarea";
  placeholder?: string;
  register: UseFormRegisterReturn<string>;
  error?: FieldError;
  disabled?: boolean;
  rows?: number;
}

const FormField = ({
  id,
  label,
  type = "text",
  placeholder,
  register,
  error,
  disabled,
  rows = 4
}: FormFieldProps) => {
  const errorId = `${id}_error`;

  const commonProps = {
    id,
    ...register,
    disabled,
    placeholder,
    className: "form-control",
    "aria-invalid": !!error,
    "aria-describedby": errorId
  };

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {type === "textarea" ? (
        <textarea {...commonProps} rows={rows} />
      ) : (
        <input {...commonProps} type={type} />
      )}
      {error && (
        <p id={errorId} className="form_error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormField;
