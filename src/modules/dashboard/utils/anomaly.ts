export interface RevenuePoint { month: string; revenue: number; rolling?: number | null; }
export interface AnomalyPoint extends RevenuePoint { isAnomaly: boolean; deviationPct: number; direction: 'up' | 'down' | null; severity: 'minor' | 'moderate' | 'major' | null; }

// Identify anomalies where absolute deviation vs rolling avg > threshold (default 0.18 = 18%)
export function detectAnomalies(data: RevenuePoint[], threshold = 0.18): AnomalyPoint[] {
  return data.map(d => {
    if (d.rolling == null || d.rolling === 0) return { ...d, isAnomaly:false, deviationPct:0, direction:null, severity:null };
    const deviation = (d.revenue - d.rolling) / d.rolling; // positive if above
    const isAnomaly = Math.abs(deviation) > threshold;
    let severity: AnomalyPoint['severity'] = null;
    if (isAnomaly) {
      const abs = Math.abs(deviation);
      severity = abs > 0.35 ? 'major' : abs > 0.25 ? 'moderate' : 'minor';
    }
    return {
      ...d,
      isAnomaly,
      deviationPct: deviation * 100,
      direction: deviation > 0 ? 'up' : 'down',
      severity
    };
  });
}
