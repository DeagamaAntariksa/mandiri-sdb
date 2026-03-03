import React from 'react';
import { useTranslation } from 'react-i18next';

interface StepperProps {
    currentStep: number;
    steps: string[];
}

const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
    const { t } = useTranslation();
    const totalSteps = steps.length;
    const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

    return (
        <div className="relative mb-12">
            {/* Progress Track Container - Centered between first and last circle */}
            <div
                className="absolute top-[20px] lg:top-[24px] h-1 z-0 overflow-hidden"
                style={{
                    left: `${(0.5 / totalSteps) * 100}%`,
                    right: `${(0.5 / totalSteps) * 100}%`
                }}
            >
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-full">
                    <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Steps Container */}
            <div className="flex w-full relative z-10">
                {steps.map((stepKey, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group">
                        <div
                            className={`
                  w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                  ${index < currentStep ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'}
                  ${index === currentStep - 1 ? 'ring-4 ring-blue-100 dark:ring-blue-900/30 scale-110' : ''}
                `}
                        >
                            {index + 1}
                        </div>
                        <span className={`mt-3 text-[10px] lg:text-sm font-bold text-center px-1 break-words transition-colors duration-300 ${index < currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                            {t(stepKey)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Stepper;
