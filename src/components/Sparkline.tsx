import React from 'react';

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  className?: string;
  smooth?: boolean;
}

export const Sparkline: React.FC<SparklineProps> = ({
  values,
  width = 80,
  height = 28,
  stroke = '#3b82f6',
  strokeWidth = 1.5,
  fill = 'rgba(59,130,246,0.15)',
  className = '',
  smooth = true
}) => {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1 || 1);
  const points = values.map((v, i) => [i * step, height - ((v - min) / range) * (height - 2) - 1]);
  let d = '';
  if (smooth && points.length > 1) {
    d = points.reduce((acc, p, i, arr) => {
      if (i === 0) return `M ${p[0]},${p[1]}`;
      const prev = arr[i - 1];
      const cx = (prev[0] + p[0]) / 2;
      return acc + ` Q ${prev[0]},${prev[1]} ${cx},${(prev[1] + p[1]) / 2}`;
    }, '');
    d += ` T ${points[points.length - 1][0]},${points[points.length - 1][1]}`;
  } else {
    d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]},${p[1]}`).join(' ');
  }
  const areaPath = `${d} L ${points[points.length - 1][0]},${height} L 0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} aria-hidden="true">
      <path d={areaPath} fill={fill} stroke="none" />
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
};

export default Sparkline;
