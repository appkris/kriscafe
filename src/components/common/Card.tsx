import React from 'react';
import './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  elevated?: boolean;
  borderedAccent?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  interactive = false,
  elevated = false,
  borderedAccent = false,
  children,
  className = '',
  ...props
}) => {
  const classes = [
    'card',
    interactive ? 'card--interactive' : '',
    elevated ? 'card--elevated' : '',
    borderedAccent ? 'card--bordered-accent' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};
