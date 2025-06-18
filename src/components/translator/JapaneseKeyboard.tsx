
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface JapaneseKeyboardProps {
  onInput: (text: string) => void;
}

const JapaneseKeyboard = ({ onInput }: JapaneseKeyboardProps) => {
  const hiraganaKeys = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['だ', 'ぢ', 'づ', 'で', 'ど'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
    ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', '', 'ゆ', '', 'よ'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', '', '', '', 'を'],
    ['ん', '、', '。', '！', '？']
  ];

  const katakanaKeys = [
    ['ア', 'イ', 'ウ', 'エ', 'オ'],
    ['カ', 'キ', 'ク', 'ケ', 'コ'],
    ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'],
    ['サ', 'シ', 'ス', 'セ', 'ソ'],
    ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'],
    ['タ', 'チ', 'ツ', 'テ', 'ト'],
    ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'],
    ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
    ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
    ['バ', 'ビ', 'ブ', 'ベ', 'ボ'],
    ['パ', 'ピ', 'プ', 'ペ', 'ポ'],
    ['マ', 'ミ', 'ム', 'メ', 'モ'],
    ['ヤ', '', 'ユ', '', 'ヨ'],
    ['ラ', 'リ', 'ル', 'レ', 'ロ'],
    ['ワ', '', '', '', 'ヲ'],
    ['ン', '、', '。', '！', '？']
  ];

  const commonPhrases = [
    'おはよう', 'こんにちは', 'こんばんは', 'ありがとう',
    'すみません', 'はじめまして', 'よろしく', 'さようなら',
    'はい', 'いいえ', 'わかりません', 'もう一度',
    'すこし', 'たくさん', 'とても', 'ちょっと'
  ];

  const renderKeyboard = (keys: string[][]) => (
    <div className="space-y-2">
      {keys.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-1">
          {row.map((key, keyIndex) => (
            <Button
              key={keyIndex}
              variant="outline"
              size="sm"
              onClick={() => key && onInput(key)}
              disabled={!key}
              className="w-8 h-8 p-0 text-sm"
            >
              {key}
            </Button>
          ))}
        </div>
      ))}
      <div className="flex justify-center space-x-2 mt-4">
        <Button variant="outline" onClick={() => onInput(' ')}>
          スペース
        </Button>
        <Button variant="outline" onClick={() => onInput('\n')}>
          改行
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="hiragana" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hiragana">ひらがな</TabsTrigger>
            <TabsTrigger value="katakana">カタカナ</TabsTrigger>
            <TabsTrigger value="phrases">フレーズ</TabsTrigger>
          </TabsList>
          
          <TabsContent value="hiragana" className="mt-4">
            {renderKeyboard(hiraganaKeys)}
          </TabsContent>
          
          <TabsContent value="katakana" className="mt-4">
            {renderKeyboard(katakanaKeys)}
          </TabsContent>
          
          <TabsContent value="phrases" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {commonPhrases.map((phrase, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onInput(phrase)}
                  className="text-xs"
                >
                  {phrase}
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JapaneseKeyboard;
