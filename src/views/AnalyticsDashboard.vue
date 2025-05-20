<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>PadelResults Analytics</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="dashboard-content">
      <!-- Selector de vista -->
      <ion-segment v-model="viewMode" @ionChange="changeView">
        <ion-segment-button value="business">
          <ion-label>Business</ion-label>
        </ion-segment-button>
        <ion-segment-button value="technical">
          <ion-label>Technical</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- Dashboard de Negocio -->
      <div v-if="viewMode === 'business'" class="dashboard-section">
        <h2 class="section-title">Business Metrics</h2>
        <p class="section-subtitle">App performance and user engagement</p>
        
        <div class="grid-container">
          <!-- Gráfico 1: Usuarios registrados (ChartJS) -->
          <div class="chart-card">
            <h3>User Growth</h3>
            <canvas ref="userGrowthChart"></canvas>
            <p class="chart-note">Slow but steady growth. Needs improvement in acquisition.</p>
          </div>
          
          <!-- Gráfico 2: Actividad por funcionalidad (ApexCharts) -->
          <div class="chart-card">
            <h3>Feature Usage</h3>
            <div ref="featureUsageChart"></div>
            <p class="chart-note">Predictions are the most used feature.</p>
          </div>
          
          <!-- Gráfico 3: Retención (ECharts) -->
          <div class="chart-card">
            <h3>User Retention</h3>
            <div ref="retentionChart" style="height: 300px;"></div>
            <p class="chart-note">Low retention after first week.</p>
          </div>
          
          <!-- Gráfico 4: Dispositivos (ChartJS) -->
          <div class="chart-card">
            <h3>Device Distribution</h3>
            <canvas ref="deviceChart"></canvas>
            <p class="chart-note">Most users are on Android.</p>
          </div>
          
          <!-- Gráfico 5: Eventos en tiempo real (Propio) -->
          <div class="chart-card">
            <h3>Real-time Events</h3>
            <div class="real-time-events">
              <div v-for="(event, index) in realTimeEvents" :key="index" class="event-item">
                <span class="event-time">{{ event.time }}</span>
                <span class="event-type" :class="event.type">{{ event.type }}</span>
                <span class="event-desc">{{ event.description }}</span>
              </div>
            </div>
            <p class="chart-note">Live user activity stream.</p>
          </div>
        </div>
      </div>

      <!-- Dashboard Técnico -->
      <div v-if="viewMode === 'technical'" class="dashboard-section">
        <h2 class="section-title">Technical Metrics</h2>
        <p class="section-subtitle">App performance and stability</p>
        
        <div class="grid-container">
          <!-- Gráfico 6: Rendimiento (ApexCharts) -->
          <div class="chart-card">
            <h3>App Performance</h3>
            <div ref="performanceChart"></div>
            <p class="chart-note">Some screens need optimization.</p>
          </div>
          
          <!-- Gráfico 7: Errores (ECharts) -->
          <div class="chart-card">
            <h3>Error Tracking</h3>
            <div ref="errorChart" style="height: 300px;"></div>
            <p class="chart-note">Map integration causes most errors.</p>
          </div>
          
          <!-- Gráfico 8: Tiempos de carga (ChartJS) -->
          <div class="chart-card">
            <h3>Load Times</h3>
            <canvas ref="loadTimeChart"></canvas>
            <p class="chart-note">Tournaments page loads slowly.</p>
          </div>
          
          <!-- Gráfico 9: Uso de API (Propio) -->
          <div class="chart-card">
            <h3>API Usage</h3>
            <div class="api-usage">
              <div class="api-endpoint" v-for="(endpoint, index) in apiEndpoints" :key="index">
                <div class="endpoint-name">{{ endpoint.name }}</div>
                <div class="endpoint-bar">
                  <div class="bar-fill" :style="{ width: endpoint.usage + '%' }"></div>
                  <span class="bar-label">{{ endpoint.usage }}%</span>
                </div>
              </div>
            </div>
            <p class="chart-note">Tournament data is most requested.</p>
          </div>
          
          <!-- Gráfico 10: Sesiones (ApexCharts) -->
          <div class="chart-card">
            <h3>Session Duration</h3>
            <div ref="sessionChart"></div>
            <p class="chart-note">Most sessions are short (under 2 min).</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel
} from '@ionic/vue';
import Chart from 'chart.js/auto';
import ApexCharts from 'apexcharts';
import * as echarts from 'echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
]);

export default defineComponent({
  name: 'AnalyticsDashboard',
  components: {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel
  },
  setup() {
    const viewMode = ref('business');
    
    // Datos para gráficos de negocio
    const userGrowthChart = ref<HTMLCanvasElement | null>(null);
    const featureUsageChart = ref<HTMLElement | null>(null);
    const retentionChart = ref<HTMLElement | null>(null);
    const deviceChart = ref<HTMLCanvasElement | null>(null);
    
    // Datos para gráficos técnicos
    const performanceChart = ref<HTMLElement | null>(null);
    const errorChart = ref<HTMLElement | null>(null);
    const loadTimeChart = ref<HTMLCanvasElement | null>(null);
    const sessionChart = ref<HTMLElement | null>(null);
    
    // Datos de ejemplo para simular éxito medio-bajo
    const realTimeEvents = ref([
      { time: '10:30', type: 'login', description: 'User logged in' },
      { time: '10:31', type: 'predict', description: 'Prediction made' },
      { time: '10:33', type: 'view', description: 'News viewed' },
      { time: '10:35', type: 'logout', description: 'User logged out' }
    ]);
    
    const apiEndpoints = ref([
      { name: '/api/tournaments', usage: 45 },
      { name: '/api/players', usage: 30 },
      { name: '/api/news', usage: 15 },
      { name: '/api/predictions', usage: 10 }
    ]);
    
    // Simular eventos en tiempo real
    const simulateRealTimeEvents = () => {
      const eventTypes = ['login', 'predict', 'view', 'logout'];
      const descriptions = [
        'User logged in',
        'Prediction made',
        'News viewed',
        'Tournament checked',
        'Player stats viewed',
        'User logged out'
      ];
      
      setInterval(() => {
        const now = new Date();
        const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];
        
        realTimeEvents.value.unshift({ time, type, description });
        
        if (realTimeEvents.value.length > 10) {
          realTimeEvents.value.pop();
        }
      }, 5000);
    };
    
    // Inicializar gráficos
    const initCharts = () => {
      // Gráfico 1: Crecimiento de usuarios (ChartJS)
      if (userGrowthChart.value) {
        new Chart(userGrowthChart.value, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Registered Users',
              data: [120, 190, 230, 270, 310, 350],
              borderColor: '#c3ff00',
              backgroundColor: 'rgba(195, 255, 0, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
      
      // Gráfico 2: Uso de funcionalidades (ApexCharts)
      if (featureUsageChart.value) {
        const chart = new ApexCharts(featureUsageChart.value, {
          series: [{
            name: 'Usage',
            data: [45, 70, 30, 50, 25]
          }],
          chart: {
            type: 'bar',
            height: 300
          },
          colors: ['#c3ff00'],
          plotOptions: {
            bar: {
              borderRadius: 4,
              horizontal: true,
            }
          },
          dataLabels: {
            enabled: false
          },
          xaxis: {
            categories: ['Predictions', 'Tournaments', 'News', 'Ranking', 'Profile']
          }
        });
        chart.render();
      }
      
      // Gráfico 3: Retención de usuarios (ECharts)
      if (retentionChart.value) {
        const chart = echarts.init(retentionChart.value);
        chart.setOption({
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['Day 1', 'Day 7', 'Day 30']
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
          },
          yAxis: {
            type: 'value',
            max: 100,
            axisLabel: {
              formatter: '{value}%'
            }
          },
          series: [
            {
              name: 'Day 1',
              type: 'line',
              data: [100, 100, 100, 100, 100, 100],
              lineStyle: {
                color: '#c3ff00',
                width: 4
              },
              symbol: 'circle',
              symbolSize: 8,
              itemStyle: {
                color: '#c3ff00'
              }
            },
            {
              name: 'Day 7',
              type: 'line',
              data: [45, 50, 48, 52, 55, 50],
              lineStyle: {
                color: '#2e2e34',
                width: 3
              },
              symbol: 'circle',
              symbolSize: 6,
              itemStyle: {
                color: '#2e2e34'
              }
            },
            {
              name: 'Day 30',
              type: 'line',
              data: [15, 18, 20, 22, 25, 20],
              lineStyle: {
                color: '#888',
                width: 2
              },
              symbol: 'circle',
              symbolSize: 4,
              itemStyle: {
                color: '#888'
              }
            }
          ]
        });
      }
      
      // Gráfico 4: Dispositivos (ChartJS)
      if (deviceChart.value) {
        new Chart(deviceChart.value, {
          type: 'doughnut',
          data: {
            labels: ['Android', 'iOS', 'Web'],
            datasets: [{
              data: [75, 20, 5],
              backgroundColor: [
                '#c3ff00',
                '#2e2e34',
                '#888'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
      
      // Gráfico 6: Rendimiento (ApexCharts)
      if (performanceChart.value) {
        const chart = new ApexCharts(performanceChart.value, {
          series: [{
            name: 'Render Time (ms)',
            data: [120, 90, 150, 80, 200, 70]
          }],
          chart: {
            type: 'radar',
            height: 350
          },
          colors: ['#c3ff00'],
          xaxis: {
            categories: ['Login', 'Tournaments', 'Predictions', 'News', 'Ranking', 'Profile']
          },
          yaxis: {
            show: false
          }
        });
        chart.render();
      }
      
      // Gráfico 7: Errores (ECharts)
      if (errorChart.value) {
        const chart = echarts.init(errorChart.value);
        chart.setOption({
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '5%',
            left: 'center'
          },
          series: [
            {
              name: 'Error Sources',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: '18',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 45, name: 'Map Integration' },
                { value: 25, name: 'API Calls' },
                { value: 15, name: 'Authentication' },
                { value: 10, name: 'UI Rendering' },
                { value: 5, name: 'Other' }
              ]
            }
          ]
        });
      }
      
      // Gráfico 8: Tiempos de carga (ChartJS)
      if (loadTimeChart.value) {
        new Chart(loadTimeChart.value, {
          type: 'bar',
          data: {
            labels: ['Login', 'Tournaments', 'Predictions', 'News', 'Ranking'],
            datasets: [{
              label: 'Load Time (ms)',
              data: [800, 1500, 900, 1100, 950],
              backgroundColor: [
                'rgba(195, 255, 0, 0.7)',
                'rgba(46, 46, 52, 0.7)',
                'rgba(195, 255, 0, 0.7)',
                'rgba(46, 46, 52, 0.7)',
                'rgba(195, 255, 0, 0.7)'
              ],
              borderColor: [
                '#c3ff00',
                '#2e2e34',
                '#c3ff00',
                '#2e2e34',
                '#c3ff00'
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
      
      // Gráfico 10: Duración de sesión (ApexCharts)
      if (sessionChart.value) {
        const chart = new ApexCharts(sessionChart.value, {
          series: [{
            name: 'Sessions',
            data: [120, 90, 70, 50, 30, 20]
          }],
          chart: {
            type: 'pie',
            height: 350
          },
          labels: ['<1 min', '1-2 min', '2-5 min', '5-10 min', '10-20 min', '>20 min'],
          colors: ['#c3ff00', '#2e2e34', '#888', '#aaa', '#ccc', '#eee'],
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
        });
        chart.render();
      }
    };
    
    onMounted(() => {
      initCharts();
      simulateRealTimeEvents();
    });
    
    const changeView = () => {
      // Re-inicializar gráficos cuando cambia la vista
      setTimeout(initCharts, 50);
    };
    
    return {
      viewMode,
      userGrowthChart,
      featureUsageChart,
      retentionChart,
      deviceChart,
      performanceChart,
      errorChart,
      loadTimeChart,
      sessionChart,
      realTimeEvents,
      apiEndpoints,
      changeView
    };
  }
});
</script>

<style scoped>
.dashboard-content {
  --background: #f8f9fa;
  padding: 16px;
}

.section-title {
  color: #2e2e34;
  margin-top: 20px;
  margin-bottom: 5px;
  font-size: 1.5rem;
  font-weight: bold;
}

.section-subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.chart-card {
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  color: #2e2e34;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.chart-note {
  color: #666;
  font-size: 0.8rem;
  margin-top: 10px;
  margin-bottom: 0;
  font-style: italic;
}

.real-time-events {
  max-height: 300px;
  overflow-y: auto;
}

.event-item {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 50px 80px 1fr;
  gap: 10px;
  align-items: center;
}

.event-time {
  color: #666;
  font-size: 0.8rem;
}

.event-type {
  font-size: 0.8rem;
  padding: 3px 6px;
  border-radius: 4px;
  text-align: center;
}

.event-type.login {
  background-color: rgba(0, 128, 0, 0.1);
  color: green;
}

.event-type.predict {
  background-color: rgba(195, 255, 0, 0.2);
  color: #2e2e34;
}

.event-type.view {
  background-color: rgba(0, 0, 255, 0.1);
  color: blue;
}

.event-type.logout {
  background-color: rgba(255, 0, 0, 0.1);
  color: red;
}

.event-desc {
  font-size: 0.9rem;
  color: #333;
}

.api-usage {
  margin-top: 10px;
}

.api-endpoint {
  margin-bottom: 10px;
}

.endpoint-name {
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: #2e2e34;
}

.endpoint-bar {
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background-color: #c3ff00;
  border-radius: 10px;
  transition: width 0.5s ease;
}

.bar-label {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  color: #2e2e34;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-container {
    grid-template-columns: 1fr;
  }
}
</style>