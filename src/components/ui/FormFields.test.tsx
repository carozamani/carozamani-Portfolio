import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import FormFields from './FormFields';

describe('FormFields', () => {
  it('associates the label with the input via htmlFor/id', () => {
    render(<FormFields variant="email" label="Email address" />);
    const input = screen.getByLabelText('Email address');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('associates the label with the textarea via htmlFor/id', () => {
    render(<FormFields variant="textarea" label="Message" />);
    const textarea = screen.getByLabelText('Message');
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('marks required fields with aria-required', () => {
    render(<FormFields variant="text" label="Name" required />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-required', 'true');
  });
});
