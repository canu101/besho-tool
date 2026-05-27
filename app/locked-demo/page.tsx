import ToolContainer from '@/components/tool-container'
import LockedOverlay from '@/components/locked-overlay'

export default function LockedDemo() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="relative">
        <ToolContainer />
        <LockedOverlay 
          reason="ip_not_allowed" 
          clientIp="192.168.1.100"
          expiresAt={undefined}
        />
      </div>
    </main>
  )
}
