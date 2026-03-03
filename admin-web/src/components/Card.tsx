import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    selected?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, selected = false }) => {
    return (
        <div
            onClick={onClick}
            className={`
        bg-white dark:bg-gray-950 rounded-[2.5rem] border-2 transition-all p-6
        ${onClick ? 'cursor-pointer hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none hover:-translate-y-1' : ''}
        ${selected ? 'border-blue-600 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'border-gray-50 dark:border-gray-900'}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default Card;
