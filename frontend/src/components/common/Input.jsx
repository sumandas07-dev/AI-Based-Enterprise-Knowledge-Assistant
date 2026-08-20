import React from 'react';

export const Input = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="text-[10px] font-bold text-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full px-3.5 py-2 bg-panel-dark border border-border-subtle focus:border-border-focus text-xs text-text-primary placeholder:text-text-secondary/30 rounded-lg focus:outline-none transition-colors disabled:opacity-50 ${
          error ? 'border-red-500 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[10px] text-red-400 font-semibold mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
