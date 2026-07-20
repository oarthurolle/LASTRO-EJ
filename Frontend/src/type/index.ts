// Tipos globais do projeto
export interface PageProps {
  title: string;
  description?: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  icon: string;
  url: string;
  label: string;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export interface HeaderProps {
  nav: NavItem[];
  logo?: string;
}