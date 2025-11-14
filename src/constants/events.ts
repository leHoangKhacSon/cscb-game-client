import type { IEvent, FactorKey } from '../types/index'

// 10 Factors in the game
export const FACTORS: Record<FactorKey, string> = {
  health: 'Sức khỏe',
  spiritual: 'Tâm linh',
  intelligence: 'Trí tuệ',
  ai: 'AI',
  emotion: 'Cảm xúc',
  career: 'Sự nghiệp',
  finance: 'Tài chính',
  culture: 'Văn hóa',
  community: 'Cộng đồng',
  environment: 'Môi trường'
}

// Event Wheel Categories and Events by Age
// Full event list with age ranges, weights, and rules
export const EVENTS: IEvent[] = [
  // Age 19-29 Events
  {
    id: 'Y20_BAD_FIRE',
    category: 'bad_event',
    name: 'fire',
    description: 'Sa thải đầu đời',
    minAge: 19,
    maxAge: 29,
    weight: 3,
    rules: 'Năm kế tiếp không được tăng Sự nghiệp > 25.',
    effects: [
      { factor: 'emotion', modifier: -5 },
      { factor: 'career', modifier: -10 }
    ]
  },
  {
    id: 'Y20_BAD_TOXICLOVE',
    category: 'bad_event',
    name: 'toxic_love',
    description: 'Tình yêu độc hại',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: 'Nếu emotion < 10 ở năm hiện tại, trừ thêm -5.',
    effects: [
      { factor: 'intelligence', modifier: -5 },
      { factor: 'emotion', modifier: -10 }
    ]
  },
  {
    id: 'Y20_BAD_DEBT',
    category: 'bad_event',
    name: 'debt',
    description: 'Nợ tiêu dùng',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: 'Trong 2 năm tới, Tài_chính tối đa +15/năm.',
    effects: [
      { factor: 'finance', modifier: -15 }
    ]
  },
  {
    id: 'Y20_BAD_BURNOUT',
    category: 'bad_event',
    name: 'burnout',
    description: 'Burnout sớm',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: 'Nếu career >= 20 năm hiện tại, bắt buộc -5 career thêm.',
    effects: [
      { factor: 'health', modifier: -10 },
      { factor: 'emotion', modifier: -5 }
    ]
  },
  {
    id: 'Y20_OP_MENTOR',
    category: 'opportunity',
    name: 'mentor',
    description: 'Mentor chỉ đường',
    minAge: 19,
    maxAge: 29,
    weight: 3,
    rules: 'Nếu community >= 10, thưởng thêm +5 Văn_hoa.',
    effects: [
      { factor: 'intelligence', modifier: 15 }
    ]
  },
  {
    id: 'Y20_OP_SIDEHUSTLE',
    category: 'opportunity',
    name: 'side_hustle',
    description: 'Khởi nghiệp nhỏ',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: 'Có thể chuyển +10 sang Tài_chính nếu ai >= 10.',
    effects: [
      { factor: 'career', modifier: 10 }
    ]
  },
  {
    id: 'Y20_OP_SCHOLAR',
    category: 'opportunity',
    name: 'scholarship',
    description: 'Học bổng',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: 'Năm sau có thể +5 community miễn phí.',
    effects: [
      { factor: 'intelligence', modifier: 10 },
      { factor: 'culture', modifier: 10 }
    ]
  },
  {
    id: 'Y20_GR_DISCIPLINE',
    category: 'self_development',
    name: 'discipline',
    description: 'Kỷ luật đầu đời',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'health', modifier: 10 }
    ]
  },
  {
    id: 'Y20_GR_MINDFUL',
    category: 'self_development',
    name: 'mindful',
    description: 'Detox cảm xúc',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'emotion', modifier: 10 }
    ]
  },
  {
    id: 'Y20_GR_LEARNAI',
    category: 'self_development',
    name: 'learn_ai',
    description: 'Học AI nền tảng',
    minAge: 19,
    maxAge: 29,
    weight: 2,
    rules: 'Nếu intelligence >= 15, cộng thêm +5 ai.',
    effects: [
      { factor: 'ai', modifier: 10 }
    ]
  },

  // Age 30-39 Events
  {
    id: 'Y30_BAD_FAMILY',
    category: 'bad_event',
    name: 'family_crisis',
    description: 'Khủng hoảng gia đình',
    minAge: 30,
    maxAge: 39,
    weight: 3,
    rules: 'Nếu spiritual < 10, trừ thêm -5 Cảm_xúc.',
    effects: [
      { factor: 'emotion', modifier: -15 }
    ]
  },
  {
    id: 'Y30_BAD_FOMO',
    category: 'bad_event',
    name: 'fomo_invest',
    description: 'Đầu tư FOMO',
    minAge: 30,
    maxAge: 39,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'finance', modifier: -20 }
    ]
  },
  {
    id: 'Y30_BAD_HEALTH',
    category: 'bad_event',
    name: 'health_alert',
    description: 'Sức khỏe báo động',
    minAge: 30,
    maxAge: 39,
    weight: 2,
    rules: 'Năm sau bắt buộc health >= 15.',
    effects: [
      { factor: 'health', modifier: -15 }
    ]
  },
  {
    id: 'Y30_OP_PROMO',
    category: 'opportunity',
    name: 'promotion',
    description: 'Thăng chức lớn',
    minAge: 30,
    maxAge: 39,
    weight: 3,
    rules: 'Nếu emotion < 10, hiệu quả -5.',
    effects: [
      { factor: 'career', modifier: 20 }
    ]
  },
  {
    id: 'Y30_OP_NETWORK',
    category: 'opportunity',
    name: 'network',
    description: 'Mở rộng network',
    minAge: 30,
    maxAge: 39,
    weight: 2,
    rules: 'Nếu culture >= 10, thưởng thêm +5 community.',
    effects: [
      { factor: 'community', modifier: 15 }
    ]
  },
  {
    id: 'Y30_OP_PASSIVE',
    category: 'opportunity',
    name: 'passive_income',
    description: 'Thu nhập thụ động',
    minAge: 30,
    maxAge: 39,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'finance', modifier: 20 }
    ]
  },
  {
    id: 'Y30_GR_THERAPY',
    category: 'self_development',
    name: 'therapy',
    description: 'Coaching/Therapy',
    minAge: 30,
    maxAge: 39,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'intelligence', modifier: 5 },
      { factor: 'emotion', modifier: 15 }
    ]
  },
  {
    id: 'Y30_GR_BIOMARKER',
    category: 'self_development',
    name: 'health_optimize',
    description: 'Tối ưu sức khỏe',
    minAge: 30,
    maxAge: 39,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'health', modifier: 20 }
    ]
  },
  {
    id: 'Y30_GR_SYSTEMS',
    category: 'self_development',
    name: 'systems',
    description: 'Hệ thống hóa công việc',
    minAge: 30,
    maxAge: 39,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'ai', modifier: 10 },
      { factor: 'career', modifier: 5 }
    ]
  },

  // Age 40-59 Events
  {
    id: 'Y40_BAD_MIDLIFE',
    category: 'bad_event',
    name: 'midlife_crisis',
    description: 'Midlife crisis',
    minAge: 40,
    maxAge: 59,
    weight: 3,
    rules: 'Nếu spiritual < 15, trừ thêm -5 emotion.',
    effects: [
      { factor: 'emotion', modifier: -20 }
    ]
  },
  {
    id: 'Y40_BAD_HEALTH_CRASH',
    category: 'bad_event',
    name: 'health_crash',
    description: 'Sức khỏe gục',
    minAge: 40,
    maxAge: 59,
    weight: 3,
    rules: 'Năm sau bắt buộc health >= 20.',
    effects: [
      { factor: 'health', modifier: -30 }
    ]
  },
  {
    id: 'Y40_BAD_DIVORCE',
    category: 'bad_event',
    name: 'divorce',
    description: 'Đổ vỡ hôn nhân',
    minAge: 40,
    maxAge: 59,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'emotion', modifier: -20 },
      { factor: 'finance', modifier: -15 }
    ]
  },
  {
    id: 'Y40_OP_AI_BOOST',
    category: 'opportunity',
    name: 'ai_boost',
    description: 'Bước nhảy AI',
    minAge: 40,
    maxAge: 59,
    weight: 3,
    rules: '',
    effects: [
      { factor: 'ai', modifier: 20 },
      { factor: 'finance', modifier: 10 }
    ]
  },
  {
    id: 'Y40_OP_EXIT',
    category: 'opportunity',
    name: 'exit',
    description: 'Exit công ty',
    minAge: 40,
    maxAge: 59,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'finance', modifier: 30 }
    ]
  },
  {
    id: 'Y40_OP_LEGACY',
    category: 'opportunity',
    name: 'legacy',
    description: 'Legacy chia sẻ',
    minAge: 40,
    maxAge: 59,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'culture', modifier: 15 },
      { factor: 'community', modifier: 15 }
    ]
  },
  {
    id: 'Y40_GR_HEALTH_TX',
    category: 'self_development',
    name: 'health_transform',
    description: 'Health Transformation',
    minAge: 40,
    maxAge: 59,
    weight: 3,
    rules: '',
    effects: [
      { factor: 'health', modifier: 30 }
    ]
  },
  {
    id: 'Y40_GR_RECONNECT',
    category: 'self_development',
    name: 'reconnect',
    description: 'Quay về với gia đình',
    minAge: 40,
    maxAge: 59,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'emotion', modifier: 20 }
    ]
  },
  {
    id: 'Y40_GR_REFOCUS',
    category: 'self_development',
    name: 'refocus',
    description: 'Tái định nghĩa thành công',
    minAge: 40,
    maxAge: 59,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'spiritual', modifier: 15 },
      { factor: 'intelligence', modifier: 10 }
    ]
  },

  // Age 60-120 Events
  {
    id: 'Y60_BAD_LONELY',
    category: 'bad_event',
    name: 'lonely',
    description: 'Cô đơn tuổi già',
    minAge: 60,
    maxAge: 120,
    weight: 3,
    rules: 'Nếu community < 10, trừ thêm -5 emotion.',
    effects: [
      { factor: 'emotion', modifier: -20 }
    ]
  },
  {
    id: 'Y60_BAD_MEDICAL',
    category: 'bad_event',
    name: 'medical_cost',
    description: 'Chi phí y tế',
    minAge: 60,
    maxAge: 120,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'finance', modifier: -25 }
    ]
  },
  {
    id: 'Y60_BAD_LIMIT',
    category: 'bad_event',
    name: 'physical_limit',
    description: 'Giới hạn thể chất',
    minAge: 60,
    maxAge: 120,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'career', modifier: -30 }
    ]
  },
  {
    id: 'Y60_OP_MENTORING',
    category: 'opportunity',
    name: 'mentoring',
    description: 'Truyền cảm hứng thế hệ sau',
    minAge: 60,
    maxAge: 120,
    weight: 3,
    rules: '',
    effects: [
      { factor: 'community', modifier: 20 }
    ]
  },
  {
    id: 'Y60_OP_HERITAGE',
    category: 'opportunity',
    name: 'heritage',
    description: 'Di sản văn hóa',
    minAge: 60,
    maxAge: 120,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'culture', modifier: 25 }
    ]
  },
  {
    id: 'Y60_OP_EARTH',
    category: 'opportunity',
    name: 'environment',
    description: 'Cống hiến môi trường',
    minAge: 60,
    maxAge: 120,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'environment', modifier: 20 }
    ]
  },
  {
    id: 'Y60_GR_SERENITY',
    category: 'self_development',
    name: 'serenity',
    description: 'Bình an nội tâm',
    minAge: 60,
    maxAge: 120,
    weight: 3,
    rules: '',
    effects: [
      { factor: 'spiritual', modifier: 30 }
    ]
  },
  {
    id: 'Y60_GR_WISDOM',
    category: 'self_development',
    name: 'wisdom',
    description: 'Trí tuệ minh triết',
    minAge: 60,
    maxAge: 120,
    weight: 2,
    rules: '',
    effects: [
      { factor: 'intelligence', modifier: 20 }
    ]
  },
  {
    id: 'Y60_GR_GENTLEHEALTH',
    category: 'self_development',
    name: 'gentle_health',
    description: 'Sống chậm, khỏe bền',
    minAge: 60,
    maxAge: 120,
    weight: 3,
    rules: '',
    effects: [
      { factor: 'health', modifier: 20 }
    ]
  }
]
