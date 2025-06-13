// src/components/journey/HangulDisplay.jsx
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  Info,
  Lightbulb,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import Button from '../common/Buttom.jsx';
import Modal from '../common/Modal.jsx';
import { T } from '../common/TranslatableText';

const HangulDisplay = ({ 
  text = '', 
  level = 'level1',
  showBreakdown = false,
  onCharacterClick = null,
  className = '' 
}) => {
  // 상태 관리
  const [showJamo, setShowJamo] = useState(showBreakdown);
  const [showGuide, setShowGuide] = useState(false);
  const [selectedChar, setSelectedChar] = useState(null);
  const [playingChar, setPlayingChar] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 한글 자모 매핑
  const CHOSEONG = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const JUNGSEONG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
  const JONGSEONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

  // 레벨별 설정
  const levelConfigs = {
    level1: {
      showJamoByDefault: true,
      showPronunciationGuide: true,
      highlightJamo: true,
      speed: 'slow'
    },
    level2: {
      showJamoByDefault: false,
      showPronunciationGuide: true,
      highlightJamo: false,
      speed: 'normal'
    },
    level3: {
      showJamoByDefault: false,
      showPronunciationGuide: false,
      highlightJamo: false,
      speed: 'normal'
    },
    level4: {
      showJamoByDefault: false,
      showPronunciationGuide: false,
      highlightJamo: false,
      speed: 'fast'
    }
  };

  const config = levelConfigs[level] || levelConfigs.level1;

  // 한글 분해 함수
  const decomposeHangul = (char) => {
    if (!isHangul(char)) {
      return { char, choseong: '', jungseong: '', jongseong: '' };
    }

    const code = char.charCodeAt(0) - 0xAC00;
    const choseongIndex = Math.floor(code / (21 * 28));
    const jungseongIndex = Math.floor((code % (21 * 28)) / 28);
    const jongseongIndex = code % 28;

    return {
      char,
      choseong: CHOSEONG[choseongIndex],
      jungseong: JUNGSEONG[jungseongIndex],
      jongseong: JONGSEONG[jongseongIndex]
    };
  };

  // 한글 여부 확인
  const isHangul = (char) => {
    const code = char.charCodeAt(0);
    return code >= 0xAC00 && code <= 0xD7A3;
  };

  // 자모 설명 가져오기
  const getJamoDescription = (jamo, type) => {
    const descriptions = {
      // 초성 설명
      choseong: {
        'ㄱ': { name: '기역', sound: '[g/k]', tip: '혀뿌리를 들어 연구개에 댔다가 떼며 내는 소리' },
        'ㄲ': { name: '쌍기역', sound: '[kk]', tip: 'ㄱ보다 강하게 발음하는 된소리' },
        'ㄴ': { name: '니은', sound: '[n]', tip: '혀끝을 윗잇몸에 대고 코로 내는 소리' },
        'ㄷ': { name: '디귿', sound: '[d/t]', tip: '혀끝을 윗잇몸에 댔다가 떼며 내는 소리' },
        'ㄸ': { name: '쌍디귿', sound: '[tt]', tip: 'ㄷ보다 강하게 발음하는 된소리' },
        'ㄹ': { name: '리을', sound: '[r/l]', tip: '혀끝을 윗잇몸에 가볍게 튕기며 내는 소리' },
        'ㅁ': { name: '미음', sound: '[m]', tip: '입을 다물고 코로 내는 소리' },
        'ㅂ': { name: '비읍', sound: '[b/p]', tip: '입술을 다물었다가 터뜨리며 내는 소리' },
        'ㅃ': { name: '쌍비읍', sound: '[pp]', tip: 'ㅂ보다 강하게 발음하는 된소리' },
        'ㅅ': { name: '시옷', sound: '[s]', tip: '혀끝을 아래잇몸에 대고 공기를 내보내는 소리' },
        'ㅆ': { name: '쌍시옷', sound: '[ss]', tip: 'ㅅ보다 강하게 발음하는 된소리' },
        'ㅇ': { name: '이응', sound: '[무음]', tip: '초성에서는 소리가 없음' },
        'ㅈ': { name: '지읒', sound: '[j]', tip: '혀끝을 윗잇몸에 대고 마찰을 내는 소리' },
        'ㅉ': { name: '쌍지읒', sound: '[jj]', tip: 'ㅈ보다 강하게 발음하는 된소리' },
        'ㅊ': { name: '치읓', sound: '[ch]', tip: 'ㅈ에 거센숨을 더한 소리' },
        'ㅋ': { name: '키읔', sound: '[k]', tip: 'ㄱ에 거센숨을 더한 소리' },
        'ㅌ': { name: '티읕', sound: '[t]', tip: 'ㄷ에 거센숨을 더한 소리' },
        'ㅍ': { name: '피읖', sound: '[p]', tip: 'ㅂ에 거센숨을 더한 소리' },
        'ㅎ': { name: '히읗', sound: '[h]', tip: '성문에서 거센숨을 내는 소리' }
      },
      // 중성 설명
      jungseong: {
        'ㅏ': { name: '아', sound: '[a]', tip: '입을 크게 벌리고 혀를 아래로' },
        'ㅐ': { name: '애', sound: '[ae]', tip: 'ㅏ보다 혀를 약간 앞으로' },
        'ㅑ': { name: '야', sound: '[ya]', tip: 'ㅏ 앞에 ㅣ가 합쳐진 소리' },
        'ㅒ': { name: '얘', sound: '[yae]', tip: 'ㅐ 앞에 ㅣ가 합쳐진 소리' },
        'ㅓ': { name: '어', sound: '[eo]', tip: '입을 반쯤 벌리고 혀를 뒤로' },
        'ㅔ': { name: '에', sound: '[e]', tip: 'ㅓ보다 혀를 약간 앞으로' },
        'ㅕ': { name: '여', sound: '[yeo]', tip: 'ㅓ 앞에 ㅣ가 합쳐진 소리' },
        'ㅖ': { name: '예', sound: '[ye]', tip: 'ㅔ 앞에 ㅣ가 합쳐진 소리' },
        'ㅗ': { name: '오', sound: '[o]', tip: '입술을 둥글게 오므리고' },
        'ㅘ': { name: '와', sound: '[wa]', tip: 'ㅗ + ㅏ의 결합' },
        'ㅙ': { name: '왜', sound: '[wae]', tip: 'ㅗ + ㅐ의 결합' },
        'ㅚ': { name: '외', sound: '[oe]', tip: 'ㅗ + ㅣ의 결합' },
        'ㅛ': { name: '요', sound: '[yo]', tip: 'ㅗ 앞에 ㅣ가 합쳐진 소리' },
        'ㅜ': { name: '우', sound: '[u]', tip: '입술을 동그랗게 오므리고' },
        'ㅝ': { name: '워', sound: '[wo]', tip: 'ㅜ + ㅓ의 결합' },
        'ㅞ': { name: '웨', sound: '[we]', tip: 'ㅜ + ㅔ의 결합' },
        'ㅟ': { name: '위', sound: '[wi]', tip: 'ㅜ + ㅣ의 결합' },
        'ㅠ': { name: '유', sound: '[yu]', tip: 'ㅜ 앞에 ㅣ가 합쳐진 소리' },
        'ㅡ': { name: '으', sound: '[eu]', tip: '혀를 평평하게 하고 중앙에' },
        'ㅢ': { name: '의', sound: '[ui]', tip: 'ㅡ + ㅣ의 결합' },
        'ㅣ': { name: '이', sound: '[i]', tip: '혀를 앞으로 내밀고 높게' }
      },
      // 종성 설명
      jongseong: {
        'ㄱ': { name: '기역', sound: '[k]', tip: '혀뿌리를 연구개에 붙여 막음' },
        'ㄴ': { name: '니은', sound: '[n]', tip: '혀끝을 윗잇몸에 붙여 막음' },
        'ㄷ': { name: '디귿', sound: '[t]', tip: '혀끝을 윗잇몸에 붙여 막음' },
        'ㄹ': { name: '리을', sound: '[l]', tip: '혀끝을 윗잇몸에 가볍게 댐' },
        'ㅁ': { name: '미음', sound: '[m]', tip: '입술을 다물어 막음' },
        'ㅂ': { name: '비읍', sound: '[p]', tip: '입술을 다물어 막음' },
        'ㅇ': { name: '이응', sound: '[ng]', tip: '혀뿌리를 내려 코로 냄' }
      }
    };

    return descriptions[type]?.[jamo] || { name: jamo, sound: '', tip: '' };
  };

  // 문자 클릭 처리
  const handleCharClick = (char, index) => {
    if (!isHangul(char)) return;
    
    setSelectedChar({ char, index });
    setShowDetailModal(true);
    
    if (onCharacterClick) {
      onCharacterClick(char, index);
    }
    
    // TTS로 해당 문자 발음
    playCharacterSound(char);
  };

  // 문자 발음 재생
  const playCharacterSound = (char) => {
    if ('speechSynthesis' in window) {
      setPlayingChar(char);
      
      const utterance = new SpeechSynthesisUtterance(char);
      utterance.lang = 'ko-KR';
      utterance.rate = config.speed === 'slow' ? 0.7 : config.speed === 'fast' ? 1.3 : 1.0;
      
      utterance.onend = () => setPlayingChar(null);
      
      speechSynthesis.speak(utterance);
    }
  };

  // 전체 텍스트 발음
  const playFullText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = config.speed === 'slow' ? 0.5 : config.speed === 'fast' ? 1.2 : 0.8;
      
      speechSynthesis.speak(utterance);
    }
  };

  // 텍스트를 문자 단위로 분해
  const characters = Array.from(text);

  useEffect(() => {
    setShowJamo(config.showJamoByDefault);
  }, [level, config.showJamoByDefault]);

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* 컨트롤 버튼 */}
      <div className="flex items-center justify-center space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowJamo(!showJamo)}
          className="flex items-center space-x-2"
        >
          {showJamo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <T>{showJamo ? '자모 숨기기' : '자모 보기'}</T>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={playFullText}
          className="flex items-center space-x-2"
        >
          <Volume2 className="w-4 h-4" />
          <T>전체 발음</T>
        </Button>
        
        {config.showPronunciationGuide && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center space-x-2"
          >
            <Lightbulb className="w-4 h-4" />
            <T>발음 가이드</T>
          </Button>
        )}
      </div>

      {/* 메인 텍스트 표시 */}
      <div className="text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 p-4 bg-gray-50 rounded-xl">
          {characters.map((char, index) => {
            const decomposed = decomposeHangul(char);
            const isSelected = selectedChar?.index === index;
            const isPlaying = playingChar === char;
            
            return (
              <div
                key={index}
                className={`relative group cursor-pointer transition-all duration-200 ${
                  isHangul(char) 
                    ? `hover:bg-blue-100 rounded-lg p-2 ${
                        isSelected ? 'bg-blue-200 ring-2 ring-blue-400' : 
                        isPlaying ? 'bg-green-200 ring-2 ring-green-400' : ''
                      }`
                    : 'p-2'
                }`}
                onClick={() => handleCharClick(char, index)}
              >
                
                {/* 원본 문자 */}
                <div className={`text-2xl font-medium ${
                  isHangul(char) ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {char}
                </div>
                
                {/* 자모 분해 표시 */}
                {showJamo && isHangul(char) && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs">
                    <div className="bg-white border border-gray-200 rounded px-2 py-1 shadow-sm whitespace-nowrap">
                      <span className="text-red-600 font-medium">{decomposed.choseong}</span>
                      <span className="text-blue-600 font-medium">{decomposed.jungseong}</span>
                      {decomposed.jongseong && (
                        <span className="text-green-600 font-medium">{decomposed.jongseong}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 호버 툴팁 */}
                {isHangul(char) && level === 'level1' && (
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                    <T>클릭하여 발음 듣기</T>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 발음 가이드 */}
      {showGuide && config.showPronunciationGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-900">
              <T>발음 가이드</T>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuide(false)}
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-red-800 mb-2">
                <T>초성 (첫소리)</T>
              </h4>
              <div className="space-y-1 text-red-700">
                <div>• <T>단어의 맨 앞에 오는 자음</T></div>
                <div>• <T>혀의 위치와 입모양이 중요</T></div>
                <div>• <T>된소리(ㄲ,ㄸ,ㅃ,ㅆ,ㅉ)는 더 강하게</T></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-2">
                <T>중성 (가운뎃소리)</T>
              </h4>
              <div className="space-y-1 text-blue-700">
                <div>• <T>단어의 가운데 오는 모음</T></div>
                <div>• <T>입의 열림과 혀의 높낮이 조절</T></div>
                <div>• <T>복합모음은 두 소리를 빠르게</T></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-green-800 mb-2">
                <T>종성 (끝소리)</T>
              </h4>
              <div className="space-y-1 text-green-700">
                <div>• <T>단어의 맨 끝에 오는 자음</T></div>
                <div>• <T>실제 발음은 7가지만 남음</T></div>
                <div>• ㄱ,ㄴ,ㄷ,ㄹ,ㅁ,ㅂ,ㅇ</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg">
            <div className="text-sm text-gray-700">
              <strong>💡 <T>팁</T>:</strong> <T>문자를 클릭하면 정확한 발음을 들을 수 있어요</T>. 
              {level === 'level1' && <T> 자모를 하나씩 따라해보세요!</T>}
            </div>
          </div>
        </div>
      )}

      {/* 레벨별 학습 팁 */}
      {level === 'level1' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-800">
            <Info className="w-4 h-4" />
            <span className="font-medium">Level 1 <T>학습 팁</T></span>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <T>각 글자를 클릭해서 자음과 모음을 따로 연습해보세요</T>. 
            <T>빨간색(초성), 파란색(중성), 초록색(종성)으로 구분됩니다</T>.
          </div>
        </div>
      )}

      {/* 선택된 문자 상세 정보 모달 */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        titleKey="한글 자세히 보기"
        size="lg"
      >
        {selectedChar && isHangul(selectedChar.char) && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900 mb-4">
                {selectedChar.char}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => playCharacterSound(selectedChar.char)}
                className="flex items-center space-x-2 mx-auto"
              >
                <Volume2 className="w-4 h-4" />
                <T>발음 듣기</T>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {(() => {
                const decomposed = decomposeHangul(selectedChar.char);
                const parts = [
                  { jamo: decomposed.choseong, type: 'choseong', label: '초성', color: 'red' },
                  { jamo: decomposed.jungseong, type: 'jungseong', label: '중성', color: 'blue' }
                ];
                
                if (decomposed.jongseong) {
                  parts.push({ jamo: decomposed.jongseong, type: 'jongseong', label: '종성', color: 'green' });
                }
                
                return parts.map((part, index) => {
                  const desc = getJamoDescription(part.jamo, part.type);
                  
                  return (
                    <div key={index} className={`text-center p-4 bg-${part.color}-50 rounded-lg`}>
                      <div className={`text-3xl font-bold text-${part.color}-600 mb-2`}>
                        {part.jamo}
                      </div>
                      <div className={`text-sm font-medium text-${part.color}-800 mb-1`}>
                        <T>{part.label}</T>: {desc.name}
                      </div>
                      <div className={`text-xs text-${part.color}-600 mb-2`}>
                        {desc.sound}
                      </div>
                      {desc.tip && (
                        <div className={`text-xs text-${part.color}-700`}>
                          <T>{desc.tip}</T>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HangulDisplay;