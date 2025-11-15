import GameCompletionScreen from "../../components/player/GameCompletionScreen";

export default function PlayerResults() {
  return (
    <div>
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xs font-bold text-primary">Cuộc Sống Của Bạn</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-xs font-medium text-gray-700">userName</p>
                <p className="text-xs text-neutral-light">Người chơi</p>
              </div>
              <button
                // onClick={onSignOut}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Đăng xuất"
              >
                <img src="/src/assets/icons/logout.png" alt="Logout" className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <GameCompletionScreen
        onComplete={() => { }}
      />
    </div>
  )
}