import React, { useEffect } from 'react';
import { seedDatabaseIfEmpty } from './db';
import { PosPage } from './pages/PosPage';

export const App: React.FC = () => {
  useEffect(() => {
    seedDatabaseIfEmpty().catch((err) => {
      console.error('Failed to initialize database:', err);
    });
  }, []);

  return <PosPage />;
};

export default App;
