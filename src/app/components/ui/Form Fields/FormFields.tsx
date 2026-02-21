'use client';

import { memo, InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import styles from "./FormFields.module.css";

// تایپ اختصاصی برای انواع اینپوت‌ها
type InputVariant = 'text' | 'email' | 'password' | 'textarea';

// اینترفیس پایه برای همه فیلدها
interface BaseFieldProps {
  label: string;
  variant: InputVariant;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

// اینترفیس برای اینپوت‌های معمولی
interface InputFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'placeholder'> {
  variant: Exclude<InputVariant, 'textarea'>;
  type?: string; // اجازه دادن به typeهای دیگه مثل number, tel, etc.
}

// اینترفیس برای textarea
interface TextareaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  variant: 'textarea';
  rows?: number;
}

// یونیون تایپ نهایی
type FormFieldProps = InputFieldProps | TextareaFieldProps;

// کامپوننت اختصاصی برای اینپوت تکی
function SingleInput({ label, variant, required, placeholder, disabled, className, ...props }: InputFieldProps) {
  return (
    <div className={styles.field}>
      <input
        type={variant === 'password' ? 'password' : variant}
        placeholder={placeholder || " "}
        required={required}
        disabled={disabled}
        className={className}
        {...props}
      />
      <label>{label}</label>
    </div>
  );
}

// کامپوننت اختصاصی برای textarea
function TextareaInput({ label, required, placeholder, disabled, rows = 4, className, ...props }: TextareaFieldProps) {
  return (
    <div className={styles.field}>
      <textarea
        rows={rows}
        placeholder={placeholder || " "}
        required={required}
        disabled={disabled}
        className={className}
        {...props}
      />
      <label>{label}</label>
    </div>
  );
}

// کامپوننت اصلی
function FormFieldsComponent(props: FormFieldProps) {
  if (props.variant === 'textarea') {
    return <TextareaInput {...props} />;
  }
  
  return <SingleInput {...props} />;
}

export default memo(FormFieldsComponent);