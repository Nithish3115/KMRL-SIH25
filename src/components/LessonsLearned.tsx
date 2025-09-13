import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TrendingUp, TrendingDown, Brain, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';

export function LessonsLearned() {
  const [aiUpdates, setAiUpdates] = React.useState<any[]>([]);
  const [simulationResults, setSimulationResults] = React.useState<any>(null);
  const [learningHistory, setLearningHistory] = React.useState<any[]>([]);
  const [modelMetrics, setModelMetrics] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        const updates = [
          {
            category: 'Risk Model Accuracy',
            improvement: '+12%',
            description: 'Machine learning model now better predicts brake system failures',
            confidence: 94,
            impact: 'High',
            lastUpdated: '3 days ago'
          },
          {
            category: 'Suggested Weight Shift',
            improvement: 'Alpha: 35% → 30%',
            description: 'Reduce readiness weight, increase mileage balance for better wear distribution',
            confidence: 87,
            impact: 'Medium',
            lastUpdated: '1 week ago'
          },
          {
            category: 'Shunt Heuristic Improvement',
            improvement: '-15% moves',
            description: 'New algorithm reduces depot movements by batching compatible operations',
            confidence: 91,
            impact: 'High',
            lastUpdated: '5 days ago'
          }
        ];
        setAiUpdates(updates);

        const simResults = {
          current: {
            punctuality: 94.2,
            brandingCompliance: 87.5,
            maintenanceCost: 125000,
            shuntingHours: 4.2
          },
          proposed: {
            punctuality: 95.8,
            brandingCompliance: 89.1,
            maintenanceCost: 118000,
            shuntingHours: 3.6
          }
        };
        setSimulationResults(simResults);

        const history = data
          .slice(0, 3)
          .map((train: any, index: number) => ({
            date: new Date(train.timestamp).toLocaleDateString(),
            change: `Weight Adjustment Approved for ${train.id}`,
            manager: 'Operations Manager',
            impact: `Improved punctuality by ${Math.random().toFixed(1)}%`,
            status: 'active'
          }));
        setLearningHistory(history);

        const metrics = [
          { metric: 'Prediction Accuracy', current: 94.2, target: 95.0, trend: 'up' },
          { metric: 'False Positive Rate', current: 3.8, target: 3.0, trend: 'down' },
          { metric: 'Model Confidence', current: 91.5, target: 90.0, trend: 'up' },
          { metric: 'Response Time', current: 0.8, target: 1.0, trend: 'down' }
        ];
        setModelMetrics(metrics);
      });
  }, []);

  if (!simulationResults) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Lessons Learned AI</h1>
        <p className="text-muted-foreground">Continuous learning and model optimization based on operational data</p>
      </div>

      {/* AI Learning Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {aiUpdates.map((update, index) => (
          <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm">{update.category}</CardTitle>
                  <Badge 
                    variant={update.impact === 'High' ? 'default' : 'secondary'} 
                    className="mt-2 text-xs"
                  >
                    {update.impact} Impact
                  </Badge>
                </div>
                <Brain className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-600">{update.improvement}</span>
                </div>
                
                <p className="text-sm text-muted-foreground">{update.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Confidence</span>
                    <span>{update.confidence}%</span>
                  </div>
                  <Progress value={update.confidence} className="h-2" />
                </div>
                
                <p className="text-xs text-muted-foreground">Updated {update.lastUpdated}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulation">Simulation Playground</TabsTrigger>
          <TabsTrigger value="metrics">Model Metrics</TabsTrigger>
          <TabsTrigger value="history">Decision History</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current vs Proposed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Punctuality</span>
                  <span className="font-medium">{simulationResults.current.punctuality}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Branding Compliance</span>
                  <span className="font-medium">{simulationResults.current.brandingCompliance}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maintenance Cost</span>
                  <span className="font-medium">₹{(simulationResults.current.maintenanceCost / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Shunting Hours</span>
                  <span className="font-medium">{simulationResults.current.shuntingHours}h</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  Proposed Configuration
                  <Badge variant="default" className="text-xs">AI Optimized</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Punctuality</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{simulationResults.proposed.punctuality}%</span>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Branding Compliance</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{simulationResults.proposed.brandingCompliance}%</span>
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maintenance Cost</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">₹{(simulationResults.proposed.maintenanceCost / 1000).toFixed(0)}K</span>
                    <TrendingDown className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Shunting Hours</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{simulationResults.proposed.shuntingHours}h</span>
                    <TrendingDown className="w-3 h-3 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Manager Decision Panel */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-sm">Manager Decision Panel</CardTitle>
              <p className="text-xs text-muted-foreground">
                Review AI recommendations and approve changes to system parameters
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-sm mb-1">Apply AI Optimizations</h4>
                  <p className="text-xs text-muted-foreground">
                    Implement suggested weight adjustments and algorithm improvements
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Review Details
                  </Button>
                  <Button variant="destructive" size="sm" className="text-xs">
                    Reject
                  </Button>
                  <Button size="sm" className="text-xs">
                    Approve & Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">AI Model Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {modelMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-1">
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-green-600" />
                        )}
                        <span className="text-sm">{metric.current}%</span>
                      </div>
                    </div>
                    <Progress value={(metric.current / metric.target) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: {metric.current}%</span>
                      <span>Target: {metric.target}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Decision History</CardTitle>
              <p className="text-xs text-muted-foreground">
                Track of approved AI recommendations and their outcomes
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {learningHistory.map((decision, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{decision.change}</h4>
                          <Badge 
                            variant={decision.status === 'active' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {decision.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{decision.impact}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Approved by: {decision.manager}</span>
                          <span>Date: {decision.date}</span>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600 ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}