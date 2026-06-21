import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import Batches from '@/pages/Batches'
import Certificates from '@/pages/Certificates'
import Records from '@/pages/Records'
import AlertOverlay from '@/components/AlertOverlay'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Batches />} />
          <Route path="/certificates" element={<Certificates />} />
          <Route path="/records" element={<Records />} />
        </Route>
      </Routes>
      <AlertOverlay />
    </Router>
  )
}
