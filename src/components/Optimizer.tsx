import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Play, RotateCcw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const initialWeights = {
  alpha: { name: 'Readiness', value: 35, description: 'Certificates & maintenance status' },
  beta: { name: 'Branding', value: 25, description: 'Advertisement compliance' },
  gamma: { name: 'Mileage Balance', value: 20, description: 'Even wear distribution' },
  delta: { name: 'Shunt Cost', value: 15, description: 'Depot movement efficiency' },
  epsilon: { name: 'Withdrawal Risk', value: 5, description: 'Future maintenance prediction' }
};

const scenarioComparison = {
  current: {
    punctualityRisk: 12,
    brandingCompliance: 87,
    shuntingHours: 4.2,
    maintenanceCost: 125000
  },
  proposed: {
    punctualityRisk: 8,
    brandingCompliance: 91,
    shuntingHours: 3.8,
    maintenanceCost: 118000
  }
};

function WeightSlider({ name, value, description, onChange }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium">{name}</label>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        max={100}
        step={5}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function ScenarioCard({ title, data, isProposed = false }: any) {
  return (
    <Card className={isProposed ? 'border-primary' : ''}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          {title}
          {isProposed && <Badge variant="default" className="text-xs">Proposed</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Punctuality Risk</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{data.punctualityRisk}%</span>
            {isProposed && data.punctualityRisk < scenarioComparison.current.punctualityRisk && (
              <TrendingDown className="w-3 h-3 text-green-600" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Branding Compliance</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{data.brandingCompliance}%</span>
            {isProposed && data.brandingCompliance > scenarioComparison.current.brandingCompliance && (
              <TrendingUp className="w-3 h-3 text-green-600" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Shunting Hours</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">{data.shuntingHours}h</span>
            {isProposed && data.shuntingHours < scenarioComparison.current.shuntingHours && (
              <TrendingDown className="w-3 h-3 text-green-600" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Maintenance Cost</span>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">₹{(data.maintenanceCost / 1000).toFixed(0)}K</span>
            {isProposed && data.maintenanceCost < scenarioComparison.current.maintenanceCost && (
              <TrendingDown className="w-3 h-3 text-green-600" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Optimizer() {
  const [weights, setWeights] = React.useState(initialWeights);
  const [isOptimizing, setIsOptimizing] = React.useState(false);
  const [allTrains, setAllTrains] = React.useState<any[]>([]);
  const [servicePlan, setServicePlan] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        setAllTrains(data);
        fetch('http://localhost:8000/api/optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(initialWeights),
        })
        .then(res => res.json())
        .then(optimizedData => {
          setServicePlan(optimizedData);
        });
      });
  }, []);

  const standbyTrains = allTrains.filter(t => t.maintenance.status === 'operational').slice(0, 2).map((t, i) => ({ trainId: t.id, status: 'Ready', eta: `${15 * (i + 1)} min`, reason: 'Backup for peak hours' }));
  const iblTrains = allTrains.filter(t => t.maintenance.status === 'in_repair').slice(0, 2).map(t => ({ trainId: t.id, reason: t.maintenance.notes || 'Critical issue', eta: '2-3 days' }));


  const updateWeight = (key: string, value: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: { ...prev[key as keyof typeof prev], value }
    }));
  };

  const handleOptimize = () => {
    setIsOptimizing(true);
    fetch('http://localhost:8000/api/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(weights),
    })
    .then(res => res.json())
    .then(optimizedData => {
      setServicePlan(optimizedData);
      setIsOptimizing(false);
    });
  };

  const resetWeights = () => {
    setWeights(initialWeights);
    handleOptimize();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Multi-Objective Optimizer</h1>
          <p className="text-muted-foreground">Optimize service deployment using weighted criteria</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetWeights}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleOptimize} disabled={isOptimizing}>
            <Play className="w-4 h-4 mr-2" />
            {isOptimizing ? 'Optimizing...' : 'Re-optimize'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Service Plan */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="service-plan" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="service-plan">Service Plan</TabsTrigger>
              <TabsTrigger value="standby">Standby</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            </TabsList>

            <TabsContent value="service-plan">
              <Card>
                <CardHeader>
                  <CardTitle>Ranked Service List</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Trains ranked by weighted optimization score
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Train ID</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Readiness</TableHead>
                        <TableHead>Branding</TableHead>
                        <TableHead>Badges</TableHead>
                        <TableHead>Reasoning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {servicePlan.slice(0, 10).map((train) => (
                        <TableRow key={train.trainId}>
                          <TableCell>
                            <Badge variant={train.rank === 1 ? "default" : "outline"}>
                              #{train.rank}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{train.trainId}</TableCell>
                          <TableCell>
                            <span className="font-semibold">{train.totalScore}</span>
                          </TableCell>
                          <TableCell>{train.readiness}%</TableCell>
                          <TableCell>{train.branding}%</TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {train.badges.map((badge) => (
                                <Badge key={badge} variant="secondary" className="text-xs">
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs text-xs text-muted-foreground">
                            {train.reasoning}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="standby">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Standby Trains</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {standbyTrains.map((train) => (
                        <div key={train.trainId} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{train.trainId}</p>
                            <p className="text-xs text-muted-foreground">{train.reason}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={train.status === 'Ready' ? 'default' : 'secondary'}>
                              {train.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{train.eta}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">In Barn Limit (IBL)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {iblTrains.map((train) => (
                        <div key={train.trainId} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{train.trainId}</p>
                            <Badge variant="outline" className="text-xs">IBL</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{train.reason}</p>
                          <p className="text-xs">ETA: {train.eta}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="scenarios">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ScenarioCard 
                  title="Current Plan" 
                  data={scenarioComparison.current} 
                />
                <ScenarioCard 
                  title="Optimized Plan" 
                  data={scenarioComparison.proposed} 
                  isProposed={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Weight Sliders Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Optimization Weights</CardTitle>
            <p className="text-xs text-muted-foreground">
              Adjust criteria importance for live re-optimization
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(weights).map(([key, weight]) => (
              <WeightSlider
                key={key}
                name={weight.name}
                value={weight.value}
                description={weight.description}
                onChange={(value: number) => updateWeight(key, value)}
              />
            ))}
            
            <Separator />
            
            <div className="text-xs text-muted-foreground">
              <p className="mb-2">Total: {Object.values(weights).reduce((sum, w) => sum + w.value, 0)}%</p>
              <p>Weights will auto-normalize during optimization</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}