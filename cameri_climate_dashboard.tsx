import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ComposedChart, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Thermometer, Droplets, Cloud, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  
  // Dati climatici storici per Cameri (luglio)
  const climateData = [
    { year: 1973, tempMedia: 21.3, tempMax: 26.9, humidity: 71.5, totalRain: 0.5 },
    { year: 1975, tempMedia: 22.0, tempMax: 28.8, humidity: 64.3, totalRain: 0.0 },
    { year: 1980, tempMedia: 20.5, tempMax: 26.8, humidity: 76.8, totalRain: 0.0 },
    { year: 1985, tempMedia: 23.8, tempMax: 29.5, humidity: 70.4, totalRain: 6.9 },
    { year: 1990, tempMedia: 21.7, tempMax: 28.3, humidity: 71.2, totalRain: 0.0 },
    { year: 1995, tempMedia: 24.2, tempMax: 29.5, humidity: 79.7, totalRain: 0.0 },
    { year: 2000, tempMedia: 21.5, tempMax: 27.8, humidity: 56.1, totalRain: 115.0 },
    { year: 2005, tempMedia: 24.8, tempMax: 28.9, humidity: 53.9, totalRain: 73.4 },
    { year: 2010, tempMedia: 26.2, tempMax: 30.4, humidity: 58.7, totalRain: 8.1 },
    { year: 2015, tempMedia: 28.4, tempMax: 32.0, humidity: 57.6, totalRain: 7.7 },
    { year: 2020, tempMedia: 25.7, tempMax: 28.9, humidity: 62.4, totalRain: 7.6 },
    { year: 2024, tempMedia: 26.7, tempMax: 30.1, humidity: 65.9, totalRain: 75.6 },
    { year: 2025, tempMedia: 27.9, tempMax: 33.7, humidity: 64.5, totalRain: 14.5 }
  ];

  // Calcola le tendenze
  const trends = useMemo(() => {
    const firstYear = climateData[0];
    const lastCompleteYear = climateData.find(d => d.year === 2024);
    
    const tempMediaChange = lastCompleteYear.tempMedia - firstYear.tempMedia;
    const tempMaxChange = lastCompleteYear.tempMax - firstYear.tempMax;
    const humidityChange = lastCompleteYear.humidity - firstYear.humidity;
    const rainChange = lastCompleteYear.totalRain - firstYear.totalRain;
    
    return {
      tempMedia: { value: tempMediaChange, isPositive: tempMediaChange > 0 },
      tempMax: { value: tempMaxChange, isPositive: tempMaxChange > 0 },
      humidity: { value: humidityChange, isPositive: humidityChange > 0 },
      rain: { value: rainChange, isPositive: rainChange > 0 }
    };
  }, [climateData]);

  const StatCard = ({ title, value, unit, trend, icon: Icon, color }) => (
    <div className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}{unit}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
      <div className="mt-4 flex items-center">
        {trend.isPositive ? (
          <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 text-blue-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${trend.isPositive ? 'text-red-600' : 'text-blue-600'}`}>
          {trend.isPositive ? '+' : ''}{trend.value.toFixed(1)}{unit}
        </span>
        <span className="text-sm text-gray-500 ml-1">dal 1973</span>
      </div>
    </div>
  );

  const currentYear = climateData[climateData.length - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard Climatico di Cameri
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Evoluzione delle temperature di Luglio (1973-2025)
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Calendar className="h-5 w-5" />
            <span>Dati mensili di Luglio • 52 anni di osservazioni</span>
          </div>
        </div>

        {/* Statistiche principali */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Temperatura Media"
            value={currentYear.tempMedia}
            unit="°C"
            trend={trends.tempMedia}
            icon={Thermometer}
            color="red"
          />
          <StatCard
            title="Temperatura Massima"
            value={currentYear.tempMax}
            unit="°C"
            trend={trends.tempMax}
            icon={Thermometer}
            color="orange"
          />
          <StatCard
            title="Umidità Media"
            value={currentYear.humidity}
            unit="%"
            trend={trends.humidity}
            icon={Cloud}
            color="blue"
          />
          <StatCard
            title="Precipitazioni Totali"
            value={currentYear.totalRain}
            unit="mm"
            trend={trends.rain}
            icon={Droplets}
            color="cyan"
          />
        </div>

        {/* Selector dei grafici */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => setSelectedMetric('temperature')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === 'temperature' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setSelectedMetric('humidity')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === 'humidity' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Umidità
            </button>
            <button
              onClick={() => setSelectedMetric('rain')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === 'rain' 
                  ? 'bg-cyan-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Precipitazioni
            </button>
            <button
              onClick={() => setSelectedMetric('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedMetric === 'all' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Panoramica
            </button>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {selectedMetric === 'temperature' && (
                <LineChart data={climateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      `${value}°C`, 
                      name === 'tempMedia' ? 'Temperatura Media' : 'Temperatura Massima'
                    ]}
                    labelFormatter={(year) => `Anno: ${year}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tempMedia" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    name="Temperatura Media"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tempMax" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                    name="Temperatura Massima"
                  />
                </LineChart>
              )}

              {selectedMetric === 'humidity' && (
                <AreaChart data={climateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Umidità (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value}%`, 'Umidità Media']}
                    labelFormatter={(year) => `Anno: ${year}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#3b82f6" 
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              )}

              {selectedMetric === 'rain' && (
                <BarChart data={climateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Precipitazioni (mm)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`${value} mm`, 'Precipitazioni']}
                    labelFormatter={(year) => `Anno: ${year}`}
                  />
                  <Bar 
                    dataKey="totalRain" 
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}

              {selectedMetric === 'all' && (
                <ComposedChart data={climateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#666"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="temp" stroke="#666" />
                  <YAxis yAxisId="rain" orientation="right" stroke="#06b6d4" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="temp"
                    type="monotone" 
                    dataKey="tempMedia" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Temp. Media (°C)"
                  />
                  <Bar 
                    yAxisId="rain"
                    dataKey="totalRain" 
                    fill="#06b6d4"
                    fillOpacity={0.6}
                    name="Precipitazioni (mm)"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confronto per periodi */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Confronto Temperature per Periodo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* anni '70 */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
              <div className="text-center">
                <h3 className="text-lg font-bold text-blue-800 mb-2">📅 Anni '70</h3>
                <p className="text-sm text-blue-600 mb-4">1973-1979</p>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Temperatura Media</p>
                    <p className="text-2xl font-bold text-blue-800">21.5°C</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Temperatura Max</p>
                    <p className="text-xl font-semibold text-blue-700">27.9°C</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2015-2024 */}
            <div className="bg-orange-50 rounded-lg p-6 border-2 border-orange-200">
              <div className="text-center">
                <h3 className="text-lg font-bold text-orange-800 mb-2">🔥 2015-2024</h3>
                <p className="text-sm text-orange-600 mb-4">Ultima decade</p>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Temperatura Media</p>
                    <p className="text-2xl font-bold text-orange-800">26.9°C</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Temperatura Max</p>
                    <p className="text-xl font-semibold text-orange-700">30.3°C</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +5.4°C vs anni '70
                  </span>
                </div>
              </div>
            </div>

            {/* 2025 */}
            <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
              <div className="text-center">
                <h3 className="text-lg font-bold text-red-800 mb-2">🌡️ 2025</h3>
                <p className="text-sm text-red-600 mb-4">Parziale (1-4 luglio)</p>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Temperatura Media</p>
                    <p className="text-2xl font-bold text-red-800">27.9°C</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Temperatura Max</p>
                    <p className="text-xl font-semibold text-red-700">33.7°C</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +6.4°C vs anni '70
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grafico comparativo */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Confronto Visivo delle Temperature Medie</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { periodo: "Anni '70", tempMedia: 21.5, tempMax: 27.9 },
                  { periodo: "2015-2024", tempMedia: 26.9, tempMax: 30.3 },
                  { periodo: "2025", tempMedia: 27.9, tempMax: 33.7 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="periodo" stroke="#666" />
                  <YAxis 
                    stroke="#666"
                    label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }}
                    domain={[15, 35]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value, name) => [
                      `${value}°C`, 
                      name === 'tempMedia' ? 'Temperatura Media' : 'Temperatura Massima'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="tempMedia" fill="#ef4444" name="Temperatura Media" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="tempMax" fill="#f97316" name="Temperatura Massima" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analisi dell'accelerazione */}
          <div className="mt-8 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  🚨 Accelerazione del Riscaldamento
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="space-y-1">
                    <li>• <strong>Anni '70</strong>: Temperature "normali" per l'epoca con media di 21.5°C</li>
                    <li>• <strong>2015-2024</strong>: Riscaldamento evidente con +5.4°C rispetto agli anni '70</li>
                    <li>• <strong>2025</strong>: Trend in continuazione con +6.4°C (su soli 4 giorni!)</li>
                    <li>• <strong>Velocità</strong>: Il riscaldamento sta accelerando nell'ultimo decennio</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analisi delle tendenze */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analisi delle Tendenze Climatiche</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🌡️ Temperature</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temperatura media:</span>
                  <span className="font-semibold text-red-600">
                    +{trends.tempMedia.value.toFixed(1)}°C dal 1973
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Temperatura massima:</span>
                  <span className="font-semibold text-orange-600">
                    +{trends.tempMax.value.toFixed(1)}°C dal 1973
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Le temperature mostrano un chiaro trend di riscaldamento, con un aumento significativo 
                  della temperatura media di luglio negli ultimi 50 anni.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">💧 Umidità e Precipitazioni</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Umidità media:</span>
                  <span className="font-semibold text-blue-600">
                    {trends.humidity.value.toFixed(1)}% dal 1973
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Precipitazioni totali:</span>
                  <span className="font-semibold text-cyan-600">
                    +{trends.rain.value.toFixed(1)}mm dal 1973
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  L'umidità è leggermente diminuita mentre le precipitazioni mostrano 
                  una maggiore variabilità con eventi più intensi negli ultimi anni.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  ⚠️ Impatti del Cambiamento Climatico
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    I dati di Cameri confermano le tendenze globali del riscaldamento climatico:
                    aumento delle temperature estive, maggiore variabilità delle precipitazioni 
                    e cambiamenti nei pattern di umidità. Questi trend hanno implicazioni 
                    importanti per l'agricoltura locale e la gestione delle risorse idriche.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;