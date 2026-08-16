import React from 'react';
import { Brain } from 'lucide-react';

export interface LogoProps {
  /**
   * Size variant for different contexts
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Whether to include the brain icon
   */
  showIcon?: boolean;
  /**
   * Layout direction
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * Custom className for the container
   */
  className?: string;
  /**
   * Style variant
   */
  variant?: 'default' | 'gradient' | 'simple';
}

const SIZE_CLASSES = {
  sm: {
    container: 'gap-1',
    icon: 'w-4 h-4',
    text: 'text-sm',
  },
  md: {
    container: 'gap-2',
    icon: 'w-6 h-6',
    text: 'text-lg',
  },
  lg: {
    container: 'gap-2',
    icon: 'w-8 h-8',
    text: 'text-3xl',
  },
  xl: {
    container: 'gap-3',
    icon: 'w-10 h-10',
    text: 'text-4xl',
  },
};

/**
 * Shared Logo Component
 *
 * Provides consistent branding across the application.
 * Displays "SYNSYNC PRO" with optional brain icon.
 */
export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showIcon = true,
  direction = 'horizontal',
  className = '',
  variant = 'default',
}) => {
  const sizeClasses = SIZE_CLASSES[size];
  const isVertical = direction === 'vertical';

  const containerClasses = `
    flex ${isVertical ? 'flex-col' : 'flex-row'} items-center
    ${sizeClasses.container}
    ${className}
  `.trim();

  // Gradient variant (landing page style)
  if (variant === 'gradient') {
    return (
      <div className={containerClasses}>
        {showIcon && <Brain className={`${sizeClasses.icon} text-neuro-500`} />}
        <span
          className={`${sizeClasses.text} font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-neuro-500 to-white font-mono`}
        >
          SYN<span className="text-white">SYNC</span> PRO
        </span>
      </div>
    );
  }

  // Simple variant (plain text)
  if (variant === 'simple') {
    return (
      <div className={containerClasses}>
        {showIcon && <Brain className={`${sizeClasses.icon} text-neuro-500`} />}
        <span className={`${sizeClasses.text} font-black text-white font-mono tracking-tighter`}>
          SYNSYNC PRO
        </span>
      </div>
    );
  }

  // Default variant (app header style)
  return (
    <div className={containerClasses}>
      {showIcon && <Brain className={`${sizeClasses.icon} text-neuro-500`} />}
      <span
        className={`${sizeClasses.text} font-black text-transparent bg-clip-text bg-gradient-to-r from-neuro-500 via-white to-neuro-500 tracking-tighter font-mono italic uppercase`}
      >
        SYN<span className="text-white">SYNC</span>
      </span>
    </div>
  );
};

export default Logo;
