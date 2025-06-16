import { CanvasFormTabsProvider } from '../form/providers/canvas-form-tabs.provider';
import { Dashboard } from './dashboard/Dashboard';
import { Shell } from './layout/Shell';
import { CurrentSchemaProvider } from './providers/CurrentSchemaProvider';
import { ModelProvider } from './providers/ModelProvider';

function App() {
  return (
    <CurrentSchemaProvider>
      <ModelProvider>
        <CanvasFormTabsProvider tab="All">
          <Shell>
            <Dashboard />
          </Shell>
        </CanvasFormTabsProvider>
      </ModelProvider>
    </CurrentSchemaProvider>
  );
}

export default App;
