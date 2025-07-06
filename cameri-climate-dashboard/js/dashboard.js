// ===== CLIMATE DASHBOARD JAVASCRIPT =====

class ClimateDashboard {
  constructor() {
    this.data = null;
    this.currentMetric = 'temperature';
    this.currentDecade = 'all';
    this.charts = {};
    this.colors = {
      primary: '#3b82f6',
      temperature: '#ef4444',
      temperatureMax: '#f97316',
      humidity: '#06b6d4',
      rain: '#0891b2',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    };
    
    this.init();
  }

  async init() {
    try {
      await this.loadData();
      this.setupEventListeners();
      this.updateStats();
      this.updateChart();
      this.updateDecadeComparison();
      this.showAlert('success', 'Dashboard caricata con successo!', 'Dati di 53 anni di osservazioni climatiche pronti per l\'analisi.');
    } catch (error) {
      console.error('Errore inizializzazione:', error);
      this.showAlert('danger', 'Errore di caricamento', 'Impossibile caricare i dati climatici.');
    }
  }

  async loadData() {
    const response = await fetch('./data/climate-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    this.data = await response.json();
    console.log('Dati caricati:', this.data);
  }

  setupEventListeners() {
    // Metric buttons
    document.querySelectorAll('[data-metric]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const metric = e.target.dataset.metric;
        this.setMetric(metric);
      });
    });

    // Decade selector
    const decadeSelect = document.getElementById('decadeSelect');
    if (decadeSelect) {
      decadeSelect.addEventListener('change', (e) => {
        this.setDecade(e.target.value);
      });
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportToCSV();
      });
    }
  }

  setMetric(metric) {
    this.currentMetric = metric;
    
    // Update button states
    document.querySelectorAll('[data-metric]').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-metric="${metric}"]`).classList.add('active');
    
    this.updateChart();
  }

  setDecade(decade) {
    this.currentDecade = decade;
    this.updateChart();
    this.updateStats();
  }

  getFilteredData() {
    const annualStats = this.data.annualStats;
    
    if (this.currentDecade === 'all') {
      return annualStats;
    }
    
    const decadeStart = parseInt(this.currentDecade);
    let decadeEnd = decadeStart + 9;
    
    // Handle special cases
    if (this.currentDecade === '1973') {
      return annualStats.filter(d => d.year >= 1973 && d.year <= 1979);
    }
    if (this.currentDecade === '2020') {
      return annualStats.filter(d => d.year >= 2020 && d.year <= 2025);
    }
    
    return annualStats.filter(d => d.year >= decadeStart && d.year <= decadeEnd);
  }

  updateStats() {
    const data = this.getFilteredData();
    const current2025 = this.data.annualStats.find(d => d.year === 2025);
    const first = this.data.annualStats[0]; // 1973
    const last2024 = this.data.annualStats.find(d => d.year === 2024);
    
    // Calculate trends
    const tempTrend = last2024.tempMedia - first.tempMedia;
    const tempMaxTrend = last2024.tempMax - first.tempMax;
    const humidityTrend = last2024.humidity - first.humidity;
    const rainTrend = last2024.totalRain - first.totalRain;
    
    // Update stat cards
    this.updateStatCard('tempMediaStat', current2025.tempMedia, '°C', tempTrend, '°C');
    this.updateStatCard('tempMaxStat', current2025.tempMax, '°C', tempMaxTrend, '°C');
    this.updateStatCard('humidityStat', current2025.humidity, '%', humidityTrend, '%');
    this.updateStatCard('rainStat', current2025.totalRain, 'mm', rainTrend, 'mm');
    
    // Update period info
    const periodInfo = document.getElementById('periodInfo');
    if (periodInfo) {
      const years = data.map(d => d.year);
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      periodInfo.textContent = `${data.length} anni (${minYear}-${maxYear})`;
    }
  }

  updateStatCard(elementId, value, unit, trend, trendUnit) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const valueEl = element.querySelector('.stat-value');
    const trendEl = element.querySelector('.trend');
    
    if (valueEl) {
      valueEl.textContent = `${value}${unit}`;
    }
    
    if (trendEl) {
      const isPositive = trend > 0;
      const trendIcon = trendEl.querySelector('.trend-icon');
      const trendValue = trendEl.querySelector('.trend-value');
      
      trendEl.className = `trend ${isPositive ? 'positive' : 'negative'}`;
      
      if (trendIcon) {
        trendIcon.innerHTML = isPositive ? 
          '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12 5-5 5 5m-5-5v12"/>' :
          '<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12 5 5 5-5m-5 5V7"/>';
      }
      
      if (trendValue) {
        trendValue.textContent = `${isPositive ? '+' : ''}${trend.toFixed(1)}${trendUnit}`;
      }
    }
  }

  updateChart() {
    const container = document.getElementById('chartContainer');
    if (!container) return;
    
    // Destroy existing chart
    if (this.charts.main) {
      this.charts.main.destroy();
    }
    
    // Create canvas
    container.innerHTML = '<canvas id="mainChart"></canvas>';
    const ctx = document.getElementById('mainChart').getContext('2d');
    
    const data = this.getFilteredData();
    
    switch (this.currentMetric) {
      case 'temperature':
        this.createTemperatureChart(ctx, data);
        break;
      case 'humidity':
        this.createHumidityChart(ctx, data);
        break;
      case 'rain':
        this.createRainChart(ctx, data);
        break;
      case 'trends':
        this.createTrendsChart(ctx, data);
        break;
      case 'all':
        this.createOverviewChart(ctx, data);
        break;
    }
  }

  createTemperatureChart(ctx, data) {
    this.charts.main = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.year),
        datasets: [
          {
            label: 'Temperatura Media',
            data: data.map(d => d.tempMedia),
            borderColor: this.colors.temperature,
            backgroundColor: this.colors.temperature + '20',
            borderWidth: 3,
            fill: false,
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Temperatura Massima',
            data: data.map(d => d.tempMax),
            borderColor: this.colors.temperatureMax,
            backgroundColor: this.colors.temperatureMax + '20',
            borderWidth: 3,
            fill: false,
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperatura (°C)',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            title: {
              display: true,
              text: 'Anno',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { weight: 'bold' } }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}°C`
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
  }

  createHumidityChart(ctx, data) {
    this.charts.main = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.year),
        datasets: [{
          label: 'Umidità Media',
          data: data.map(d => d.humidity),
          borderColor: this.colors.humidity,
          backgroundColor: this.colors.humidity + '20',
          borderWidth: 3,
          fill: true,
          tension: 0.1,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Umidità (%)',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            title: {
              display: true,
              text: 'Anno',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { weight: 'bold' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
            }
          }
        }
      }
    });
  }

  createRainChart(ctx, data) {
    this.charts.main = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.year),
        datasets: [{
          label: 'Precipitazioni Totali',
          data: data.map(d => d.totalRain),
          backgroundColor: this.colors.rain,
          borderColor: this.colors.rain,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Precipitazioni (mm)',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          },
          x: {
            title: {
              display: true,
              text: 'Anno',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { weight: 'bold' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)} mm`
            }
          }
        }
      }
    });
  }

  createTrendsChart(ctx, data) {
    this.charts.main = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Correlazione Temperatura-Umidità',
          data: data.map(d => ({
            x: d.tempMedia,
            y: d.humidity,
            year: d.year
          })),
          backgroundColor: this.colors.primary + '80',
          borderColor: this.colors.primary,
          borderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Temperatura Media (°C)',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          },
          y: {
            title: {
              display: true,
              text: 'Umidità (%)',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { weight: 'bold' } }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = context.raw;
                return [
                  `Anno: ${point.year}`,
                  `Temperatura: ${point.x.toFixed(1)}°C`,
                  `Umidità: ${point.y.toFixed(1)}%`
                ];
              }
            }
          }
        }
      }
    });
  }

  createOverviewChart(ctx, data) {
    this.charts.main = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.year),
        datasets: [
          {
            label: 'Temperatura Media',
            data: data.map(d => d.tempMedia),
            borderColor: this.colors.temperature,
            backgroundColor: this.colors.temperature + '20',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y'
          },
          {
            label: 'Precipitazioni',
            data: data.map(d => d.totalRain),
            type: 'bar',
            backgroundColor: this.colors.rain + '60',
            borderColor: this.colors.rain,
            borderWidth: 1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Temperatura (°C)',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Precipitazioni (mm)',
              font: { weight: 'bold' }
            },
            grid: { drawOnChartArea: false }
          },
          x: {
            title: {
              display: true,
              text: 'Anno',
              font: { weight: 'bold' }
            },
            grid: { color: '#f1f5f9' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { font: { weight: 'bold' } }
          }
        }
      }
    });
  }

  updateDecadeComparison() {
    const decades = [
      { name: '1970s', years: '1973-1979', start: 1973, end: 1979, emoji: '📅', class: 'blue' },
      { name: '1980s', years: '1980-1989', start: 1980, end: 1989, emoji: '🌡️', class: 'green' },
      { name: '1990s', years: '1990-1999', start: 1990, end: 1999, emoji: '📈', class: 'yellow' },
      { name: '2000s', years: '2000-2009', start: 2000, end: 2009, emoji: '🌍', class: 'orange' },
      { name: '2010s', years: '2010-2019', start: 2010, end: 2019, emoji: '🔥', class: 'red' },
      { name: '2020s', years: '2020-2025', start: 2020, end: 2025, emoji: '🚨', class: 'purple' }
    ];

    const container = document.getElementById('decadeComparison');
    if (!container) return;

    container.innerHTML = '';

    decades.forEach((decade, index) => {
      const decadeData = this.data.annualStats.filter(d => d.year >= decade.start && d.year <= decade.end);
      
      if (decadeData.length === 0) return;

      const avgTemp = decadeData.reduce((sum, d) => sum + d.tempMedia, 0) / decadeData.length;
      const avgTempMax = decadeData.reduce((sum, d) => sum + d.tempMax, 0) / decadeData.length;
      const avgHumidity = decadeData.reduce((sum, d) => sum + d.humidity, 0) / decadeData.length;
      
      const isRecent = index >= 4; // 2010s e 2020s
      
      const card = document.createElement('div');
      card.className = `card decade-card ${isRecent ? 'recent' : ''}`;
      card.innerHTML = `
        <div class="decade-header">
          <h3 class="decade-title">${decade.emoji} ${decade.name}</h3>
          <p class="decade-subtitle">${decade.years} (${decadeData.length} anni)</p>
        </div>
        <div class="decade-stats">
          <div class="decade-stat">
            <div class="decade-stat-label">Temperatura Media</div>
            <div class="decade-stat-value">${avgTemp.toFixed(1)}°C</div>
          </div>
          <div class="decade-stat">
            <div class="decade-stat-label">Temperatura Max</div>
            <div class="decade-stat-value">${avgTempMax.toFixed(1)}°C</div>
          </div>
          <div class="decade-stat">
            <div class="decade-stat-label">Umidità Media</div>
            <div class="decade-stat-value">${avgHumidity.toFixed(1)}%</div>
          </div>
        </div>
        ${isRecent ? `
          <div class="decade-badge">
            <svg class="decade-badge-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12 5-5 5 5m-5-5v12"/>
            </svg>
            Riscaldamento intenso
          </div>
        ` : ''}
      `;
      
      container.appendChild(card);
    });
  }

  exportToCSV() {
    const data = this.getFilteredData();
    
    // Create CSV header
    const headers = ['Anno', 'Temperatura Media (°C)', 'Temperatura Max (°C)', 'Umidità (%)', 'Precipitazioni (mm)', 'Giorni Validi'];
    
    // Create CSV rows
    const rows = data.map(d => [
      d.year,
      d.tempMedia.toFixed(1),
      d.tempMax.toFixed(1),
      d.humidity.toFixed(1),
      d.totalRain.toFixed(1),
      d.validDays
    ]);
    
    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename
      const period = this.currentDecade === 'all' ? '1973-2025' : 
                   this.currentDecade === '1973' ? '1973-1979' :
                   this.currentDecade === '2020' ? '2020-2025' :
                   `${this.currentDecade}-${parseInt(this.currentDecade) + 9}`;
      
      link.setAttribute('download', `cameri_climate_data_${period}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      this.showAlert('success', 'Esportazione completata!', `File CSV scaricato per il periodo ${period}.`);
    }
  }

  showAlert(type, title, message) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;
    
    const alertEl = document.createElement('div');
    alertEl.className = `alert ${type}`;
    alertEl.innerHTML = `
      <svg class="alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        ${type === 'success' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>' :
          type === 'warning' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>' :
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'}
      </svg>
      <div>
        <div class="alert-title">${title}</div>
        <div class="alert-content">${message}</div>
      </div>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertEl);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (alertEl.parentNode) {
        alertEl.style.opacity = '0';
        setTimeout(() => {
          if (alertEl.parentNode) {
            alertEl.parentNode.removeChild(alertEl);
          }
        }, 300);
      }
    }, 5000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ClimateDashboard();
});

// Add loading indicator
document.addEventListener('DOMContentLoaded', () => {
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  loadingEl.innerHTML = `
    <div class="spinner"></div>
    <span>Caricamento dati climatici...</span>
  `;
  
  const container = document.querySelector('.container');
  if (container) {
    container.insertBefore(loadingEl, container.firstChild);
    
    // Remove loading after dashboard init
    setTimeout(() => {
      if (loadingEl.parentNode) {
        loadingEl.parentNode.removeChild(loadingEl);
      }
    }, 2000);
  }
});