import React from 'react';
import { Layout } from './components/Layout';
import { DataSources } from './components/DataSources';
import { ConflictRadar } from './components/ConflictRadar';
import { ManagerReview } from './components/ManagerReview';
import { Optimizer } from './components/Optimizer';
import { ShuntingPlanner } from './components/ShuntingPlanner';
import { BlockchainLedger } from './components/BlockchainLedger';
import { BrandingScheduler } from './components/BrandingScheduler';
import { LessonsLearned } from './components/LessonsLearned';

export default function App() {
  const [activeModule, setActiveModule] = React.useState('conflict-radar');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'data-sources':
        return <DataSources />;
      case 'conflict-radar':
        return <ConflictRadar />;
      case 'manager-review':
        return <ManagerReview />;
      case 'optimizer':
        return <Optimizer />;
      case 'shunting':
        return <ShuntingPlanner />;
      case 'blockchain':
        return <BlockchainLedger />;
      case 'branding':
        return <BrandingScheduler />;
      case 'lessons':
        return <LessonsLearned />;
      default:
        return <ConflictRadar />;
    }
  };

  return (
    <Layout
      activeModule={activeModule}
      onModuleChange={setActiveModule}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
    >
      {renderActiveModule()}
    </Layout>
  );
}