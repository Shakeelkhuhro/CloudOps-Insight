import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function RealtimeChart({ data }){
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <XAxis dataKey="timestamp" tickFormatter={t=>new Date(t).toLocaleTimeString()} />
        <YAxis />
        <Tooltip labelFormatter={t=>new Date(t).toLocaleString()} />
        <Line type="monotone" dataKey="cpu" stroke="#ef4444" dot={false} />
        <Line type="monotone" dataKey="memory" stroke="#22c55e" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
