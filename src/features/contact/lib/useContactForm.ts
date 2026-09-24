import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: ContactFormValues): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Please enter your name.';
  }

  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.message.trim()) {
    errors.message = 'Please enter a message.';
  } else if (values.message.trim().length < 10) {
    errors.message = 'Your message should be at least 10 characters.';
  }

  return errors;
}

export function useContactForm() {
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values: ContactFormValues = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
    };

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = form.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalidField?.focus();
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success("Message sent — I'll get back to you shortly.");
      form.reset();
      setErrors({});
      setIsSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSent = () => setIsSent(false);

  return { errors, isSubmitting, isSent, resetSent, handleSubmit };
}
