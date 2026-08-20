import React from 'react';

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border-subtle rounded-xl bg-panel-dark/20 my-4">
      {Icon && (
        <div className="p-3.5 rounded-full bg-panel-secondary text-accent-purple mb-4 animate-pulse">
          <Icon size={28} />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-6 leading-relaxed">{description}</p>
      {action}
    </div>
  );
};
