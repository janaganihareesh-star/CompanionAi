import React from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function UniversalChartRenderer({ outputString }) {
  const [ssrImage, setSsrImage] = React.useState(null);
  const [isRenderingSSR, setIsRenderingSSR] = React.useState(false);
  // Try to parse the output string as JSON.
  // We look for a JSON object in the string that has { "closer_chart": true }
  let chartData = null;
  try {
    // Sometimes output has logs + JSON at the end. We'll try to extract JSON using regex.
    const jsonMatch = outputString.match(/\{[\s\S]*"closer_chart"\s*:\s*true[\s\S]*\}/);
    if (jsonMatch) {
      chartData = JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // Not a valid chart JSON
    return null;
  }

  if (!chartData || !chartData.closer_chart || !chartData.data) {
    return null; // Not a chart
  }

  const { type, data, title, xKey, yKey } = chartData;
  const isMassiveDataset = data.length > 1000;

  React.useEffect(() => {
    if (isMassiveDataset && !ssrImage && !isRenderingSSR) {
      const renderOnServer = async () => {
        setIsRenderingSSR(true);
        try {
          const token = localStorage.getItem('closer-token');
          // We send a Chart.js script representation of the data to the backend for rendering
          const code = `
            new Chart(ctx, {
              type: '${type === 'area' ? 'line' : type}',
              data: {
                labels: ${JSON.stringify(data.map(d => d[xKey || 'name']))},
                datasets: [{
                  label: '${yKey || 'value'}',
                  data: ${JSON.stringify(data.map(d => d[yKey || 'value']))},
                  backgroundColor: '#6366f1'
                }]
              },
              options: { responsive: false }
            });
          `;
          const res = await api.post('/api/code/render-chart', { code });
          if (res.data.image) {
            setSsrImage(res.data.image);
          }
        } catch (err) {
          console.error("SSR Chart Failed:", err);
        } finally {
          setIsRenderingSSR(false);
        }
      };
      renderOnServer();
    }
  }, [isMassiveDataset, data, type, xKey, yKey, ssrImage, isRenderingSSR]);

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
            <XAxis dataKey={xKey || 'name'} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
            <Legend />
            <Bar dataKey={yKey || 'value'} fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
            <XAxis dataKey={xKey || 'name'} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
            <Legend />
            <Line type="monotone" dataKey={yKey || 'value'} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff1a" />
            <XAxis dataKey={xKey || 'name'} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
            <Legend />
            <Area type="monotone" dataKey={yKey || 'value'} stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
          </AreaChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333' }} />
            <Legend />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey={yKey || 'value'}
              nameKey={xKey || 'name'}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-muted">
            Unsupported chart type: {type}
          </div>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#121212] border border-border/40 rounded-xl p-6 mt-4 w-full shadow-2xl"
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-indigo-400" />
        <h3 className="text-white font-bold text-lg font-outfit">{title || 'Data Visualization'}</h3>
        <span className="ml-auto text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Universal Render Engine</span>
      </div>
      
      <div className="h-[300px] w-full">
        {isMassiveDataset ? (
          ssrImage ? (
            <img src={ssrImage} alt="Server Rendered Chart" className="w-full h-full object-contain rounded-xl" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Rendering massive dataset on server to protect DOM...</p>
            </div>
          )
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </motion.div>
  );
}
