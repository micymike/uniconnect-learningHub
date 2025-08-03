import React from 'react';
import { motion } from 'framer-motion';

interface AIFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  category: string;
}

const AIFeatureCard: React.FC<AIFeatureCardProps> = ({
  title,
  description,
  icon,
  isActive,
  onClick,
  category
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'study': return 'from-blue-500 to-blue-600';
      case 'productivity': return 'from-green-500 to-green-600';
      case 'collaboration': return 'from-purple-500 to-purple-600';
      case 'wellbeing': return 'from-pink-500 to-pink-600';
      case 'analytics': return 'from-orange-500 to-orange-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative p-6 rounded-xl cursor-pointer transition-all duration-300
        ${isActive 
          ? `bg-gradient-to-br ${getCategoryColor(category)} text-white shadow-lg` 
          : 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
        }
      `}
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <div className={`
          p-3 rounded-lg flex-shrink-0
          ${isActive 
            ? 'bg-white/20' 
            : `bg-gradient-to-br ${getCategoryColor(category)} text-white`
          }
        `}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-lg mb-2
            ${isActive ? 'text-white' : 'text-gray-900'}
          `}>
            {title}
          </h3>
          <p className={`
            text-sm leading-relaxed
            ${isActive ? 'text-white/90' : 'text-gray-600'}
          `}>
            {description}
          </p>
        </div>
      </div>
      
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-3 h-3 bg-white rounded-full"
        />
      )}
    </motion.div>
  );
};

export default AIFeatureCard;