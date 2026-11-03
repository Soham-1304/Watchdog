import { useState } from 'react';
import { motion } from 'framer-motion';

export interface SquishSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  trackColor?: string;
  trackOnColor?: string;
  width?: number;
  height?: number;
  radius?: number;
  speed?: number;
  stretch?: number;
  hoverScale?: number;
  colorDuration?: number;
  disabled?: boolean;
  thumbColor?: string;
  thumbOnColor?: string;
}

export function SquishSwitch({
  checked,
  onChange,
  label,
  trackColor = '#27272a',
  trackOnColor = '#ff5200',
  width = 64,
  height = 32,
  radius = 16,
  hoverScale = 1.035,
  stretch = 24,
  disabled = false,
  thumbColor = '#71717a',
  thumbOnColor = '#ffffff',
}: SquishSwitchProps) {
  const [isPressing, setIsPressing] = useState(false);

  const thumbSize = height - 6;
  const maxTravel = width - thumbSize - 6;

  return (
    <div className="flex items-center gap-2 select-none">
      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        whileHover={!disabled ? { scale: hoverScale } : undefined}
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onTouchStart={() => setIsPressing(true)}
        onTouchEnd={() => setIsPressing(false)}
        onClick={() => !disabled && onChange(!checked)}
        className="relative flex items-center p-[3px] focus:outline-none transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          width,
          height,
          borderRadius: radius,
          backgroundColor: checked ? trackOnColor : trackColor,
        }}
      >
        <motion.div
          animate={{
            x: checked ? maxTravel : 0,
            width: isPressing ? thumbSize + stretch / 4 : thumbSize,
            backgroundColor: checked ? thumbOnColor : thumbColor,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          style={{
            height: thumbSize,
            borderRadius: thumbSize / 2,
            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
          }}
        />
      </motion.button>
      {label && <span className="text-xs font-semibold text-zinc-300">{label}</span>}
    </div>
  );
}

export default SquishSwitch;
