import React from 'react';
import { Bell, Calendar, User, Settings, Database, Radar, UserCheck, Zap, 
         GitBranch, Shield, Megaphone, BookOpen, Menu, ToggleLeft, ToggleRight, AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import kmrlLogo from 'figma:asset/3d269cc23e88cfdeab63ae71c9863712f8895b58.png';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

const modules = [
  { id: 'data-sources', label: 'Data Sources', icon: Database },
  { id: 'conflict-radar', label: 'Conflict Radar', icon: Radar },
  { id: 'manager-review', label: 'Manager Review', icon: UserCheck },
  { id: 'optimizer', label: 'Optimizer', icon: Zap },
  { id: 'shunting', label: 'Shunting Planner', icon: GitBranch },
  { id: 'blockchain', label: 'Blockchain Ledger', icon: Shield },
  { id: 'branding', label: 'Branding Scheduler', icon: Megaphone },
  { id: 'lessons', label: 'Lessons Learned', icon: BookOpen },
];

// Mock certificate expiry data for notifications
const mockExpiryNotifications = [
  {
    trainId: 'T014',
    department: 'TELECOM',
    certType: 'Telecom Cert',
    hoursRemaining: 6,
    priority: 'critical'
  },
  {
    trainId: 'T007',
    department: 'RST',
    certType: 'RST Cert',
    hoursRemaining: 48,
    priority: 'warning'
  },
  {
    trainId: 'T021',
    department: 'TRACTION',
    certType: 'Traction Cert',
    hoursRemaining: 18,
    priority: 'warning'
  }
];

export function Layout({ children, activeModule, onModuleChange, sidebarCollapsed, onSidebarToggle }: LayoutProps) {
  const [isLiveMode, setIsLiveMode] = React.useState(true);
  
  const criticalNotifications = mockExpiryNotifications.filter(n => n.priority === 'critical').length;
  const totalNotifications = mockExpiryNotifications.length;

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center p-1">
              <img
                src={kmrlLogo}
                alt="KMRL Logo"
                className="w-full h-full object-contain"
              />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-semibold text-sm">KMRL TIPS</h1>
                <p className="text-xs text-muted-foreground">Train Induction Planning</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            
            return (
              <Button
                key={module.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start ${sidebarCollapsed ? 'px-3' : 'px-3'} h-10`}
                onClick={() => onModuleChange(module.id)}
              >
                <Icon className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-3 text-sm">{module.label}</span>}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onSidebarToggle}>
              <Menu className="w-4 h-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sep 4, 2025</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live/Simulation Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Simulation</span>
              <Switch
                checked={isLiveMode}
                onCheckedChange={setIsLiveMode}
              />
              <span className="text-sm text-muted-foreground">Live</span>
              <Badge variant={isLiveMode ? "default" : "secondary"} className="ml-2">
                {isLiveMode ? "LIVE" : "SIM"}
              </Badge>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Enhanced Notifications */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4" />
                  </Button>
                  {totalNotifications > 0 && (
                    <Badge 
                      variant={criticalNotifications > 0 ? "destructive" : "secondary"} 
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
                    >
                      {totalNotifications}
                    </Badge>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Certificate Expiry Alerts</h3>
                    <Badge variant="outline" className="text-xs">
                      {totalNotifications} active
                    </Badge>
                  </div>
                  <Separator />
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {mockExpiryNotifications.map((notification, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded border-l-4 ${
                          notification.priority === 'critical' ? 'border-red-500 bg-red-50' :
                          notification.priority === 'warning' ? 'border-amber-500 bg-amber-50' :
                          'border-green-500 bg-green-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {notification.priority === 'critical' ? (
                                <AlertTriangle className="w-3 h-3 text-red-600" />
                              ) : (
                                <Clock className="w-3 h-3 text-amber-600" />
                              )}
                              <span className="font-medium text-xs">Train {notification.trainId}</span>
                              <Badge variant="outline" className="text-xs">
                                {notification.department}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {notification.certType} expiring in{' '}
                              {notification.hoursRemaining < 24 
                                ? `${notification.hoursRemaining}h` 
                                : `${Math.floor(notification.hoursRemaining / 24)} days`
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {activeModule !== 'blockchain' && (
                    <div className="pt-2 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => onModuleChange('blockchain')}
                      >
                        View All in Blockchain Ledger
                      </Button>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* User Profile */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <div className="text-sm">
                <div className="font-medium">Admin User</div>
                <div className="text-xs text-muted-foreground">Operations Manager</div>
              </div>
            </div>

            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}