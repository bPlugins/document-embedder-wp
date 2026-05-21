import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Demos from '../../../../bpl-tools/Admin/Demos';
import Pricing from '../../../../bpl-tools/Admin/Pricing';
import FeatureCompare from '../../../../bpl-tools/Admin/FeatureCompare';
import Activation from '../../../../bpl-tools/Admin/Activation';
import OurPlugins from '../../../../bpl-tools/Admin/OurPlugins';

import Layout from './Layout';
import Welcome from './Welcome';
import { demoInfo, pricingInfo } from '../utils/data';

const App = (props) => {
  const { isPremium, hasPro } = props;

  return <Router>
    <Routes>
      <Route path='/' element={<Layout {...props} />}>
        <Route index element={<Welcome {...props} />} />

        <Route path='welcome' element={<Welcome {...props} />} />

        <Route path='demos' element={<Demos demoInfo={demoInfo} {...props} />} />

        {!isPremium && <Route path='pricing' element={<Pricing pricingInfo={pricingInfo} options={{}} {...props} />} />}

        {!isPremium && <Route path='feature-comparison' element={<FeatureCompare plans={['free', 'pro']} {...props} />} />}

        {hasPro && <Route path='activation' element={<Activation {...props} />} />}

        <Route path='our-plugins' element={<OurPlugins slugs={[  '3d-viewer', 'html5-video-player', 'html5-audio-player', 'pdf-poster', 'document-emberdder', 'advanced-post-block', 'advance-custom-html', 'b-carousel-block', 'b-blocks', 'html5-video-player', 'document-embedder-addons-for-elementor', 'b-slider']} {...props} />} />

        <Route path='*' element={<Navigate to='/welcome' replace />} />
      </Route>
    </Routes>
  </Router>
}
export default App;