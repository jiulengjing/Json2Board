import { useState } from 'react';
import HomeTab from './components/HomeTab';
import GtgWorkspace from './components/GtgWorkspace';

export interface TabData {
  id: string;
  title: string;
}

export default function App() {
  const [tabs, setTabs] = useState<TabData[]>([{ id: 'workspace-1', title: 'Blueprint 1' }]);
  const [activeTabId, setActiveTabId] = useState<string>('workspace-1');

  const handleAddTab = () => {
    const id = `workspace-${Date.now()}`;
    const title = `Blueprint ${tabs.length + 1}`;
    setTabs(prev => [...prev, { id, title }]);
    setActiveTabId(id);
  };

  const handleCloseTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const idx = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      if (newTabs.length > 0) setActiveTabId(newTabs[Math.max(0, idx - 1)].id);
      else setActiveTabId('home');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#111113', color: '#d4d4d8', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      {/* ── Single Top Bar: Brand + Tabs ── */}
      <div data-tauri-drag-region style={{
        height: '40px', minHeight: '40px', display: 'flex', alignItems: 'center',
        padding: '0 12px', gap: '12px',
        background: '#18181b', borderBottom: '1px solid #27272a',
        userSelect: 'none', WebkitUserSelect: 'none'
      }}>
        
        {/* Brand */}
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', letterSpacing: '0.03em', flexShrink: 0, whiteSpace: 'nowrap', pointerEvents: 'none' }}>
          UE5-Graph-Text-Graph
        </span>

        {/* Separator */}
        <div style={{ width: '1px', height: '16px', background: '#27272a', flexShrink: 0 }} />

        {/* Tabs Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, overflowX: 'auto' }}>

          {/* Home / Docs Tab */}
          <button
            onClick={() => setActiveTabId('home')}
            style={{
              padding: '3px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer',
              fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', transition: 'background 0.1s, color 0.1s',
              background: activeTabId === 'home' ? '#27272a' : 'transparent',
              color: activeTabId === 'home' ? '#e4e4e7' : '#71717a',
            }}
            onMouseEnter={e => { if (activeTabId !== 'home') e.currentTarget.style.color = '#a1a1aa'; }}
            onMouseLeave={e => { if (activeTabId !== 'home') e.currentTarget.style.color = '#71717a'; }}
          >
            使用说明
          </button>

          {/* Blueprint Workspace Tabs */}
          {tabs.map(tab => (
            <div key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '3px 8px 3px 10px', borderRadius: '4px', cursor: 'pointer',
                fontSize: '12px', fontWeight: 500, whiteSpace: 'nowrap', transition: 'background 0.1s, color 0.1s',
                background: activeTabId === tab.id ? '#27272a' : 'transparent',
                color: activeTabId === tab.id ? '#e4e4e7' : '#71717a',
              }}
              onMouseEnter={e => { if (activeTabId !== tab.id) e.currentTarget.style.color = '#a1a1aa'; }}
              onMouseLeave={e => { if (activeTabId !== tab.id) e.currentTarget.style.color = '#71717a'; }}
            >
              <span>{tab.title}</span>
              <button
                onClick={(e) => handleCloseTab(e, tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '14px', height: '14px', borderRadius: '3px',
                  background: 'transparent', border: 'none', color: '#52525b',
                  cursor: 'pointer', fontSize: '10px', lineHeight: 1, padding: 0, transition: 'all 0.1s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3f3f46'; e.currentTarget.style.color = '#f4f4f5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#52525b'; }}
              >✕</button>
            </div>
          ))}

          {/* New Tab Button */}
          <button
            onClick={handleAddTab}
            title="新建蓝图工作区 (New Blueprint Workspace)"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '22px', height: '22px', borderRadius: '4px',
              background: 'transparent', border: 'none', color: '#52525b',
              cursor: 'pointer', fontSize: '14px', transition: 'all 0.1s', flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#27272a'; e.currentTarget.style.color = '#a1a1aa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#52525b'; }}
          >+</button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, display: activeTabId === 'home' ? 'flex' : 'none', overflow: 'auto' }}>
          <HomeTab />
        </div>
        {tabs.map(tab => (
          <div key={tab.id} style={{ position: 'absolute', inset: 0, display: activeTabId === tab.id ? 'flex' : 'none' }}>
            <GtgWorkspace tabId={tab.id} />
          </div>
        ))}
      </div>
    </div>
  );
}
