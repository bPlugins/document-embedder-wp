import { createRoot } from 'react-dom/client';

import './admin.scss';
import App from './Components/App';
import { dashboardInfo } from './utils/data';

document.addEventListener('DOMContentLoaded', () => {
  const dashboardEl = document.getElementById('bpldeDashboard');
  const info = JSON.parse(dashboardEl.dataset.info);

  createRoot(dashboardEl).render(<App {...dashboardInfo(info)} />);

  dashboardEl.removeAttribute('data-info');
});