import { useState } from 'react'

interface SetDisplayNameScreenProps {
  email: string
  onSubmit: (displayName: string) => Promise<void>
  onSignOut: () => void
}

export default function SetDisplayNameScreen({ email, onSubmit, onSignOut }: SetDisplayNameScreenProps) {
  const [displayName, setDisplayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!displayName.trim()) {
      setError('Vui lòng nhập tên của bạn')
      return
    }

    if (displayName.trim().length < 2) {
      setError('Tên phải có ít nhất 2 ký tự')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(displayName.trim())
    } catch (err) {
      console.error('[SetDisplayNameScreen] Error:', err)
      setError(err instanceof Error ? err.message : 'Không thể cập nhật tên')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-primary">Cuộc Sống Của Bạn</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{email}</p>
                <p className="text-xs text-neutral-light">Người chơi</p>
              </div>
              <button
                onClick={onSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <img src="/src/assets/icons/logout.png" alt="Logout" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Chào mừng, {email}!
            </h2>
            <p className="text-neutral-light">
              Nhập tên để tham gia trò chơi nhé.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-center text-gray-700 font-medium mb-4">
                Tên của bạn
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full px-6 py-4 text-center text-lg border-2 border-gray-300 rounded-full focus:outline-none focus:border-primary transition-colors"
                disabled={isSubmitting}
                autoFocus
                maxLength={50}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting || !displayName.trim()}
                className="px-12 py-4 bg-success hover:bg-success/90 text-white font-bold text-lg rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  'Gửi'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
