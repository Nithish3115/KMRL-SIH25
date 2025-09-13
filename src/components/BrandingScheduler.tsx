import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, IndianRupee, Calendar } from 'lucide-react';

const forecastData = [
  { day: 'Sep 4', target: 180, actual: 165, projected: 165 },
  { day: 'Sep 5', target: 180, actual: 172, projected: 172 },
  { day: 'Sep 6', target: 180, actual: 158, projected: 158 },
  { day: 'Sep 7', target: 180, actual: 185, projected: 185 },
  { day: 'Sep 8', target: 180, actual: 0, projected: 175 },
  { day: 'Sep 9', target: 180, actual: 0, projected: 182 },
  { day: 'Sep 10', target: 180, actual: 0, projected: 178 },
  { day: 'Sep 11', target: 180, actual: 0, projected: 186 },
];

const hourlyDistribution = [
  { hour: '06:00', revenue: 85, utilization: 45 },
  { hour: '07:00', revenue: 120, utilization: 78 },
  { hour: '08:00', revenue: 155, utilization: 92 },
  { hour: '09:00', revenue: 145, utilization: 85 },
  { hour: '10:00', revenue: 98, utilization: 58 },
  { hour: '11:00', revenue: 105, utilization: 62 },
  { hour: '12:00', revenue: 110, utilization: 65 },
  { hour: '13:00', revenue: 115, utilization: 68 },
  { hour: '14:00', revenue: 108, utilization: 64 },
  { hour: '15:00', revenue: 125, utilization: 74 },
  { hour: '16:00', revenue: 140, utilization: 82 },
  { hour: '17:00', revenue: 165, utilization: 95 },
  { hour: '18:00', revenue: 170, utilization: 98 },
  { hour: '19:00', revenue: 148, utilization: 87 },
  { hour: '20:00', revenue: 125, utilization: 74 },
  { hour: '21:00', revenue: 95, utilization: 56 },
];

const recommendations = [
  {
    type: 'urgent',
    title: 'Move TechCorp wrap to peak slots',
    description: 'Allocate MET-004 to 07:00–09:00 and 17:00–19:00 slots to maximize exposure',
    impact: '+12 hours/day',
    saving: '₹15,000 penalty avoided'
  },
  {
    type: 'optimization',
    title: 'Kerala Tourism early completion',
    description: 'Contract ahead of schedule. Consider reallocating MET-006 to at-risk contracts',
    impact: 'Free capacity',
    saving: '₹8,000 opportunity'
  },
  {
    type: 'warning',
    title: 'City Mall critical shortage',
    description: 'Requires immediate intervention. Deploy additional train or extend contract terms',
    impact: '24.8 hours/day needed',
    saving: '₹28,000 at risk'
  }
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'ahead':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Ahead</Badge>;
    case 'on-track':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">On Track</Badge>;
    case 'at-risk':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">At Risk</Badge>;
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'ahead':
    case 'on-track':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'at-risk':
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return null;
  }
}

export function BrandingScheduler() {
  const [brandingContracts, setBrandingContracts] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        const contracts = data
          .filter((train: any) => train.branding)
          .map((train: any) => {
            const { advertiser, contract_hours_per_day, achieved_hours_today, daily_revenue } = train.branding;
            const remaining = contract_hours_per_day - achieved_hours_today;
            const progress = (achieved_hours_today / contract_hours_per_day) * 100;
            let status = 'on-track';
            if (progress > 95) {
              status = 'ahead';
            } else if (progress < 50) {
              status = 'at-risk';
            } else if (progress < 25) {
              status = 'critical';
            }

            return {
              advertiser,
              targetHours: contract_hours_per_day,
              achieved: achieved_hours_today,
              remaining,
              daysLeft: 30, // Placeholder
              status,
              penalty: status === 'critical' ? daily_revenue * 0.5 : 0,
              trains: [train.id],
              dailyAvg: achieved_hours_today / (new Date().getDate()), // Placeholder
              required: (remaining / 30) // Placeholder
            };
          });
        setBrandingContracts(contracts);
      });
  }, []);

  const summary = {
    activeContracts: brandingContracts.length,
    totalRevenue: brandingContracts.reduce((acc, c) => acc + c.achieved * 2500, 0),
    atRisk: brandingContracts.reduce((acc, c) => acc + c.penalty, 0),
    avgUtilization: brandingContracts.reduce((acc, c) => acc + (c.achieved / c.targetHours), 0) / (brandingContracts.length || 1) * 100
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Predictive Branding Scheduler</h1>
        <p className="text-muted-foreground">Manage advertisement contracts and optimize train allocations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Active Contracts</p>
                <p className="text-2xl font-bold">{summary.activeContracts}</p>
              </div>
              <Calendar className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{(summary.totalRevenue / 1000000).toFixed(1)}M</p>
              </div>
              <IndianRupee className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold text-red-600">₹{(summary.atRisk / 1000).toFixed(0)}K</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg Utilization</p>
                <p className="text-2xl font-bold">{summary.avgUtilization.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Performance Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advertiser</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead>Daily Avg</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Penalty Risk</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brandingContracts.map((contract) => (
                <TableRow key={contract.advertiser}>
                  <TableCell className="font-medium">{contract.advertiser}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{contract.achieved}</span>
                        <span>{contract.targetHours}</span>
                      </div>
                      <Progress 
                        value={(contract.achieved / contract.targetHours) * 100} 
                        className="w-20"
                      />
                    </div>
                  </TableCell>
                  <TableCell>{contract.remaining}h</TableCell>
                  <TableCell>{contract.daysLeft}</TableCell>
                  <TableCell>{contract.dailyAvg.toFixed(1)}h</TableCell>
                  <TableCell className={contract.required > contract.dailyAvg ? 'text-red-600 font-medium' : ''}>
                    {contract.required.toFixed(1)}h
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>
                    {contract.penalty > 0 ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <IndianRupee className="w-3 h-3" />
                        <span className="text-sm font-medium">{(contract.penalty / 1000).toFixed(0)}K</span>
                      </div>
                    ) : (
                      <span className="text-green-600 text-sm">None</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revenue Forecast</CardTitle>
            <p className="text-xs text-muted-foreground">Target vs Actual vs Projected daily revenue</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="target" stroke="#0073e6" strokeDasharray="5 5" name="Target" />
                <Line type="monotone" dataKey="actual" stroke="#28a745" strokeWidth={2} name="Actual" />
                <Line type="monotone" dataKey="projected" stroke="#ffc107" strokeWidth={2} name="Projected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Peak Hours Analysis</CardTitle>
            <p className="text-xs text-muted-foreground">Revenue and utilization by hour</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0073e6" name="Revenue (₹)" />
                <Bar dataKey="utilization" fill="#28a745" name="Utilization %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <p className="text-sm text-muted-foreground">
            Automated suggestions to optimize contract performance
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {rec.type === 'urgent' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                      {rec.type === 'optimization' && <TrendingUp className="w-4 h-4 text-blue-600" />}
                      {rec.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                      <Badge 
                        variant={rec.type === 'urgent' ? 'destructive' : rec.type === 'warning' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-600 font-medium">Impact: {rec.impact}</span>
                      <span className="text-blue-600 font-medium">{rec.saving}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      View Details
                    </Button>
                    <Button size="sm" className="text-xs h-7">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}