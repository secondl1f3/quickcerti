import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: string;
}

export const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200/80 overflow-hidden">
      <button
        onClick={toggleOpen}
        className="w-full flex justify-between items-center p-6 text-left font-semibold text-xl text-gray-800 focus:outline-none"
      >
        <span>{question}</span>
        <ChevronDown 
          className={`w-6 h-6 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div 
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
      >
        <div className="p-6 pt-0 text-gray-600">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};