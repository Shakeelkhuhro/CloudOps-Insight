import React, { useEffect, useState, Suspense } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import Sparkline from './components/Sparkline'
const RealtimeChart = React.lazy(() => import('./components/RealtimeChart'))
import Toast from './components/Toast'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function HealthCard({ title, value, okText='Running', badText='Down' }){
  const isOk = value && (value === 'running' || value === 'healthy' || value === 'connected')
  return (
    <div className={`card health-card ${isOk? 'Good':'bad'}`}>
      <div className="card-title">{title}</div>
      <div className="card-value">{isOk? okText : badText}</div>
    </div>
  )
}

function MetricCard({ title, value, unit }){
  return (
    <div className="card metric-card">
      <div className="card-title">{title}</div>
      <div className="card-value">{value}{unit}</div>
    </div>
  )
}

export default function App(){
  const [metrics, setMetrics] = useState([])
  const [deployments, setDeployments] = useState([])
  const [health, setHealth] = useState({})
  const [connected, setConnected] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(()=>{
    fetchAll()
    const t = setInterval(fetchMetrics, 3000)
    const socket = io(API, { transports: ['websocket', 'polling'] })
    socket.on('connect', ()=>{ setConnected(true); console.log('socket connected', socket.id) })
    socket.on('disconnect', ()=> setConnected(false))
    socket.on('metrics', (m)=>{
      setMetrics(prev => [...prev.slice(-60), { timestamp: m.timestamp, cpu: m.cpu, memory: m.memory }])
    })
    socket.on('deployment', (d)=>{
      setDeployments(prev => [d, ...prev].slice(0,50))
    })

    return ()=> { clearInterval(t); socket.disconnect() }
  },[])

  async function fetchAll(){
    await fetchMetrics(); fetchDeployments(); fetchHealth();
  }
  async function fetchMetrics(){
    try{
      const r = await axios.get(`${API}/api/metrics`)
      setMetrics(m => [...m.slice(-60), { timestamp: Date.now(), cpu: Number(r.data.cpu), memory: Number(r.data.memory) }])
    }catch(err){console.error(err)}
  }
  async function fetchDeployments(){
    try{ const r = await axios.get(`${API}/api/deployments`); setDeployments(r.data); }catch(e){console.error(e)}
  }
  async function fetchHealth(){
    try{ const r = await axios.get(`${API}/api/health`); setHealth(r.data); }catch(e){console.error(e)}
  }
  async function triggerDeploy(){
    try{
      const r = await axios.post(`${API}/api/deployments`, { branch: 'main' })
      // optimistic update: show running entry immediately
      const id = r.id || (r.data && r.data.id) || r.id
      const running = { id: id || `local-${Date.now()}`, timestamp: Date.now(), status: 'running', branch: 'main' }
      setDeployments(prev => [running, ...prev].slice(0,50))
      setToast('Deployment started')
      // fetch to refresh when backend updates
      fetchDeployments()
    }catch(e){ console.error(e); setToast('Deployment failed to start') }
  }

  const latest = metrics.length ? metrics[metrics.length-1] : { cpu: '-', memory: '-' }

  return (
    <div className="container">
      <header className="app-header">
        <div>
          <h1>CloudOps Insight</h1>
          <p className="muted">Real-time monitoring demo, metrics, deployments and uptime</p>
        </div>
        <div className="header-actions">
          <div className={`conn ${connected? 'on':'off'}`}>{connected? 'Live':'Offline'}</div>
          <button className="btn" onClick={triggerDeploy}>Trigger Deployment</button>
        </div>
      </header>

      <section className="health-row">
        <HealthCard title="Frontend" value={health.frontend} />
        <HealthCard title="Backend" value={health.backend} />
        <HealthCard title="Database" value={health.database} />
      </section>

      <section className="summary-row">
        <MetricCard title="CPU" value={latest.cpu} unit="%" />
        <MetricCard title="Memory" value={latest.memory} unit="%" />
        <div className="card chart-card">
          <div className="card-title">Realtime CPU / Memory</div>
          <div style={{ height: 220 }}>
            <Suspense fallback={<div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center'}}>Loading chart...</div>}>
              <RealtimeChart data={metrics} />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="deployments">
        <h2>Deployment History</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Time</th><th>Branch</th><th>Status</th><th>Duration</th></tr></thead>
            <tbody>
              {deployments.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign:'center', padding:'18px', color:'#64748b' }}>No deployments yet — click "Trigger Deployment" to simulate one.</td>
                </tr>
              ) : (
                deployments.map(d=> (
                  <tr key={d.id} className={`status-${d.status}`}>
                    <td>{new Date(d.timestamp).toLocaleString()}</td>
                    <td>{d.branch}</td>
                    <td>
                      <span className={`pill ${d.status}`}>
                        {d.status}
                        {d.status === 'running' && <span className="spinner" aria-hidden></span>}
                      </span>
                    </td>
                    <td>{d.duration ? `${d.duration}s` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {toast && <React.Suspense fallback={null}><div><Toast message={toast} onClose={()=>setToast(null)} /></div></React.Suspense>}

    </div>
  )
}
