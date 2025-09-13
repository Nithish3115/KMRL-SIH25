import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { AlertTriangle, CheckCircle, Clock, IndianRupee, Eye, RefreshCw, ArrowUpDown } from 'lucide-react';

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'clear':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'risk':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'blocked':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'clear':
      return <Badge className="bg-green-100 text-green-800 border-green-200">🟢 CLEAR</Badge>;
    case 'risk':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">🟠 RISK</Badge>;
    case 'blocked':
      return <Badge variant="destructive">🔴 BLOCKED</Badge>;
    default:
      return <Badge variant="outline">UNKNOWN</Badge>;
  }
}

function TrainDetailModal({ train }: { train: any }) {
  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Train Details - {train.trainId}</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Certificates Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Certificates Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(train.certificates).map(([type, cert]: [string, any]) => (
              <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium capitalize">{type.replace('_cert', '').replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">Status: {cert}</p>
                </div>
                <Badge variant={cert === 'valid' ? "secondary" : "destructive"} className={cert === 'valid' ? "bg-green-100 text-green-800" : ""}>
                  {cert === 'valid' ? "Valid" : "Expired"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Work Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Open Work Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {train.workOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No open work orders</p>
            ) : (
              <div className="space-y-3">
                {train.workOrders.map((wo: any) => (
                  <div key={wo.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{wo.id}</span>
                      <Badge variant={wo.severity === 'critical' ? 'destructive' : wo.severity === 'high' ? 'default' : 'secondary'}>
                        {wo.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{wo.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Explanation */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">AI Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2">Why flagged?</h4>
                <p className="text-sm text-muted-foreground">{train.evidence}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Risk Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={train.riskScore} className="w-20" />
                    <span className="text-sm font-medium">{train.riskScore}%</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Expected Impact</p>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />
                    <span className="text-sm font-medium">{train.impact}/min</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Recommended Action</h4>
                <p className="text-sm">{train.action}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DialogContent>
  );
}

export function ConflictRadar() {
  const [conflictData, setConflictData] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        const transformedData = data.map((train: any) => {
          let status = 'clear';
          let reason = 'All systems operational';
          let riskScore = 10;
          let impact = 0;
          let evidence = 'All certificates valid, no open work orders';
          let action = 'Deploy as scheduled';

          if (train.maintenance.status === 'in_repair') {
            status = 'blocked';
            reason = 'Train is in repair';
            riskScore = 95;
            impact = 450;
            evidence = train.maintenance.notes;
            action = 'Do not deploy - repair required';
          } else if (Object.values(train.certifications).some(c => c === 'expired')) {
            status = 'blocked';
            reason = 'Certificate expired';
            riskScore = 90;
            impact = 400;
            evidence = `Expired certs: ${Object.entries(train.certifications).filter(([k, v]) => v === 'expired').map(([k]) => k).join(', ')}`;
            action = 'Do not deploy - renew certificate';
          } else if (train.maintenance.status === 'scheduled') {
            status = 'risk';
            reason = 'Maintenance scheduled soon';
            riskScore = 65;
            impact = 125;
            evidence = `Next service: ${train.maintenance.next_service_date}`;
            action = 'Schedule maintenance or expedite';
          }

          return {
            trainId: train.id,
            status,
            reason,
            riskScore,
            impact,
            evidence,
            action,
            certificates: train.certifications,
            workOrders: [], // This would need to be populated from a different data source
            telemetry: { odometer: 0, vibration: 'Normal', hvac: 'Operational' } // This would need to be populated from a different data source
          };
        });
        setConflictData(transformedData);
      });
  }, []);

  const summary = {
    clear: conflictData.filter(t => t.status === 'clear').length,
    risk: conflictData.filter(t => t.status === 'risk').length,
    blocked: conflictData.filter(t => t.status === 'blocked').length,
    avgRisk: Math.round(conflictData.reduce((acc, t) => acc + t.riskScore, 0) / (conflictData.length || 1))
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Conflict Radar</h1>
          <p className="text-muted-foreground">Real-time conflict detection and risk assessment for train deployment</p>
        </div>
        <Button className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Clear</p>
                <p className="text-2xl font-bold text-green-600">{summary.clear}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-amber-500">{summary.risk}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Blocked</p>
                <p className="text-2xl font-bold text-red-600">{summary.blocked}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Risk</p>
                <p className="text-2xl font-bold">{summary.avgRisk}%</p>
              </div>
              <ArrowUpDown className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conflict Table */}
      <Card>
        <CardHeader>
          <CardTitle>Train Conflict Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Impact (₹/min)</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conflictData.map((train) => (
                <TableRow key={train.trainId}>
                  <TableCell className="font-medium">{train.trainId}</TableCell>
                  <TableCell>{getStatusBadge(train.status)}</TableCell>
                  <TableCell className="max-w-xs truncate">{train.reason}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={train.riskScore} className="w-16" />
                      <span className="text-sm">{train.riskScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {train.impact}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{train.evidence}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <TrainDetailModal train={train} />
                      </Dialog>
                      
                      {train.status === 'clear' && (
                        <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700">
                          Accept
                        </Button>
                      )}
                      
                      {train.status === 'risk' && (
                        <>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Expedite
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            Swap
                          </Button>
                        </>
                      )}
                      
                      {train.status === 'blocked' && (
                        <Button size="sm" variant="destructive" className="h-7 text-xs" disabled>
                          Blocked
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}