import type { ComponentProps } from "react";

/**
 * Brand glyphs, kept local because `lucide-react` v1 removed brand icons.
 * Single-path marks so they inherit `currentColor` and size cleanly.
 */
type IconProps = ComponentProps<"svg">;

function Glyph({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      {children}
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.25-1.5 1.5-1.5H16.6V4.4A20 20 0 0 0 14.5 4.3c-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.6V21h2.7Z" />
    </Glyph>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M17.5 3h3.2l-7 8 7.3 10h-5.6l-4.4-6.1L5.7 21H2.5l7.3-8.4L2.8 3h5.7l4.1 5.7L17.5 3Zm-1.1 16.1h1.7L7.5 4.8H5.7l10.7 14.3Z" />
    </Glyph>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        fillRule="evenodd"
        d="M8.2 2.5h7.6a5.7 5.7 0 0 1 5.7 5.7v7.6a5.7 5.7 0 0 1-5.7 5.7H8.2a5.7 5.7 0 0 1-5.7-5.7V8.2a5.7 5.7 0 0 1 5.7-5.7Zm0 2A3.7 3.7 0 0 0 4.5 8.2v7.6a3.7 3.7 0 0 0 3.7 3.7h7.6a3.7 3.7 0 0 0 3.7-3.7V8.2a3.7 3.7 0 0 0-3.7-3.7H8.2ZM12 7.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 2a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm5.3-2.9a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"
        clipRule="evenodd"
      />
    </Glyph>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4.8 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3.1 8.6h3.4V21H3.1V8.6Zm5.6 0H12v1.7a3.8 3.8 0 0 1 3.4-1.9c2.6 0 4.5 1.6 4.5 5.1V21h-3.4v-6.9c0-1.7-.6-2.6-2-2.6-1.1 0-1.9.7-1.9 2.5V21H8.7V8.6Z" />
    </Glyph>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M21.6 7.6a2.7 2.7 0 0 0-1.9-1.9C18 5.2 12 5.2 12 5.2s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.4 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.4ZM10.1 15.1V8.9l5.3 3.1-5.3 3.1Z" />
    </Glyph>
  );
}

export const socialIcons = {
  facebook: FacebookIcon,
  x: XIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
} as const;

export type SocialIconName = keyof typeof socialIcons;
