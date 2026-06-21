import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import StatsBar from '@/components/StatsBar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-cold-bg overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 pt-4">
          <StatsBar />
        </div>
        <main className="flex-1 overflow-auto px-6 py-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
