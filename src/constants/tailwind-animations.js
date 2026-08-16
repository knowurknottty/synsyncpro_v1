/* Add these to your tailwind.config.js */

module.exports = {
  theme: {
    extend: {
      animation: {
        // Fade animations
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',

        // Slide animations
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',

        // Scale animations
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'scale-out': 'scaleOut 0.3s ease-in-out',

        // Pulse animations
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        // Bounce with delay
        'bounce-delay-100': 'bounce 1s infinite 0.1s',
        'bounce-delay-200': 'bounce 1s infinite 0.2s',

        // Spin animations
        'spin-slow': 'spin 3s linear infinite',

        // Progress bar
        'progress-bar': 'progressBar 2s ease-in-out',

        // Check mark draw
        'check-draw': 'checkDraw 0.5s ease-in-out 0.3s forwards',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        slideLeft: {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        slideRight: {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
        },
        scaleOut: {
          '0%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '100%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
        },
        progressBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        checkDraw: {
          '0%': {
            strokeDasharray: '0 100',
            opacity: '0'
          },
          '100%': {
            strokeDasharray: '100 100',
            opacity: '1'
          },
        },
      },

      // Animation delays
      animationDelay: {
        '100': '0.1s',
        '200': '0.2s',
        '300': '0.3s',
        '400': '0.4s',
        '500': '0.5s',
        '600': '0.6s',
      },
    },
  },
  plugins: [
    // Add animation delay utilities
    function({ addUtilities }) {
      const newUtilities = {
        '.animation-delay-100': {
          'animation-delay': '0.1s',
        },
        '.animation-delay-200': {
          'animation-delay': '0.2s',
        },
        '.animation-delay-300': {
          'animation-delay': '0.3s',
        },
        '.animation-delay-400': {
          'animation-delay': '0.4s',
        },
        '.animation-delay-500': {
          'animation-delay': '0.5s',
        },
        '.animation-delay-600': {
          'animation-delay': '0.6s',
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

/*
Usage examples:

<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
<div className="animate-scale-in">Scales in</div>
<div className="animate-slide-up animation-delay-200">Delayed slide</div>
<div className="animate-bounce animation-delay-100">Delayed bounce</div>
*/
