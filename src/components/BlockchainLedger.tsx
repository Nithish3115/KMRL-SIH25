import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Search, ExternalLink, Copy, CheckCircle, AlertTriangle, Clock, Calendar, Bell, X, Zap } from 'lucide-react';

const blockchainStats = {
  totalTransactions: 15423,
  blocksToday: 47,
  avgBlockTime: '12.3s',
  networkHealth: 99.8,
  lastBlock: '2025-09-04 14:25:01'
};

// Helper Components
function ActionBadge({ action }: { action: string }) {
  const getActionStyle = (action: string) => {
    switch (action) {
      case 'CERT_RENEWAL':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'WO_CLOSURE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'OVERRIDE_APPROVAL':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'INSPECTION_COMPLETE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'BRANDING_CONTRACT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Badge className={getActionStyle(action)}>
      {action.replace('_', ' ')}
    </Badge>
  );
}

function StatusChip({ status, expiryHours }: { status: string; expiryHours?: number | null }) {
  const getStatusConfig = () => {
    if (status === 'active' && expiryHours && expiryHours < 24) {
      return {
        icon: <AlertTriangle className="w-3 h-3 mr-1" />,
        label: 'Expiring Soon',
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    }
    
    switch (status) {
      case 'active':
        return {
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          label: 'Active',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'revoked':
        return {
          icon: <X className="w-3 h-3 mr-1" />,
          label: 'Revoked',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'expiring':
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          label: 'Expiring Soon',
          className: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      default:
        return {
          icon: null,
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  
  return (
    <Badge className={config.className}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

function ExpiryNotification({ cert, onDismiss }: { cert: any; onDismiss: () => void }) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-amber-500 bg-amber-50';
      default:
        return 'border-green-500 bg-green-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      default:
        return '✅';
    }
  };

  return (
    <div className={`p-3 border-l-4 ${getPriorityStyle(cert.priority)} mb-2`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{getPriorityIcon(cert.priority)}</span>
            <span className="font-medium text-sm">Train {cert.trainId}</span>
            <Badge variant="outline" className="text-xs">
              {cert.department}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {cert.certType} expiring in {cert.hoursRemaining < 24 ? `${cert.hoursRemaining}h` : `${Math.floor(cert.hoursRemaining / 24)} days`} ({cert.expiryTime})
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDismiss}
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function ComplianceGauge({ dept, percentage }: { dept: string; percentage: number }) {
  const getColorClass = (pct: number) => {
    if (pct >= 95) return 'text-green-600';
    if (pct >= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${(percentage / 100) * 175.9} 175.9`}
            strokeLinecap="round"
            className={getColorClass(percentage)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-sm ${getColorClass(percentage)}`}>
            {percentage}%
          </span>
        </div>
      </div>
      <div className="text-xs font-medium">{dept}</div>
      <div className="text-xs text-muted-foreground">
        {Math.floor((percentage / 100) * 25)}/25 trains
      </div>
    </div>
  );
}

export function BlockchainLedger() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [ledgerTransactions, setLedgerTransactions] = React.useState<any[]>([]);
  const [certificateExpiries, setCertificateExpiries] = React.useState<any[]>([]);
  const [departmentCompliance, setDepartmentCompliance] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        const transactions = data.map((train: any, index: number) => ({
          txId: `TX-0x${(Math.random().toString(16)+'0000000').slice(2,10)}`,
          trainId: train.id,
          action: train.maintenance.status === 'in_repair' ? 'WO_CLOSURE' : 'CERT_RENEWAL',
          issuer: 'Maintenance',
          timestamp: train.timestamp,
          status: Object.values(train.certifications).some(c => c === 'expired') ? 'revoked' : 'active',
          blockHeight: 15423 - index,
          hash: (Math.random().toString(36)+'00000000000000000').slice(2, 18),
          department: 'RST',
          expiryHours: Object.values(train.certifications).some(c => c === 'expired') ? 0 : 120
        }));
        setLedgerTransactions(transactions);

        const expiries = data
          .filter((train: any) => Object.values(train.certifications).some(c => c === 'expired'))
          .map((train: any) => ({
            trainId: train.id,
            department: 'RST',
            certType: 'Safety Cert',
            expiryTime: '00:00',
            hoursRemaining: 0,
            priority: 'critical',
            issuer: 'Safety Dept',
            lastRenewal: train.maintenance.last_service_date
          }));
        setCertificateExpiries(expiries);

        const compliance = ['RST', 'SIGNAL', 'TELECOM', 'TRACTION', 'AFC'].map(dept => {
            const total = data.length;
            const compliant = data.filter((train: any) => Object.values(train.certifications).every(c => c === 'valid')).length;
            return {
                dept,
                compliant,
                total,
                percentage: Math.round((compliant / total) * 100)
            }
        });
        setDepartmentCompliance(compliance);
      });
  }, []);

  const filteredTransactions = ledgerTransactions.filter(
    tx => 
      tx.trainId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.txId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const criticalExpiries = certificateExpiries.filter(cert => cert.priority === 'critical');
  const atRiskTrains = certificateExpiries.filter(cert => cert.hoursRemaining <= 72);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">🔔 Blockchain Certificate & Work-Order Ledger</h1>
          <p className="text-muted-foreground">Immutable audit trail with certificate expiry monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          {criticalExpiries.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
              <Bell className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700 font-medium">
                {criticalExpiries.length} Critical Alert{criticalExpiries.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Network Secure</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Visual Dashboard</TabsTrigger>
          <TabsTrigger value="notifications">Expiry Alerts</TabsTrigger>
          <TabsTrigger value="ledger">Transaction Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Department Compliance Gauges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Department Compliance Overview
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time certificate compliance across all departments
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {departmentCompliance.map((dept) => (
                  <ComplianceGauge 
                    key={dept.dept} 
                    dept={dept.dept} 
                    percentage={dept.percentage} 
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* At Risk Widget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-red-700">{atRiskTrains.length}</p>
                  <p className="text-sm text-red-600">Trains at Risk</p>
                  <p className="text-xs text-red-500 mt-1">Expiring ≤ 72h</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-amber-700">
                    {departmentCompliance.length > 0 ? Math.round(departmentCompliance.reduce((acc, d) => acc + d.percentage, 0) / departmentCompliance.length) : 0}%
                  </p>
                  <p className="text-sm text-amber-600">Overall Compliance</p>
                  <p className="text-xs text-amber-500 mt-1">All Departments</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-bold text-2xl text-green-700">
                    {departmentCompliance.length > 0 ? departmentCompliance.reduce((acc, d) => acc + d.compliant, 0) : 0}
                  </p>
                  <p className="text-sm text-green-600">Trains Compliant</p>
                  <p className="text-xs text-green-500 mt-1">Out of {departmentCompliance.length > 0 ? departmentCompliance[0].total : 0} total</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Certificate Expiry Timeline
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upcoming certificate expiries over the next 7 days
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certificateExpiries.slice(0, 5).map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        cert.priority === 'critical' ? 'bg-red-500' : 
                        cert.priority === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-sm">Train {cert.trainId}</div>
                        <div className="text-xs text-muted-foreground">{cert.certType} - {cert.department}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{cert.expiryTime}</div>
                      <div className="text-xs text-muted-foreground">
                        {cert.hoursRemaining < 24 ? `${cert.hoursRemaining}h` : `${Math.floor(cert.hoursRemaining / 24)}d`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Certificate Expiry Notifications
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Active alerts for upcoming certificate expiries
              </p>
            </CardHeader>
            <CardContent>
              {certificateExpiries.length > 0 ? (
                <div className="space-y-0">
                  {certificateExpiries.map((cert, index) => (
                    <ExpiryNotification
                      key={index}
                      cert={cert}
                      onDismiss={() => {
                        setCertificateExpiries(prev => prev.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active expiry notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-6">
          {/* Blockchain Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Transactions</p>
                  <p className="text-lg font-bold">{blockchainStats.totalTransactions.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Blocks Today</p>
                  <p className="text-lg font-bold">{blockchainStats.blocksToday}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Avg Block Time</p>
                  <p className="text-lg font-bold">{blockchainStats.avgBlockTime}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Network Health</p>
                  <p className="text-lg font-bold text-green-600">{blockchainStats.networkHealth}%</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Last Block</p>
                  <p className="text-xs font-medium">{blockchainStats.lastBlock}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Transaction Feed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction Feed</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by train ID, tx ID, or action..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Train ID</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.txId}>
                      <TableCell className="font-mono text-xs">{tx.txId}</TableCell>
                      <TableCell className="font-medium">{tx.trainId}</TableCell>
                      <TableCell>
                        <ActionBadge action={tx.action} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {tx.department}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.issuer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{tx.timestamp}</TableCell>
                      <TableCell>
                        <StatusChip status={tx.status} expiryHours={tx.expiryHours} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Verification Banner */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-medium text-green-800">Immutable Verification Active</h3>
                  <p className="text-sm text-green-700">
                    All certificate renewals, work order closures, and manager overrides are permanently recorded on the blockchain.
                    Certificate expiry notifications ensure compliance across all safety-critical operations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}