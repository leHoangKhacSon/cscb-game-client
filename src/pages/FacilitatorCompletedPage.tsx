import GameResultsScreen from "../components/facilitator/GameResultsScreen";
import { MOCK_GAME_DATA } from '../lib/mockData'

export default function FacilitatorCompletedPage() {
  return (
    <div>
      <GameResultsScreen
        roomId={MOCK_GAME_DATA.roomId}
        onClose={() => { }}
      />
    </div>
  )
}