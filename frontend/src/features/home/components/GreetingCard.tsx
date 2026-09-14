import { AppLogo } from '@/components/AppLogo'
import { Card } from '@/components/Card'
import { greeting } from '@/lib/date'

const RAY_ANGLES = [-165, -140, -115, -90, -65, -40, -15]

function SunArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-r from-transparent to-[#fdf1e6]">
      <svg viewBox="0 0 140 104" className="absolute bottom-0 right-4 h-full">
        <circle cx="80" cy="104" r="40" fill="#f5c9a6" />
        {RAY_ANGLES.map((deg) => {
          const rad = (deg * Math.PI) / 180
          return <circle key={deg} cx={80 + 54 * Math.cos(rad)} cy={104 + 54 * Math.sin(rad)} r="1.6" fill="#f0a36b" />
        })}
        <path d="M86 92a8 8 0 0 1 15-3 6 6 0 0 1 8 6H86z" fill="#fbe4d2" />
      </svg>
    </div>
  )
}

export function GreetingCard({ name }: { name: string }) {
  return (
    <Card className="relative flex items-center gap-5 overflow-hidden p-4">
      <div className="flex h-[62px] w-[98px] shrink-0 items-center justify-center gap-1 rounded border border-[#e6e6e6]">
        <AppLogo className="size-7" />
        <span className="leading-none">
          <span className="block text-[9px]">Zoho</span>
          <span className="text-[17px] font-bold">People</span>
        </span>
      </div>
      <div className="relative">
        <p className="text-[15px]">
          <strong className="font-bold">{greeting(new Date())}</strong>
          <span className="ml-2">{name}</span>
        </p>
        <p className="mt-1 text-muted">Have a productive day!</p>
      </div>
      <SunArt />
    </Card>
  )
}
