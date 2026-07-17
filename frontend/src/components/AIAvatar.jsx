import React from 'react';
import femaleFace from '../assets/female_face_v2.png';
import maleFace from '../assets/male_face_v2.png';

export default function AIAvatar({
  size = 'w-10 h-10',
  status = 'online',
  emoji = '🤖',
  ringColor = 'border-border/80'
}) {
  const gender = localStorage.getItem('closer-ai-gender') || 'female';
  const avatarImg = gender === 'female' ? femaleFace : maleFace;

  return (
    <div className={`relative ${size} flex-shrink-0`}>
      {/* Background glow when online */}
      {status === 'online' && (
        <div className="absolute inset-0 rounded-full border border-accent/30 animate-ping opacity-75" />
      )}
      
      {/* Avatar Box */}
      <div className={`w-full h-full rounded-full border bg-panel flex items-center justify-center text-text z-10 relative overflow-hidden transition-all duration-300 ${ringColor}`}>
        {emoji === '🤖' ? (
          <img 
            src={avatarImg} 
            alt="AI Avatar" 
            className="w-full h-full object-cover animate-swing drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" 
          />
        ) : (
          <span className="select-none text-xl">{emoji}</span>
        )}
      </div>

      {/* Online indicator dot */}
      {status && (
        <div className={`w-3 h-3 rounded-full border-2 border-surface absolute bottom-0 right-0 z-20 ${
          status === 'online' ? 'bg-emerald' : 'bg-muted'
        }`} />
      )}
    </div>
  );
}