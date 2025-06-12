import '@patternfly/react-core/dist/styles/base.css'; // This import needs to be first
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  /*
   * <React.StrictMode>
   * </React.StrictMode>,
   */
  <App />,
);
