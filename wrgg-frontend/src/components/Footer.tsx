import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-gray-400 p-4 mt-4 text-xs md:text-sm">
      <div className="max-w-6xl mx-auto space-y-1">
        <p>画像やデータは <a href="https://wildrift.leagueoflegends.com" className="underline">Wild Rift 公式サイト</a> より取得</p>
        <p>勝率データは <a href="https://lolm.qq.com/act/a20220818raider/index.html" className="underline">Wild Rift 中国版 公式サイト</a> を参考に独自加工</p>
        <p>GIF アニメーションは <a href="https://giphy.com/leagueoflegends" className="underline">公式 GIPHY アカウント</a> より取得</p>
        <p>お問い合わせ: Discord DM (tomato0905)</p>
      </div>
    </footer>
  )
}