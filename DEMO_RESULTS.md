# Demo Màn Hình Kết Quả

## Truy cập Demo

Để xem demo màn hình kết quả với mock data, truy cập:

```
http://localhost:5173/demo
```

## Tính năng Demo

### 1. Màn Hình Quản Trò (Facilitator)
- Thống kê tổng quan (Final Destiny TB, Balance TB, Impact TB)
- Bảng xếp hạng với huy chương 🥇🥈🥉
- Phân loại người chơi (Huyền thoại, Giàu có thật sự, ...)
- Phân tích chi tiết từng người (Balance, Impact, Efficiency)
- Lifetime Wealth Scores cho 10 factors
- Xuất dữ liệu ra CSV
- Sắp xếp theo nhiều tiêu chí

### 2. Màn Hình Người Chơi Chi Tiết
- Xếp hạng cá nhân
- Loại người chơi với mô tả
- Final Destiny, Balance, Impact, Efficiency
- Lifetime Wealth Scores với biểu đồ
- Phân tích chi tiết và nhận xét

### 3. Màn Hình Hoàn Thành
- Hiển thị điểm số 10 factors
- Loại người chơi với icon
- Câu chuyện cuộc đời cá nhân hóa
- Top 3 điểm mạnh
- Các chỉ số chính

## Mock Data

Demo sử dụng 5 người chơi mẫu với các loại khác nhau:

### 1. Nguyễn Văn A - 👑 Huyền thoại (Legend)
- Final Destiny ≥ 85, Balance ≥ 80
- Phân bổ cân bằng hoàn hảo giữa tất cả các factors
- 18 rounds với allocations đều đặn

### 2. Trần Thị B - 💎 Giàu có thật sự (True Wealth)
- Impact ≥ 75, Efficiency ≥ 70
- Tập trung vào Culture, Community, Environment
- Tạo tác động tích cực cho cộng đồng

### 3. Lê Văn C - 💼 Thành công nhưng đơn độc
- Finance cao, Balance < 50
- Tập trung quá nhiều vào Career và Finance
- Thiếu cân bằng trong cuộc sống

### 4. Phạm Thị D - 🛡️ Người sống sót (Survivor)
- Dùng >80% reserve trước round 21 (40 tuổi)
- Phải sử dụng nguồn lực sớm để vượt qua khó khăn
- Chỉ còn 500/1000 reserve

### 5. Hoàng Văn E - ⚖️ Người cân bằng (Balanced)
- Phân bổ đều đặn cho tất cả factors
- Moderate scores across the board
- Phát triển ổn định

## Công Thức Tính Toán

### Balance Index
```
Balance Index = 100 - Standard Deviation (SD) của 10 Lifetime Wealth Scores
```

### Impact Index
```
Impact Index = (Culture + Community + Environment) / 3
```

### Efficiency Index
```
total_allocations = tổng điểm của 102 vòng người dùng đã fill
reserves_total = 1000 (or 0 nếu người dùng k kịp điền)
total_effective = total_baseline_score + event_score = 100 * 102 + event_score
Efficiency Index = 100 × total_effective / (total_allocations + reserves_total)
```

### Final Destiny
```
Final Destiny = 0.4 × Balance + 0.3 × Impact + 0.3 × Efficiency
```

## Điều Kiện Phân Loại

| Loại người chơi | Điều kiện |
|----------------|-----------|
| Huyền thoại (Legend) | Final Destiny ≥ 85 và Balance Index ≥ 80 |
| Giàu có thật sự (True Wealth) | Impact ≥ 75 và Efficiency ≥ 70 |
| Người thành công nhưng... đơn độc | Financial Wealth top 1 nhưng Balance < 50 |
| Người sống sót (Survivor) | Dùng >80% kho dự trữ trước 40 tuổi |
| Người cân bằng (Balanced) | Các trường hợp còn lại |

## Cấu Trúc Files

```
src/
├── lib/
│   ├── mockData.ts           # Mock data cho 5 người chơi
│   ├── mockSupabase.ts       # Mock Supabase client
│   └── scoreCalculator.ts    # Logic tính toán điểm
├── components/
│   ├── facilitator/
│   │   └── GameResultsScreen.tsx    # Màn hình quản trò
│   └── player/
│       ├── PlayerResultsScreen.tsx  # Màn hình chi tiết người chơi
│       └── GameCompletionScreen.tsx # Màn hình hoàn thành
└── pages/
    └── DemoResultsPage.tsx   # Trang demo chính
```

## Sử Dụng Mock Data Trong Code

### Bật Mock Mode
```typescript
import { enableMockMode } from './lib/mockSupabase'

enableMockMode()
```

### Sử Dụng Mock Data
```typescript
import { MOCK_GAME_DATA, MOCK_USERS } from './lib/mockData'

// Lấy allocations của player 1
const player1Allocations = MOCK_GAME_DATA.allocations[MOCK_USERS.player1.id]

// Lấy tất cả reserves
const reserves = MOCK_GAME_DATA.reserves

// Lấy events
const events = MOCK_GAME_DATA.events
```

### Tính Điểm
```typescript
import { calculatePlayerScore } from './lib/scoreCalculator'

const scoreData = calculatePlayerScore(
  allocations,
  reserve,
  events
)

console.log('Final Destiny:', scoreData.finalDestiny)
console.log('Player Type:', scoreData.playerType)
console.log('Balance Index:', scoreData.balanceIndex)
```

## Testing

1. Chạy dev server:
```bash
npm run dev
```

2. Truy cập demo:
```
http://localhost:5173/demo
```

3. Test các màn hình:
   - Click "Xem Demo" để xem màn hình Quản trò
   - Chọn người chơi và click "Xem Màn Hình Chi Tiết"
   - Click "Xem Màn Hình Hoàn Thành"

4. Test các tính năng:
   - Sắp xếp theo các tiêu chí khác nhau
   - Xem chi tiết từng người chơi
   - Xuất CSV
   - Xem phân loại người chơi

## Notes

- Mock data được tạo để đại diện cho 5 loại người chơi khác nhau
- Mỗi người chơi có 18 rounds (1 reserve + 17 rounds chơi)
- Events được random để tạo sự đa dạng
- Tất cả tính toán đều theo công thức chính thức
- Demo không cần authentication
