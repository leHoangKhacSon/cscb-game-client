# Facilitator Components

## GameResultsScreen

Màn hình hiển thị kết quả cuối game cho Quản trò, bao gồm phân tích chi tiết điểm số và xu hướng của tất cả người chơi.

### Tính năng chính

1. **Thống kê tổng quan**
   - Tổng số người chơi
   - Điểm trung bình chung
   - Điểm cao nhất
   - Độ đồng đều trung bình

2. **Bảng xếp hạng người chơi**
   - Sắp xếp theo: Tổng điểm, Điểm TB, Độ đồng đều
   - Hiển thị huy chương cho top 3
   - Xem chi tiết từng người chơi

3. **Phân tích chi tiết cho mỗi người chơi**
   - Điểm theo từng chỉ số (10 factors)
   - Chỉ số mạnh nhất/yếu nhất
   - Tốc độ tăng trưởng
   - Độ đồng đều phân bổ
   - Đánh giá tổng quan

4. **Xuất dữ liệu**
   - Xuất kết quả ra file CSV
   - Bao gồm tất cả các chỉ số và điểm số

### Các chỉ số được tính toán

#### 1. Tổng điểm (Total Score)
Tổng cộng tất cả điểm từ 10 chỉ số trong suốt trò chơi.

#### 2. Điểm trung bình (Average Score)
Điểm trung bình của 10 chỉ số.

#### 3. Độ đồng đều (Consistency)
Đo lường mức độ cân bằng trong phân bổ điểm giữa các chỉ số.
- Công thức: `100 - (độ lệch chuẩn / điểm TB) * 100`
- Giá trị cao = phân bổ đồng đều
- Giá trị thấp = tập trung vào một số chỉ số

#### 4. Tốc độ tăng trưởng (Growth Rate)
So sánh điểm phân bổ giữa vòng đầu và vòng cuối.
- Công thức: `((điểm cuối - điểm đầu) / điểm đầu) * 100`
- Giá trị dương = tăng trưởng
- Giá trị âm = giảm sút

#### 5. Đánh giá tổng quan
Dựa trên điểm TB và độ đồng đều:
- ⭐⭐⭐ Xuất sắc: >= 80 điểm
- ⭐⭐ Tốt: >= 60 điểm
- ⭐ Trung bình: >= 40 điểm
- 📊 Cần cải thiện: < 40 điểm

### Cách sử dụng

1. **Trong game**: Nhấn nút "📊 Xem kết quả" ở góc trên bên phải
2. **Sau khi hoàn thành**: Nút "Xem kết quả" sẽ xuất hiện thay cho nút "Tiếp tục"
3. **Sắp xếp**: Chọn tiêu chí sắp xếp (Tổng điểm, Điểm TB, Độ đồng đều)
4. **Xem chi tiết**: Click vào card của người chơi để mở rộng
5. **Xuất dữ liệu**: Nhấn nút "Xuất CSV" để tải file

### Props

```typescript
interface GameResultsScreenProps {
  roomId: string      // ID của phòng game
  onClose: () => void // Callback khi đóng màn hình
}
```

### Ví dụ sử dụng

```tsx
import GameResultsScreen from './facilitator/GameResultsScreen'

function GameBoard() {
  const [showResults, setShowResults] = useState(false)
  
  return (
    <>
      <button onClick={() => setShowResults(true)}>
        Xem kết quả
      </button>
      
      {showResults && (
        <GameResultsScreen
          roomId={gameState.dbRoomId}
          onClose={() => setShowResults(false)}
        />
      )}
    </>
  )
}
```

### Lưu ý kỹ thuật

- Component tự động load dữ liệu từ Supabase khi mount
- Hỗ trợ cả dữ liệu JSONB dạng object và string
- Tính toán real-time, không cache
- File CSV xuất ra có BOM để hỗ trợ tiếng Việt trong Excel
