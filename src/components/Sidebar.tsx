import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Snowflake, Truck, FileCheck, ClipboardList, ChevronsLeft, ChevronsRight } from 'lucide-react'

const navItems = [
  { to: '/', icon: Truck, label: '在途批次' },
  { to: '/certificates', icon: FileCheck, label: '温控凭证' },
  { to: '/records', icon: ClipboardList, label: '处置记录' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`flex flex-col bg-cold-sidebar border-r border-cold-border h-screen transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-52'
      }`}
    >
      <div className="flex items-center gap-2 px-4 h-14 border-b border-cold-border shrink-0">
        <Snowflake className="w-6 h-6 text-cold-accent shrink-0" />
        {!collapsed && (
          <span className="font-title font-semibold text-white text-base whitespace-nowrap">
            冷链通关
          </span>
        )}
      </div>

      <nav className="flex-1 py-3 flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 h-10 rounded-md transition-colors duration-200 ${
                collapsed ? 'justify-center px-0' : 'px-3'
              } ${
                isActive
                  ? 'bg-cold-accent/10 text-cold-accent border-l-[3px] border-cold-accent'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="font-body text-sm whitespace-nowrap">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cold-border p-2 shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full h-9 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors duration-200"
        >
          {collapsed ? (
            <ChevronsRight className="w-5 h-5" />
          ) : (
            <ChevronsLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  )
}
