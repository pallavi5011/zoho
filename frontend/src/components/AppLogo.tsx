export function AppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" strokeWidth="2.2" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M16 3l6 3.5v7L16 17l-6-3.5v-7z" stroke="#43a047" />
      <path d="M9.5 15l6 3.5v7l-6 3.5-6-3.5v-7z" stroke="#e53935" />
      <path d="M22.5 15l6 3.5v7l-6 3.5-6-3.5v-7z" stroke="#fbc02d" />
      <circle cx="16" cy="10" r="2.2" fill="#1e88e5" />
    </svg>
  )
}
