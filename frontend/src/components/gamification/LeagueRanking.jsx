import React, { useState, useEffect } from 'react'
import { Trophy, Crown, Medal, Star, Users, TrendingUp, ChevronUp, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import { useGamification } from '@hooks/useGamification'
import { LEAGUES, LEAGUE_INFO } from '@api/gamification'
import { LoadingSpinner, DataLoader } from '@components/common/Loader'

/**
 * 리그 랭킹 컴포넌트
 */
const LeagueRanking = ({
  variant = 'default',
  showLeagueSelector = true,
  showUserRank = true,
  limit = 10,
  autoRefresh = true,
  className,
  ...props
}) => {
  const {
    leaderboard,
    userRank,
    currentLeague,
    totalXP,
    refreshLeaderboard,
    isLeaderboardLoading
  } = useGamification()
  
  const [selectedLeague, setSelectedLeague] = useState(currentLeague)
  const [isExpanded, setIsExpanded] = useState(false)
  
  // 자동 새로고침 (30초마다)
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      refreshLeaderboard(selectedLeague, limit)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [autoRefresh, selectedLeague, limit, refreshLeaderboard])
  
  // 리그 변경 시 리더보드 새로고침
  useEffect(() => {
    refreshLeaderboard(selectedLeague, limit)
  }, [selectedLeague, limit, refreshLeaderboard])
  
  // 리그 아이콘 및 색상 가져오기
  const getLeagueIcon = (league) => {
    const leagueInfo = LEAGUE_INFO[league] || LEAGUE_INFO.bronze
    return leagueInfo.icon
  }
  
  const getLeagueColor = (league) => {
    const leagueInfo = LEAGUE_INFO[league] || LEAGUE_INFO.bronze
    return leagueInfo.color
  }
  
  // 순위 아이콘 가져오기
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈' 
      case 3: return '🥉'
      default: return rank
    }
  }
  
  // 순위 색상 가져오기
  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 2: return 'text-gray-600 bg-gray-50 border-gray-200'
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-500 bg-gray-50 border-gray-100'
    }
  }
  
  if (isLeaderboardLoading && !leaderboard.length) {
    return <DataLoader text="리더보드를 불러오는 중..." rows={limit} />
  }
  
  return (
    <div className={clsx(
      'bg-white rounded-xl border border-gray-200 shadow-sm',
      className
    )} {...props}>
      {/* 헤더 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">리그 랭킹</h3>
              <p className="text-sm text-gray-500">
                {LEAGUE_INFO[selectedLeague]?.name || '브론즈 리그'} 순위
              </p>
            </div>
          </div>
          
          {showLeagueSelector && (
            <div className="flex items-center space-x-2">
              {Object.entries(LEAGUE_INFO).map(([leagueKey, leagueInfo]) => (
                <button
                  key={leagueKey}
                  onClick={() => setSelectedLeague(leagueKey)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    selectedLeague === leagueKey
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  )}
                  style={selectedLeague === leagueKey ? { 
                    backgroundColor: `${leagueInfo.color}20`,
                    borderColor: `${leagueInfo.color}40`,
                    color: leagueInfo.color 
                  } : {}}
                >
                  <span className="mr-1">{leagueInfo.icon}</span>
                  {leagueInfo.name.split(' ')[0]}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* 현재 사용자 순위 (상위에 표시) */}
        {showUserRank && userRank && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{userRank}</span>
                </div>
                <div>
                  <div className="font-medium text-blue-900">나의 순위</div>
                  <div className="text-sm text-blue-600">{totalXP.toLocaleString()} XP</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600">현재 리그</div>
                <div className="flex items-center space-x-1">
                  <span>{getLeagueIcon(currentLeague)}</span>
                  <span className="font-medium text-blue-900">
                    {LEAGUE_INFO[currentLeague]?.name || '브론즈 리그'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 리더보드 목록 */}
      <div className="p-6">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">아직 이 리그에 참가자가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-1">
              학습을 시작해서 첫 번째 참가자가 되어보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, isExpanded ? leaderboard.length : limit).map((player, index) => {
              const rank = index + 1
              const isCurrentUser = player.is_current_user
              
              return (
                <div
                  key={player.user_id || index}
                  className={clsx(
                    'flex items-center space-x-4 p-3 rounded-lg transition-all duration-200 hover:shadow-sm',
                    isCurrentUser 
                      ? 'bg-blue-50 border border-blue-200 ring-2 ring-blue-100'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  {/* 순위 */}
                  <div className={clsx(
                    'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border',
                    getRankColor(rank)
                  )}>
                    {typeof getRankIcon(rank) === 'string' ? (
                      <span className="text-lg">{getRankIcon(rank)}</span>
                    ) : (
                      getRankIcon(rank)
                    )}
                  </div>
                  
                  {/* 사용자 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className={clsx(
                        'font-medium truncate',
                        isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                      )}>
                        {player.name || `사용자${player.user_id?.slice(-4)}`}
                      </h4>
                      
                      {isCurrentUser && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          나
                        </span>
                      )}
                      
                      {rank <= 3 && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className={clsx(
                          'text-sm font-medium',
                          isCurrentUser ? 'text-blue-700' : 'text-gray-600'
                        )}>
                          {player.weekly_xp?.toLocaleString() || 0} XP
                        </span>
                      </div>
                      
                      {player.level && (
                        <span className={clsx(
                          'text-xs px-2 py-0.5 rounded-full',
                          isCurrentUser 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        )}>
                          Lv.{player.level}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 변화 화살표 */}
                  <div className="flex-shrink-0">
                    {player.rank_change > 0 && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <ChevronUp className="w-4 h-4" />
                        <span className="text-xs font-medium">+{player.rank_change}</span>
                      </div>
                    )}
                    {player.rank_change < 0 && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <ChevronDown className="w-4 h-4" />
                        <span className="text-xs font-medium">{player.rank_change}</span>
                      </div>
                    )}
                    {player.rank_change === 0 && (
                      <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            
            {/* 더보기/접기 버튼 */}
            {leaderboard.length > limit && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {isExpanded ? '접기' : `${leaderboard.length - limit}명 더보기`}
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* 푸터 */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>매주 일요일 자정에 순위가 초기화됩니다</span>
          </div>
          
          {autoRefresh && (
            <div className="flex items-center space-x-1">
              <LoadingSpinner size="xs" />
              <span>실시간 업데이트</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 미리 정의된 리그 랭킹 변형들
export const CompactLeagueRanking = (props) => (
  <LeagueRanking
    showLeagueSelector={false}
    showUserRank={false}
    limit={5}
    className="shadow-none border-0"
    {...props}
  />
)

export const FullLeagueRanking = (props) => (
  <LeagueRanking
    limit={20}
    autoRefresh={true}
    {...props}
  />
)

// 리그 정보 카드
export const LeagueInfoCard = ({ league, className }) => {
  const leagueInfo = LEAGUE_INFO[league] || LEAGUE_INFO.bronze
  
  return (
    <div className={clsx(
      'bg-white rounded-lg border border-gray-200 p-4',
      className
    )}>
      <div className="flex items-center space-x-3 mb-3">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: `${leagueInfo.color}20` }}
        >
          {leagueInfo.icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{leagueInfo.name}</h3>
          <p className="text-sm text-gray-500">{leagueInfo.minXP} XP 이상</p>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">리그 혜택</h4>
        <ul className="space-y-1">
          {leagueInfo.benefits.map((benefit, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></div>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// 리그 승급 진행률
export const LeagueProgress = ({ className }) => {
  const { totalXP, currentLeague } = useGamification()
  
  const currentLeagueInfo = LEAGUE_INFO[currentLeague]
  const leagueKeys = Object.keys(LEAGUE_INFO)
  const currentIndex = leagueKeys.indexOf(currentLeague)
  const nextLeague = leagueKeys[currentIndex + 1]
  const nextLeagueInfo = nextLeague ? LEAGUE_INFO[nextLeague] : null
  
  if (!nextLeagueInfo) {
    return (
      <div className={clsx(
        'bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg',
        className
      )}>
        <div className="text-center">
          <Crown className="w-8 h-8 mx-auto mb-2" />
          <h3 className="font-bold text-lg">최고 리그 달성!</h3>
          <p className="text-sm opacity-90">
            당신은 이미 최고 수준의 학습자입니다! 🏆
          </p>
        </div>
      </div>
    )
  }
  
  const xpToNext = nextLeagueInfo.minXP - totalXP
  const progress = ((totalXP - currentLeagueInfo.minXP) / (nextLeagueInfo.minXP - currentLeagueInfo.minXP)) * 100
  
  return (
    <div className={clsx(
      'bg-white border border-gray-200 rounded-lg p-4',
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900">리그 승급 진행률</h3>
        <Medal className="w-5 h-5 text-blue-500" />
      </div>
      
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-center">
          <div className="text-lg">{currentLeagueInfo.icon}</div>
          <div className="text-xs text-gray-500">{currentLeagueInfo.name}</div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span>{totalXP.toLocaleString()} XP</span>
            <span>{nextLeagueInfo.minXP.toLocaleString()} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: nextLeagueInfo.color 
              }}
            />
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-lg">{nextLeagueInfo.icon}</div>
          <div className="text-xs text-gray-500">{nextLeagueInfo.name}</div>
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">{xpToNext.toLocaleString()} XP</span> 더 얻으면 승급!
        </p>
      </div>
    </div>
  )
}

export default LeagueRanking