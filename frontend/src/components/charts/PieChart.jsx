import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({ 
  data, 
  title, 
  height = 300, 
  width = 400,
  options = {} 
}) => {
  const chartRef = useRef(null);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options
  };

  return (
    <div className="pie-chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div 
        className="chart-wrapper" 
        style={{ height: `${height}px`, width: `${width}px` }}
      >
        <Pie 
          ref={chartRef}
          data={data} 
          options={mergedOptions}
        />
      </div>
    </div>
  );
};

export default PieChart; 
