import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  iconOnly?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  fullWidth = false,
  iconOnly = false,
  icon,
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? 'btn--full' : '',
    iconOnly ? 'btn--icon-only' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {icon && <span className="btn__icon">{icon}</span>}
      {children}
    </button>
  );
};
