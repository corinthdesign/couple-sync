export default function AverageDifference({ userMetrics, partnerMetrics }) {
  function calcAverage(metrics) {
    if (!metrics || metrics.length === 0) return null;

    let total = 0;
    let weightSum = 0;

    metrics.forEach((metric) => {
      const numericWeight = parseFloat(metric.weight ?? '1');
      const value = metric.scale_type === 'percentage'
        ? metric.value
        : (metric.value / 10) * 100;

      total += value * numericWeight;
      weightSum += numericWeight;
    });

    return total / weightSum;
  }

  const userAvg = calcAverage(userMetrics);
  const partnerAvg = calcAverage(partnerMetrics);

  if (userAvg === null || partnerAvg === null) return 0;

  return Math.round(userAvg - partnerAvg);
}