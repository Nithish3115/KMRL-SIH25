import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { CheckCircle, AlertTriangle, FileText, ExternalLink, Clock } from 'lucide-react';

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'error':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'healthy':
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Healthy</Badge>;
    case 'warning':
      return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Warning</Badge>;
    case 'error':
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function DataSources() {
  const [dataSources, setDataSources] = React.useState<any[]>([]);
  const [validationData, setValidationData] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        const sources = {
          "IBM_Maximo": { name: "CMMS", description: "Computerized Maintenance Management System", issues: 0, recordCount: 0, lastUpdate: new Date().toISOString() },
          "IoT_Sensor_Data": { name: "IoT Sensors", description: "Internet of Things Telemetry", issues: 0, recordCount: 0, lastUpdate: new Date().toISOString() },
          "Manual_Input": { name: "Manual Input", description: "User-provided data", issues: 0, recordCount: 0, lastUpdate: new Date().toISOString() },
        };

        data.forEach((train: any) => {
          sources[train.source].recordCount++;
          if (Object.values(train.certifications).some(c => c === 'expired')) {
            sources[train.source].issues++;
          }
        });

        const sourceList = Object.values(sources).map(s => ({
            ...s,
            status: s.issues > 0 ? 'warning' : 'healthy',
            lastUpdate: '2 mins ago' // placeholder
        }));

        setDataSources(sourceList);

        const validation = data.slice(0, 5).map((train: any) => ({
            trainId: train.id,
            aliases: [train.id.replace('KMRL-', ''), train.id.replace('KMRL-T', 'K')],
            canonical: train.id,
            status: Object.values(train.certifications).some(c => c === 'expired') ? 'data_weak' : 'ok',
            lastSeen: '5 mins ago' // placeholder
        }));
        setValidationData(validation);
      });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Data Sources</h1>
        <p className="text-muted-foreground">Monitor and validate data ingestion from all connected systems</p>
      </div>

      {/* Data Source Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dataSources.map((source) => (
          <Card key={source.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
                </div>
                {getStatusIcon(source.status)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Records:</span>
                  <span className="font-medium">{source.recordCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Last Update:</span>
                  <span>{source.lastUpdate}</span>
                </div>
                <div className="flex justify-between items-center">
                  {getStatusBadge(source.status)}
                  {source.issues > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {source.issues} issues
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1 mt-3">
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1">
                    <FileText className="w-3 h-3 mr-1" />
                    JSON
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs flex-1">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Validation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Train ID Mapping Validation</CardTitle>
          <p className="text-sm text-muted-foreground">
            Consistency check for train identifiers across systems
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train ID</TableHead>
                <TableHead>Aliases</TableHead>
                <TableHead>Canonical ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationData.map((item) => (
                <TableRow key={item.trainId}>
                  <TableCell className="font-medium">{item.trainId}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {item.aliases.map((alias) => (
                        <Badge key={alias} variant="outline" className="text-xs">
                          {alias}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{item.canonical}</TableCell>
                  <TableCell>
                    {item.status === 'ok' ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        OK
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        DATA_WEAK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.lastSeen}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Resolve
                    </Button>
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