import { useEffect } from 'react'

export default function Toast({ msg, onDone }) {
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(onDone, 2600)
      return () => clearTimeout(timer)
    }
  }, [msg, onDone])

  if (!msg) return null

  return (
    <div style={{
      position: 'fixed',
      top: 76,
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a',
      color: '#fff',
      padding: '8px 18px',
      borderRadius: 20,
      fontSize: 13,
      zIndex: 99,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      animation: 'slideDown 0.3s ease-in-out'
    }}>
      {msg}
      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-10px) } to { opacity: 1; transform: translateX(-50%) translateY(0) } }`}</style>
    </div>
  )
}
