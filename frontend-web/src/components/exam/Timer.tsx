import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  durationMinutes: number;
  startTime: string;
  onTimeEnd: () => void;
}

export const Timer: React.FC<Props> = ({ durationMinutes, startTime, onTimeEnd }) => {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const endTime = new Date(startTime).getTime() + durationMinutes * 60 * 1000;
    const update = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) onTimeEnd();
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [durationMinutes, startTime, onTimeEnd]);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  const isWarning = secondsLeft < 300; // last 5 minutes
  const isCritical = secondsLeft < 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-sm font-bold transition-colors ${
      isCritical ? 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse' :
      isWarning ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400' :
      'bg-slate-800 border-slate-700 text-white'
    }`}>
      <Clock className="w-4 h-4" />
      {hours > 0 && <span>{String(hours).padStart(2, '0')}:</span>}
      <span>{String(minutes).padStart(2, '0')}:</span>
      <span>{String(seconds).padStart(2, '0')}</span>
    </div>
  );
};
