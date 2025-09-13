import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Progress } from './ui/progress';
import { Play, Square, SkipForward, Users, MapPin, Clock, IndianRupee, Pause, RotateCcw, Train, AlertCircle, Wrench, Grid, Map, Filter, CheckCircle } from 'lucide-react';

const shuntingPlan = [
  {
    step: 1,
    move: 'T001: BAY-A1 → Service Line 1',
    eta: '14:30',
    crew: 'Team Alpha',
    loco: 'LOCO-01',
    duration: '8 min',
    status: 'executing',
    progress: 75,
    trainId: 'T001'
  },
  {
    step: 2,
    move: 'T005: Wash Bay → BAY-A1',
    eta: '14:38',
    crew: 'Team Alpha',
    loco: 'LOCO-01',
    duration: '12 min',
    status: 'ready',
    progress: 0,
    trainId: 'T005'
  },
  {
    step: 3,
    move: 'T009: BAY-B1 → Workshop',
    eta: '14:50',
    crew: 'Team Beta',
    loco: 'LOCO-02',
    duration: '15 min',
    status: 'waiting',
    progress: 0,
    trainId: 'T009'
  },
  {
    step: 4,
    move: 'T015: Storage → BAY-B1',
    eta: '15:05',
    crew: 'Team Beta',
    loco: 'LOCO-02',
    duration: '10 min',
    status: 'waiting',
    progress: 0,
    trainId: 'T015'
  },
  {
    step: 5,
    move: 'T014: BAY-B6 → Heavy Repair',
    eta: '15:15',
    crew: 'Team Gamma',
    loco: 'LOCO-01',
    duration: '20 min',
    status: 'scheduled',
    progress: 0,
    trainId: 'T014'
  },
  {
    step: 6,
    move: 'T017: BAY-C1 → Service Line 2',
    eta: '15:35',
    crew: 'Team Alpha',
    loco: 'LOCO-01',
    duration: '14 min',
    status: 'scheduled',
    progress: 0,
    trainId: 'T017'
  }
];

const costSummary = {
  totalMoves: 12,
  totalTime: '2.8 hours',
  crewCost: 4200,
  locoCost: 1800,
  totalCost: 6000
};

// Helper Functions
function getBayStatusColor(status: string) {
  switch (status) {
    case 'occupied':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'empty':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'reserved':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
}

function getStepStatusBadge(status: string) {
  switch (status) {
    case 'executing':
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Executing</Badge>;
    case 'ready':
      return <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>;
    case 'waiting':
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Waiting</Badge>;
    case 'scheduled':
      return <Badge variant="outline">Scheduled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getTrainStatusColor(status: string) {
  switch (status) {
    case 'service-ready':
      return 'bg-green-500';
    case 'maintenance':
      return 'bg-amber-500';
    case 'minor-wo':
      return 'bg-orange-500';
    case 'blocked':
      return 'bg-red-500';
    case 'inspection':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
}

function getCarHealthColor(status: string) {
  switch (status) {
    case 'fit':
      return 'bg-green-400';
    case 'minor-issue':
      return 'bg-amber-400';
    case 'blocked':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
}

// Components
function TrainSetIcon({ trainSet, compact = false }: { trainSet: any; compact?: boolean }) {
  const size = compact ? 'w-4 h-3' : 'w-6 h-4';
  
  return (
    <div className="flex items-center gap-0.5">
      {trainSet.cars.map((car: any, index: number) => (
        <div
          key={car.carId}
          className={`${size} rounded-sm ${getCarHealthColor(car.status)} border border-white`}
          title={`${car.carId}${car.issue ? ` - ${car.issue} issue` : ''}`}
        />
      ))}
    </div>
  );
}

function DepotMap({ viewMode, trainSets, depotBays }: { viewMode: string; trainSets: any[], depotBays: any[] }) {
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-5 gap-4">
        {trainSets.map((trainSet) => (
          <Card 
            key={trainSet.id} 
            className={`p-3 cursor-pointer transition-all hover:shadow-md border-2 ${
              trainSet.status === 'service-ready' ? 'border-green-200 bg-green-50' :
              trainSet.status === 'blocked' ? 'border-red-200 bg-red-50' : 
              'border-gray-200'
            }`}
          >
            <div className="text-center space-y-2">
              <div className="font-bold text-sm">{trainSet.id}</div>
              <TrainSetIcon trainSet={trainSet} />
              <div className="text-xs text-muted-foreground">{trainSet.location}</div>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  trainSet.status === 'service-ready' ? 'border-green-500 text-green-700' :
                  trainSet.status === 'blocked' ? 'border-red-500 text-red-700' :
                  'border-amber-500 text-amber-700'
                }`}
              >
                {trainSet.status.replace('-', ' ')}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Depot geometry map
  return (
    <div className="space-y-6">
      {/* Service Lines */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-green-700 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          Service Lines (A1-A8)
        </h4>
        <div className="grid grid-cols-8 gap-2">
          {depotBays.filter(bay => bay.section === 'service').map((bay) => (
            <div
              key={bay.id}
              className={`p-2 border-2 rounded text-center text-xs ${getBayStatusColor(bay.status)}`}
            >
              <div className="font-medium mb-1">{bay.id}</div>
              {bay.train && (
                <>
                  <div className="font-bold">{bay.train}</div>
                  <TrainSetIcon trainSet={trainSets.find(t => t.id === bay.train)} compact />
                </>
              )}
              <div className="text-xs mt-1">{bay.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Lines */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-amber-700 flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          Maintenance Lines (B1-B8)
        </h4>
        <div className="grid grid-cols-8 gap-2">
          {depotBays.filter(bay => bay.section === 'maintenance').map((bay) => (
            <div
              key={bay.id}
              className={`p-2 border-2 rounded text-center text-xs ${getBayStatusColor(bay.status)}`}
            >
              <div className="font-medium mb-1">{bay.id}</div>
              {bay.train && (
                <>
                  <div className="font-bold">{bay.train}</div>
                  <TrainSetIcon trainSet={trainSets.find(t => t.id === bay.train)} compact />
                </>
              )}
              <div className="text-xs mt-1">{bay.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stabling Lines */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-blue-700 flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          Stabling Lines (C1-C8)
        </h4>
        <div className="grid grid-cols-8 gap-2">
          {depotBays.filter(bay => bay.section === 'stabling').map((bay) => (
            <div
              key={bay.id}
              className={`p-2 border-2 rounded text-center text-xs ${getBayStatusColor(bay.status)}`}
            >
              <div className="font-medium mb-1">{bay.id}</div>
              {bay.train && (
                <>
                  <div className="font-bold">{bay.train}</div>
                  <TrainSetIcon trainSet={trainSets.find(t => t.id === bay.train)} compact />
                </>
              )}
              <div className="text-xs mt-1">{bay.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShuntingPlanner() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [playbackStep, setPlaybackStep] = React.useState(0);
  const [viewMode, setViewMode] = React.useState('map');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [activeTab, setActiveTab] = React.useState('supervisor');
  const [trainSets, setTrainSets] = React.useState<any[]>([]);
  const [depotBays, setDepotBays] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:8000/api/trains')
      .then(res => res.json())
      .then(data => {
        const transformedTrainSets = data.map((train: any) => ({
          id: train.id,
          cars: [
            { carId: `${train.id}-C1`, status: 'fit', issue: null },
            { carId: `${train.id}-C2`, status: 'fit', issue: null },
            { carId: `${train.id}-C3`, status: 'fit', issue: null },
          ],
          location: train.shunting.current_location,
          status: train.maintenance.status,
          lastMaintenance: train.maintenance.last_service_date
        }));
        setTrainSets(transformedTrainSets);

        const bays = Array.from({ length: 24 }, (_, i) => {
            const section = String.fromCharCode(65 + Math.floor(i / 8));
            const bayNum = (i % 8) + 1;
            const bayId = `BAY-${section}${bayNum}`;
            const trainOnBay = data.find((t: any) => t.shunting.current_location === bayId);
            return {
                id: bayId,
                status: trainOnBay ? 'occupied' : 'empty',
                train: trainOnBay ? trainOnBay.id : null,
                type: trainOnBay ? trainOnBay.maintenance.status.replace('_', ' ') : 'Available',
                section: section === 'A' ? 'service' : section === 'B' ? 'maintenance' : 'stabling'
            }
        });
        setDepotBays(bays);
      });
  }, []);

  const filteredTrainSets = React.useMemo(() => {
    if (statusFilter === 'all') return trainSets;
    return trainSets.filter(train => {
      switch (statusFilter) {
        case 'service-ready':
          return train.status === 'operational';
        case 'maintenance':
          return ['scheduled', 'in_repair'].includes(train.status);
        case 'blocked':
          return train.status === 'in_repair';
        default:
          return true;
      }
    });
  }, [statusFilter, trainSets]);

  const handlePlayback = () => {
    if (isPlaying) {
      setIsPaused(true);
      setIsPlaying(false);
    } else {
      setIsPaused(false);
      setIsPlaying(true);
      const interval = setInterval(() => {
        setPlaybackStep(prev => {
          if (prev >= shuntingPlan.length - 1) {
            setIsPlaying(false);
            setIsPaused(false);
            clearInterval(interval);
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setPlaybackStep(0);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">🚦 Shunting Planner — Supervisor Train Arrangement View</h1>
          <p className="text-muted-foreground">Interactive depot management with 25 × 3-car train sets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePlayback}>
            {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button>
            <SkipForward className="w-4 h-4 mr-2" />
            Execute Plan
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="supervisor">Supervisor Mode</TabsTrigger>
          <TabsTrigger value="sequence">Move Sequence</TabsTrigger>
          <TabsTrigger value="playback">Animation Playback</TabsTrigger>
        </TabsList>

        <TabsContent value="supervisor" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Train className="w-5 h-5" />
                  Train Set Management (25 × 3-Car Units)
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Trains</SelectItem>
                        <SelectItem value="service-ready">Service Ready</SelectItem>
                        <SelectItem value="maintenance">Under Maintenance</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={viewMode === 'map' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setViewMode('map')}
                    >
                      <Map className="w-4 h-4 mr-2" />
                      Depot Map
                    </Button>
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4 mr-2" />
                      Train Grid
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DepotMap viewMode={viewMode} trainSets={filteredTrainSets} depotBays={depotBays} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <p className="font-bold text-lg text-green-700">
                  {trainSets.filter(t => t.status === 'operational').length}
                </p>
                <p className="text-sm text-green-600">Service Ready</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <p className="font-bold text-lg text-amber-700">
                  {trainSets.filter(t => ['scheduled', 'in_repair'].includes(t.status)).length}
                </p>
                <p className="text-sm text-amber-600">Under Maintenance</p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-red-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <p className="font-bold text-lg text-red-700">
                  {trainSets.filter(t => t.status === 'in_repair').length}
                </p>
                <p className="text-sm text-red-600">Blocked</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <p className="font-bold text-lg text-blue-700">{depotBays.filter(b => b.status === 'occupied').length}</p>
                <p className="text-sm text-blue-600">Bays Occupied</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 bg-gray-50">
              <CardContent className="p-4 text-center">
                <div className="w-8 h-8 bg-gray-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <p className="font-bold text-lg text-gray-700">{Math.round(depotBays.filter(b => b.status === 'occupied').length / depotBays.length * 100)}%</p>
                <p className="text-sm text-gray-600">Depot Utilization</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Car Health Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-green-400 rounded-sm border"></div>
                  <span>Fit for Service</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-amber-400 rounded-sm border"></div>
                  <span>Minor Issue (WO required)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-3 bg-red-400 rounded-sm border"></div>
                  <span>Blocked (Major repair)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Planned Move Sequence</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Optimized shunting operations for the next 2 hours
                  </p>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Step</TableHead>
                        <TableHead>Movement</TableHead>
                        <TableHead>ETA</TableHead>
                        <TableHead>Crew</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shuntingPlan.map((step) => (
                        <TableRow 
                          key={step.step}
                          className={playbackStep >= step.step - 1 ? 'bg-blue-50' : ''}
                        >
                          <TableCell>
                            <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                              {step.step}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-sm">{step.move}</TableCell>
                          <TableCell className="text-sm">{step.eta}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="text-sm">{step.crew}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{step.duration}</TableCell>
                          <TableCell>{getStepStatusBadge(step.status)}</TableCell>
                          <TableCell className="w-20">
                            <Progress value={step.progress} className="h-2" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Moves</span>
                    <span className="font-medium">{costSummary.totalMoves}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Time</span>
                    <span className="font-medium">{costSummary.totalTime}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Crew Cost</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      <span className="font-medium">{costSummary.crewCost.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Locomotive Cost</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      <span className="font-medium">{costSummary.locoCost.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost</span>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      <span className="font-bold text-lg">{costSummary.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <h4 className="font-medium text-sm">Resource Status</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Alpha</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Available</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Beta</span>
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Busy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LOCO-01</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Ready</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">LOCO-02</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Ready</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="playback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Shunting Plan Animation Playback
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Step-by-step visualization of planned movements
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" onClick={handlePlayback}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isPlaying ? 'Pause' : isPaused ? 'Resume' : 'Play'}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Step {playbackStep + 1} of {shuntingPlan.length}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Playback Progress</span>
                  <span>{Math.round(((playbackStep + 1) / shuntingPlan.length) * 100)}%</span>
                </div>
                <Progress value={((playbackStep + 1) / shuntingPlan.length) * 100} className="h-2" />
              </div>

              <Slider
                value={[playbackStep]}
                onValueChange={(value) => setPlaybackStep(value[0])}
                max={shuntingPlan.length - 1}
                step={1}
                className="w-full"
              />
            </CardContent>
          </Card>

          {shuntingPlan[playbackStep] && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  Current Step: {shuntingPlan[playbackStep].move}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">ETA</span>
                    <span className="font-medium">{shuntingPlan[playbackStep].eta}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Crew</span>
                    <span className="font-medium">{shuntingPlan[playbackStep].crew}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Locomotive</span>
                    <span className="font-medium">{shuntingPlan[playbackStep].loco}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Duration</span>
                    <span className="font-medium">{shuntingPlan[playbackStep].duration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}