/**
 * The tech tags that are real products, drawn as the product's own logo instead of its name. Keyed by the
 * label exactly as it appears in the dictionaries, once per language where the label is translated. Tags
 * that are practices rather than products (Product Thinking, Design Systems...) have no logo and stay as text.
 *
 * Files live in public/image/tech. React, TypeScript and MongoDB come from Simple Icons, Next.js and
 * Express from Simple Icons in white (their brand colour is black, which vanishes on the dark page), and
 * Figma from Devicon, the only source with its five-colour mark. All have transparent backgrounds.
 */
export interface TechLogo {
  src: string;
}

const figma: TechLogo = { src: '/image/tech/figma.svg' };

export const techLogos: Record<string, TechLogo> = {
  Figma: figma,
  فیگما: figma,
  React: { src: '/image/tech/react.svg' },
  'Next.js': { src: '/image/tech/nextjs.svg' },
  TypeScript: { src: '/image/tech/typescript.svg' },
  'Express.js': { src: '/image/tech/express.svg' },
  MongoDB: { src: '/image/tech/mongodb.svg' },
};
