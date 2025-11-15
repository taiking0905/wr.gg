// src/pages/Home.tsx
import React from 'react';

export const About: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold border-b pb-2 mb-4">サイトの目的</h2>
      <p className="text-gray-700 leading-relaxed">
        Wild Rift の情報を整理・表示することを目的とした個人用の非商業サイトです。
        プレイヤーがゲームのパッチ内容や統計を確認しやすくすることを目指しています。
      </p>
      <p className="text-gray-700 leading-relaxed">
        勝率やピック率、バン率は Wild Rift 中国版のデータを参考にし、独自に整理・加工しています。
      </p>

      <h2 className="text-2xl font-bold border-b pb-2 mb-4">使用している素材について</h2>
      <p className="text-gray-700 leading-relaxed">
        画像やデータは主に 
        <a href="https://wildrift.leagueoflegends.com" className="text-blue-600 hover:underline">Wild Rift 公式サイト</a> 
        のものを使用しています。Riot Games の著作権に基づき、非商業利用として掲載しています。
      </p>
      <p className="text-gray-700 leading-relaxed">
        勝率データは 
        <a href="https://lolm.qq.com" className="text-blue-600 hover:underline">英雄联盟手游（Wild Rift 中国版）公式サイト</a> 
        の情報を参考にしています。
      </p>
      <p className="text-gray-700 leading-relaxed">
        GIF アニメーションは <a href="https://giphy.com/leagueoflegends" className="text-blue-600 hover:underline">League of Legends 公式 GIPHY アカウント</a> 
        より取得しています。
        </p>

      <h2 className="text-2xl font-bold border-b pb-2 mb-4">非商業利用について</h2>
      <p className="text-gray-700 leading-relaxed">
        本サイトは営利目的ではなく、個人・コミュニティ向けの情報提供を目的としています。
      </p>

      <h2 className="text-2xl font-bold border-b pb-2 mb-4">お問い合わせ先</h2>
      <p className="text-gray-700 leading-relaxed">
        サイトやデータに関するご意見・ご質問は Discord の DM で受け付けています。
      </p>
      <p className="text-gray-700 leading-relaxed">
        まだデモ版のため、小規模で運営しており、迅速な対応を心がけています。
      </p>
      <p className="text-gray-700 leading-relaxed font-semibold">
        作成者 (Discord ユーザー名): tomato0905
      </p>
    </div>
  );
};

