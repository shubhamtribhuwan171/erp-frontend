interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2 text-gray-300">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin`} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  )
}
