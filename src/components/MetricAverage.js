export default function MetricAverage({ metrics }) {
    if (!metrics || metrics.length === 0) return <p>Score: --%</p>;
  
    let total = 0;
    let weightSum = 0;
  
    metrics.forEach((metric) => {
        const numericWeight = parseFloat(metric.weight ?? '1');
        const value = metric.scale_type === 'percentage'
        ? metric.value
        : (metric.value / 10) * 100;
  
      total += value * numericWeight;
      weightSum += numericWeight;

      console.log(numericWeight);
    });
  
    const average = total / weightSum;
    const rounded = Math.round(average);

    
  
    return (
      <div className="average-score text-center my-4">
        <h2 className="text-xl font-semibold">How Full is Your Love Tank?</h2>
        <div className="syncNum text-4xl font-bold text-blue-600">{rounded}%</div>
      </div>
    );
  }
  