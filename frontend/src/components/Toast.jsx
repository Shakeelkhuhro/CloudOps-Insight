import React, { useEffect } from 'react'

export default function Toast({ message, duration = 3500, onClose }){
  useEffect(()=>{
    const t = setTimeout(()=> onClose && onClose(), duration)
    return ()=> clearTimeout(t)
  },[message,duration,onClose])

  return (
    <div className="toast">
      <div className="toast-message">{message}</div>
    </div>
  )
}
