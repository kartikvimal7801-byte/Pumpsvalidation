import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  Users,
  LogOut,
  Search
} from 'lucide-react';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { Card, Button, Input } from '@/components/common';
import { ModuleCard } from '../components/ModuleCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const modules: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: ReactNode;
    color: 'primary' | 'accent' | 'success';
    stats: { active: number; completed: number; total: number };
    onClick: () => void;
  }[] = [
    {
      id: 'npd',
      title: 'NPD',
      subtitle: 'New Product Development',
      description: 'Manage and track new product development projects with comprehensive workflow management.',
      icon: <TrendingUp className="h-8 w-8" />,
      color: 'primary',
      stats: { active: 12, completed: 8, total: 20 },
      onClick: () => navigate('/npd'),
    },
    {
      id: 'vave',
      title: 'VA/VE',
      subtitle: 'Value Analysis / Value Engineering',
      description: 'Optimize product value through systematic analysis and engineering improvements.',
      icon: <Settings className="h-8 w-8" />,
      color: 'accent',
      stats: { active: 6, completed: 15, total: 21 },
      onClick: () => navigate('/vave'),
    },
    {
      id: 'standardization',
      title: 'Standardization',
      subtitle: 'Process Standardization',
      description: 'Establish and maintain standardized processes across all product development activities.',
      icon: <CheckCircle className="h-8 w-8" />,
      color: 'success',
      stats: { active: 4, completed: 12, total: 16 },
      onClick: () => navigate('/standardization'),
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  NPD Dashboard
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 w-64"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}!
          </h2>
          <p className="text-gray-600">
            Manage your product development projects across NPD, VA/VE, and Standardization modules.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">57</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">22</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-accent-100 rounded-lg">
                <Settings className="h-6 w-6 text-accent-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">35</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <Users className="h-6 w-6 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Module Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Project Modules
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <ModuleCard {...module} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                { project: 'Self Priming Pump Development', action: 'Flowchart updated', time: '2 hours ago', module: 'NPD' },
                { project: 'Centrifugal Pump Optimization', action: 'Status changed to completed', time: '4 hours ago', module: 'VA/VE' },
                { project: 'Quality Standards Review', action: 'New milestone added', time: '1 day ago', module: 'Standardization' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{activity.project}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {activity.module}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}