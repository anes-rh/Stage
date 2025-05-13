// src/components/common/Task.jsx
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

export default function Task({ title, description, status }) {
  // Status can be 'completed', 'pending', or 'rejected'
  const getBorderColor = () => {
    switch(status) {
      case 'completed': return 'border-green-500';
      case 'rejected': return 'border-red-500';
      default: return 'border-yellow-400';
    }
  };
  
  const getStatusIcon = () => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className={`flex bg-white border-l-4 ${getBorderColor()} 
                  p-3 rounded-md shadow-md hover:shadow-lg transition-all duration-200`}>
      <div className="flex-1">
        <h3 className="text-sm font-medium">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
      <div className="flex items-center">
        {getStatusIcon()}
      </div>
    </div>
  );
}