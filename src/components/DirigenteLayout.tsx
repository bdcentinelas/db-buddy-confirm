import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Car, Home } from 'lucide-react';

interface DirigenteLayoutProps {
  children: ReactNode;
}

interface TabItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  {
    path: '/dirigente/register',
    label: 'Registrar',
    icon: User,
  },
  {
    path: '/dirigente/vehicles',
    label: 'Mis Vehículos',
    icon: Car,
  },
];

const DirigenteLayout: React.FC<DirigenteLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>
      
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            
            return (
              <button
                key={tab.path}
                onClick={() => handleTabClick(tab.path)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DirigenteLayout;