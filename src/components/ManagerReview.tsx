import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertTriangle, CheckCircle, Clock, Shield } from 'lucide-react';

export function ManagerReview() {
  const [pendingOverrides, setPendingOverrides] = React.useState<any[]>([]);
  const [auditHistory, setAuditHistory] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        const overrides = data
          .filter((train: any) => train.maintenance.status === 'scheduled' && Object.values(train.certifications).some(c => c === 'expired'))
          .map((train: any, index: number) => ({
            id: `OVR-00${index + 1}`,
            trainId: train.id,
            requestedBy: 'Depot Supervisor',
            reason: 'Critical service requirement',
            riskLevel: 'High',
            evidence: train.maintenance.notes || 'Emergency deployment needed',
            timestamp: '2 mins ago',
            status: 'pending'
          }));
        setPendingOverrides(overrides);

        const history = data
          .filter((train: any) => train.maintenance.status === 'operational')
          .slice(0, 3)
          .map((train: any, index: number) => ({
            id: `AUD-10${index + 1}`,
            action: 'Force Deploy Override',
            trainId: train.id,
            approvedBy: 'Senior Manager',
            timestamp: new Date(train.timestamp).toLocaleString(),
            evidence: 'Emergency service restoration',
            outcome: 'Successful - No incidents'
          }));
        setAuditHistory(history);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Manager Review & Overrides</h1>
        <p className="text-muted-foreground">Review and approve safety-critical override requests</p>
      </div>

      {/* Pending Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Pending Override Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingOverrides.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-muted-foreground">No pending override requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOverrides.map((override) => (
                <div key={override.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{override.id}</h3>
                        <Badge variant="outline" className="text-xs">Train {override.trainId}</Badge>
                        <Badge 
                          variant={override.riskLevel === 'High' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {override.riskLevel} Risk
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{override.reason}</p>
                      <p className="text-xs text-muted-foreground mb-3">{override.evidence}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Requested by: {override.requestedBy}</span>
                        <span>Time: {override.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        View Details
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs h-8">
                        Reject
                      </Button>
                      <Button size="sm" className="text-xs h-8">
                        Approve
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-3 bg-amber-50 border-amber-200 border rounded text-xs">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-800">
                        Override will be recorded on blockchain ledger
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Trail</CardTitle>
          <p className="text-sm text-muted-foreground">
            Historical record of management decisions and outcomes
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Train ID</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Evidence</TableHead>
                <TableHead>Outcome</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditHistory.map((audit) => (
                <TableRow key={audit.id}>
                  <TableCell className="font-mono text-xs">{audit.id}</TableCell>
                  <TableCell className="font-medium">{audit.action}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{audit.trainId}</Badge>
                  </TableCell>
                  <TableCell>{audit.approvedBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{audit.timestamp}</TableCell>
                  <TableCell className="max-w-xs text-xs text-muted-foreground">{audit.evidence}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      {audit.outcome}
                    </Badge>
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