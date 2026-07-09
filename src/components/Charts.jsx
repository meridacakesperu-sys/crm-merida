import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7b61ff', '#16c784', '#4dd0e1', '#ff8a65'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #f0f0f5', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <p className="label" style={{ color: '#1f1b40', fontWeight: 'bold' }}>{label}</p>
        <p className="intro" style={{ color: '#7b61ff' }}>{`$ ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({ students = [], timeframe, onTimeframeChange, totalRevenue, exchangeRate = 3.80 }) => {
  const chartData = useMemo(() => {
    // 1. Extract all payments
    let allPayments = [];
    students.forEach(s => {
      if (s.historialPagos) {
        s.historialPagos.forEach(p => {
          const parts = p.fecha.split('/');
          if (parts.length === 3) {
            const yy = parts[2].length === 4 ? parseInt(parts[2]) : 2000 + parseInt(parts[2]);
            const date = new Date(yy, parseInt(parts[1]) - 1, parts[0]);
            // Convert to Dollars
            const valueInDollars = p.moneda === 'Soles' ? parseFloat(p.monto) / exchangeRate : parseFloat(p.monto);
            allPayments.push({ date, value: valueInDollars });
          }
        });
      }
    });

    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    let groupFormat = 'day';
    
    if (timeframe === '1W') {
      startDate.setDate(today.getDate() - 7);
    } else if (timeframe === '1M') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (timeframe === '3M') {
      startDate.setMonth(today.getMonth() - 3);
      groupFormat = 'month';
    } else if (timeframe === '6M') {
      startDate.setMonth(today.getMonth() - 6);
      groupFormat = 'month';
    } else if (timeframe === '1Y') {
      startDate.setFullYear(today.getFullYear() - 1);
      groupFormat = 'month';
    }

    startDate.setHours(0, 0, 0, 0);

    // 2. Filter by date range
    const validPayments = allPayments.filter(p => p.date >= startDate && p.date <= today);

    // 3. Group and aggregate
    const grouped = {};
    
    if (groupFormat === 'day') {
      // Initialize all days in range to 0
      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        const key = `${d.getDate()}/${d.getMonth()+1}`;
        grouped[key] = 0;
      }
      validPayments.forEach(p => {
        const key = `${p.date.getDate()}/${p.date.getMonth()+1}`;
        if (grouped[key] !== undefined) grouped[key] += p.value;
      });
    } else {
      // Initialize all months in range to 0
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      for (let d = new Date(startDate); d <= today; d.setMonth(d.getMonth() + 1)) {
        const key = `${monthNames[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
        grouped[key] = 0;
      }
      validPayments.forEach(p => {
        const key = `${monthNames[p.date.getMonth()]} ${String(p.date.getFullYear()).slice(2)}`;
        if (grouped[key] !== undefined) grouped[key] += p.value;
      });
    }

    return Object.keys(grouped).map(key => ({
      name: key,
      value: Math.round(grouped[key])
    }));
  }, [students, timeframe]);

  // Determine trend color (stock market feel)
  const isPositive = chartData.length > 1 ? chartData[chartData.length - 1].value >= chartData[0].value : true;
  const strokeColor = isPositive ? '#16c784' : '#ea3943';

  return (
    <div className="chart-container fade-in" style={{ animationDelay: '0.5s', backgroundColor: 'var(--card-bg)' }}>
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0 }}>Rendimiento de Ventas</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
            Estimado en Dólares ($) • <strong style={{ color: 'var(--primary-color)' }}>Total: ${totalRevenue || 0}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '5px', backgroundColor: '#f0f0f5', padding: '4px', borderRadius: '8px' }}>
          {['1W', '1M', '3M', '6M', '1Y'].map(tf => (
            <button 
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              style={{
                background: timeframe === tf ? 'white' : 'transparent',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: timeframe === tf ? 'bold' : 'normal',
                color: timeframe === tf ? 'var(--text-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                boxShadow: timeframe === tf ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {tf === '1W' ? '1 Sem' : tf === '1M' ? '1 Mes' : tf === '3M' ? '3 Meses' : tf === '6M' ? '6 Meses' : '1 Año'}
            </button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f5" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8892b0', fontSize: 11 }} dy={10} minTickGap={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8892b0', fontSize: 11 }} tickFormatter={(val) => `S/ ${val}`} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={strokeColor} 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 6, fill: strokeColor, strokeWidth: 2, stroke: '#fff' }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const CustomerChart = ({ students }) => {
  const customerData = useMemo(() => {
    if (!students) return [];
    
    let planes = { Mensual: 0, Anual: 0, Cuotas: 0, Otro: 0 };
    students.forEach(s => {
      if (s.estatus === 'Activo' || s.estatus === 'Completado') {
        if (planes[s.plan] !== undefined) {
          planes[s.plan]++;
        } else {
          planes.Otro++;
        }
      }
    });

    return [
      { name: 'Mensual', value: planes.Mensual },
      { name: 'Anual', value: planes.Anual },
      { name: 'Cuotas', value: planes.Cuotas },
    ].filter(item => item.value > 0);
  }, [students]);

  const totalActivas = customerData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="chart-container fade-in" style={{ animationDelay: '0.6s' }}>
      <div className="chart-header">
        <h3>Alumnos Activos por Plan</h3>
      </div>
      <div style={{ width: '100%', height: 200, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={customerData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {customerData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1f1b40' }}>{totalActivas}</h2>
          <p style={{ fontSize: '0.7rem', color: '#8892b0' }}>Total</p>
        </div>
      </div>
      <div className="pie-legend" style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
        {customerData.map((entry, index) => (
          <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[index] }}></div>
            <span style={{ fontSize: '0.8rem', color: '#8892b0' }}>{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
