
export type SectionId = 'home' | 'microsaas' | 'about' | 'contact' | 'newsletter' | 'blog';

export interface NavItem {
  id: SectionId;
  name: string;
  icon: string;
  label: string;
  path: string;
}

export interface ContactData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Add missing ThemeFile interface to fix import error in CodeView.tsx
export interface ThemeFile {
  name: string;
  content: string;
  type: 'php' | 'css';
}
