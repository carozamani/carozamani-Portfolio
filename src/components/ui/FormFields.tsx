'use client';

import {
  memo,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import styles from './FormFields.module.css';

type InputVariant = 'text' | 'email' | 'password' | 'textarea';

interface BaseFieldProps {
  label: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

interface InputFieldProps
  extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'placeholder'> {
  variant: Exclude<InputVariant, 'textarea'>;
}

interface TextareaFieldProps
  extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'placeholder'> {
  variant: 'textarea';
  rows?: number;
}

type FormFieldProps = InputFieldProps | TextareaFieldProps;

type FieldElement = HTMLInputElement & HTMLTextAreaElement;

function FormFieldsComponent(props: FormFieldProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const { label, variant, required, placeholder, disabled, error, className, onInput, ...rest } =
    props;
  const maxLength = (props as TextareaFieldProps).maxLength;

  const [length, setLength] = useState(0);
  const [isValid, setIsValid] = useState(false);

  const handleInput = (event: FormEvent<FieldElement>) => {
    const target = event.currentTarget;
    setLength(target.value.length);
    setIsValid(target.value.trim().length > 0 && target.checkValidity());
    (onInput as ((e: FormEvent<FieldElement>) => void) | undefined)?.(event);
  };

  const sharedProps = {
    id: fieldId,
    placeholder: placeholder || ' ',
    required,
    disabled,
    className: clsx(styles.control, className),
    onInput: handleInput,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? errorId : undefined,
    'data-invalid': error ? true : undefined,
  };

  const ghostRef = useRef<HTMLSpanElement>(null);
  const [labelWidth, setLabelWidth] = useState(0);

  useLayoutEffect(() => {
    const ghost = ghostRef.current;
    if (!ghost) return;
    const measure = () => setLabelWidth(ghost.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ghost);
    return () => observer.disconnect();
  }, [label, required]);

  const showValid = isValid && !error;
  const showCounter = variant === 'textarea' && Boolean(maxLength);

  return (
    <div className={styles.field}>
      <div
        className={styles.shell}
        data-valid={showValid || undefined}
        data-invalid={error ? true : undefined}
        style={{ '--label-w': `${labelWidth}px` } as CSSProperties}
      >
        {variant === 'textarea' ? (
          <textarea
            {...(rest as Omit<TextareaFieldProps, keyof BaseFieldProps | 'variant' | 'className'>)}
            {...sharedProps}
            rows={(props as TextareaFieldProps).rows ?? 4}
          />
        ) : (
          <input
            {...(rest as Omit<InputFieldProps, keyof BaseFieldProps | 'variant' | 'className'>)}
            {...sharedProps}
            type={variant}
          />
        )}
        <label htmlFor={fieldId} className={clsx(styles.label, required && styles.required)}>
          {label}
        </label>

        <span ref={ghostRef} className={styles.ghost} aria-hidden="true">
          {label}
          {required && ' *'}
        </span>

        <svg className={styles.check} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="10" className={styles.checkRing} />
          <path d="M7.5 12.5l3 3 6-6.5" className={styles.checkMark} />
        </svg>

        {showCounter && maxLength ? (
          <span
            className={styles.counter}
            data-near={length > maxLength * 0.9 || undefined}
            aria-hidden="true"
          >
            {length}/{maxLength}
          </span>
        ) : null}
      </div>

      {error && (
        <span id={errorId} className={styles.errorMessage} role="alert">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16.5h.01" strokeLinecap="round" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

export default memo(FormFieldsComponent);
