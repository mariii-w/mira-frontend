import { useState } from 'react'

interface AvatarIconProps {
  firstName?: string
  lastName?: string
  picture?: string
  size?: number
}

const BG_COLORS = [
  'bg-forest',
  'bg-sage',
  'bg-plum',
  'bg-lilac',
] as const

function nameToBgColor(name: string): (typeof BG_COLORS)[number] {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length]
}

export function AvatarIcon({
  firstName,
  lastName,
  picture,
  size = 40,
}: AvatarIconProps) {
  const [imgFailed, setImgFailed] = useState(false)

  if (picture && !imgFailed) {
    return (
      <img
        src={picture}
        style={{ width: size, height: size }}
        className="rounded-full object-cover block shrink-0"
        onError={() => setImgFailed(true)}
      />
    )
  }

  const first = firstName?.[0]?.toUpperCase() ?? ''
  const last = lastName?.[0]?.toUpperCase() ?? ''
  const initials = first + last || '?'
  const fullName = `${firstName ?? ''}${lastName ?? ''}`
  const bgColor = nameToBgColor(fullName)

  return (
    <div
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        lineHeight: 1,
      }}
      className={`${bgColor} text-cream rounded-full flex items-center justify-center font-semibold tracking-wide select-none shrink-0`}
    >
      {initials}
    </div>
  )
}