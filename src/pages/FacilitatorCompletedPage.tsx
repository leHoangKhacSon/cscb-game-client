import GameResultsScreen from "../components/facilitator/GameResultsScreen";
import { useGameRoomStore } from '../stores/gameRoomStore'

const FacilitatorCompletedPage = () => {
  const roomId = useGameRoomStore(state => state.roomId)

  return (
    <div>
      <GameResultsScreen
        roomId={roomId}
      />
    </div>
  )
}

export default FacilitatorCompletedPage