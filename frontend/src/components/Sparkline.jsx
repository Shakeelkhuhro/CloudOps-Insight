import React from 'react'

function buildPath(values, w=80, h=24){
  if(!values || values.length===0) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = w / (values.length - 1)
  return values.map((v,i)=>{
    const x = (i*step).toFixed(2)
    const y = ((1 - (v - min)/range) * h).toFixed(2)
    return `${i===0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

export default function Sparkline({ data = [], color='#2563eb' }){
  const values = data.map(d => Number(d.cpu || d))
  const path = buildPath(values)
  return (
    <svg width="80" height="24" viewBox="0 0 80 24" className="sparkline">
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
