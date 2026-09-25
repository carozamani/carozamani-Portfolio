import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { useDictionary } from '@/lib/i18n/LocaleProvider';
import type { Dictionary } from '@/lib/i18n/dictionaries';

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(
  values: ContactFormValues,
  messages: Dictionary['contact']['errors'],
): ContactFormErrors {
  const errors: ContactFormErrors = {};

  if (!values.name.trim()) {
    errors.name = messages.name;
  }

  if (!values.email.trim()) {
    errors.email = messages.emailRequired;
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = messages.emailInvalid;
  }

  if (!values.message.trim()) {
    errors.message = messages.messageRequired;
  } else if (values.message.trim().length < 10) {
    errors.message = messages.messageShort;
  }

  return errors;
}

export function useContactForm() {
  const { contact } = useDictionary();
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

    const validationErrors = validate(values, contact.errors);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidField = form.querySelector<HTMLElement>('[aria-invalid="true"]');
      firstInvalidField?.focus();
      toast.error(contact.fixFields);
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success(contact.sentToast);
      form.reset();
      setErrors({});
      setIsSent(true);
    } catch {
      toast.error(contact.failedToast);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSent = () => setIsSent(false);

  return { errors, isSubmitting, isSent, resetSent, handleSubmit };
}
