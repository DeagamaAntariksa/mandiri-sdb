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
        bg-white rounded-2xl shadow-sm border-2 transition-all p-6
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-300' : ''}
        ${selected ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-50'}
        ${className}
      `}
        >
            {children}
        </div>
    );
};

export default Card;
