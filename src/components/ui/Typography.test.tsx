import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TypographyComponent from './Typography';

describe('TypographyComponent', () => {
  it('renders the semantic tag matching its variant', () => {
    render(<TypographyComponent variant="h1">Heading</TypographyComponent>);
    expect(screen.getByRole('heading', { level: 1, name: 'Heading' })).toBeInTheDocument();
  });

  it('renders a paragraph tag for body variants', () => {
    render(<TypographyComponent variant="body1">Body text</TypographyComponent>);
    const element = screen.getByText('Body text');
    expect(element.tagName).toBe('P');
  });

  it('allows overriding the rendered tag via the `as` prop', () => {
    render(
      <TypographyComponent variant="h2" as="div">
        Overridden
      </TypographyComponent>,
    );
    const element = screen.getByText('Overridden');
    expect(element.tagName).toBe('DIV');
  });
});
