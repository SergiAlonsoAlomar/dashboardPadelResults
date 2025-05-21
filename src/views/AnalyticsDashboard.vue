<template>
  <ion-page class="page">
    <ion-header>
      <ion-toolbar>
        <ion-title>Analíticas PadelResults</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="dashboard-content">
      <div class="content-wrapper">
        <ion-segment v-model="viewMode" @ionChange="changeView" class="view-mode-selector">
          <ion-segment-button value="business">
            <ion-label>Negocio</ion-label>
          </ion-segment-button>
          <ion-segment-button value="technical">
            <ion-label>Técnico</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Tarjeta de Progreso -->
        <div class="progress-card">
          <h3>Objetivo: 1 Millón de Usuarios</h3>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (503738 / 1000000) * 100 + '%' }">
              <span class="progress-label">{{ Math.round((503738 / 1000000) * 100) }}%</span>
            </div>
          </div>
          <p class="progress-note">Registrados: 503,738 | Faltan: 496,262</p>
        </div>

        <!-- Panel de Negocio -->
        <div v-if="viewMode === 'business'" class="dashboard-grid">
          <!-- Fila superior: 3 gráficos -->
          <div class="chart-row top-row">
            <div class="chart-card business-chart">
              <h3>Crecimiento de Usuarios</h3>
              <canvas ref="userGrowthChart"></canvas>
            </div>
            <div class="chart-card business-chart">
              <h3>Uso de Funcionalidades</h3>
              <div ref="featureUsageChart"></div>
            </div>
            <div class="chart-card business-chart">
              <h3>Retención de Usuarios</h3>
              <div ref="retentionChart" class="echart-container" :class="{ 'echart-container-loaded': chartLoaded }"></div>
            </div>
          </div>

          <!-- Fila inferior: 2 gráficos -->
          <div class="chart-row bottom-row">
            <div class="chart-card business-chart">
              <h3>Distribución de Dispositivos</h3>
              <canvas ref="deviceChart"></canvas>
            </div>
            <div class="chart-card business-chart">
              <h3>Eventos en Tiempo Real</h3>
              <div class="real-time-events">
                <div v-for="(event, index) in realTimeEvents" :key="index" class="event-item">
                  <span class="event-time">{{ event.time }}</span>
                  <span class="event-type" :class="event.type">{{ getEventTypeTranslation(event.type) }}</span>
                  <span class="event-desc">{{ event.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Técnico -->
        <div v-if="viewMode === 'technical'" class="dashboard-grid">
          <!-- Fila superior: 3 gráficos -->
          <div class="chart-row top-row">
            <div class="chart-card technical-chart">
              <h3>Rendimiento de la App</h3>
              <div ref="performanceChart"></div>
            </div>
            <div class="chart-card technical-chart">
              <h3>Seguimiento de Errores</h3>
              <div ref="errorChart" class="echart-container"></div>
            </div>
            <div class="chart-card technical-chart">
              <h3>Problemas de UI</h3>
              <div class="ui-issues">
                <div v-for="(issue, index) in uiIssues" :key="index" class="issue-item">
                  <span class="issue-component">{{ issue.component }}</span>
                  <span class="issue-priority" :class="'priority-' + issue.priority.toLowerCase()">
                    {{ issue.priority }}
                  </span>
                  <span class="issue-desc">{{ issue.issue }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Fila inferior: 2 gráficos -->
          <div class="chart-row bottom-row">
            <div class="chart-card technical-chart">
              <h3>Uso de API</h3>
              <div class="api-usage">
                <div class="api-endpoint" v-for="(endpoint, index) in apiEndpoints" :key="index">
                  <div class="endpoint-name">{{ endpoint.name }}</div>
                  <div class="endpoint-bar">
                    <div class="bar-fill" :style="{ width: endpoint.usage + '%' }"></div>
                    <span class="bar-label">{{ endpoint.usage }}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="chart-card technical-chart">
              <h3>Duración de Sesión</h3>
              <div ref="sessionChart"></div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSegment, IonSegmentButton, IonLabel
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
    const chartLoaded = ref(false);
    
    // Referencias a gráficos
    const userGrowthChart = ref<HTMLCanvasElement | null>(null);
    const featureUsageChart = ref<HTMLElement | null>(null);
    const retentionChart = ref<HTMLElement | null>(null);
    const deviceChart = ref<HTMLCanvasElement | null>(null);
    const performanceChart = ref<HTMLElement | null>(null);
    const errorChart = ref<HTMLElement | null>(null);
    const sessionChart = ref<HTMLElement | null>(null);
    
    // Datos reales
    const realTimeEvents = ref([
      { time: '10:30', type: 'login', description: 'Usuario inició sesión' },
      { time: '10:31', type: 'predict', description: 'Predicción realizada' },
      { time: '10:33', type: 'view', description: 'Torneo visualizado' },
      { time: '10:35', type: 'logout', description: 'Usuario cerró sesión' }
    ]);
    
    const apiEndpoints = ref([
      { name: '/api/torneos', usage: 65 },
      { name: '/api/noticias', usage: 50 },
      { name: '/api/predicciones', usage: 35 },
      { name: '/api/jugadores', usage: 25 }
    ]);
    
    const uiIssues = ref([
      { component: 'Cabecera', issue: 'Tipografía inconsistente', priority: 'Alta' },
      { component: 'Página Torneos', issue: 'Espaciado irregular', priority: 'Media' },
      { component: 'Pie de página', issue: 'Colores no coinciden', priority: 'Baja' }
    ]);

    // Traducción de tipos de eventos
    const getEventTypeTranslation = (type: string) => {
      const translations: Record<string, string> = {
        'login': 'Inicio',
        'predict': 'Predicción',
        'view': 'Visualización',
        'logout': 'Cierre'
      };
      return translations[type] || type;
    };

    // Configuración para Gráfico de Retención
    const retentionChartOptions = {
      tooltip: { 
        trigger: 'axis',
        confine: true,
        formatter: '{b}<br/>{a0}: {c0}%<br/>{a1}: {c1}%<br/>{a2}: {c2}%'
      },
      legend: { 
        data: ['Día 1', 'Día 7', 'Día 30'],
        bottom: 0,
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 10
        }
      },
      grid: { 
        top: '15%',
        left: '3%',
        right: '4%',
        bottom: '20%',
        containLabel: true 
      },
      xAxis: {
        type: 'category',
        data: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        axisLabel: {
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { 
          formatter: '{value}%',
          fontSize: 10
        }
      },
      series: [
        {
          name: 'Día 1',
          type: 'line',
          data: [100, 100, 100, 100, 100, 100],
          lineStyle: { color: '#4CAF50', width: 2 },
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: '#4CAF50' }
        },
        {
          name: 'Día 7',
          type: 'line',
          data: [60, 65, 62, 68, 70, 65],
          lineStyle: { color: '#2196F3', width: 2 },
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: '#2196F3' }
        },
        {
          name: 'Día 30',
          type: 'line',
          data: [30, 30, 30, 30, 30, 30],
          lineStyle: { color: '#9E9E9E', width: 2 },
          symbol: 'circle',
          symbolSize: 5,
          itemStyle: { color: '#9E9E9E' }
        }
      ]
    };

    // Configuración para Gráfico de Errores
    const errorChartOptions = {
      backgroundColor: 'transparent',
      tooltip: { 
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        confine: true
      },
      legend: { 
        orient: 'vertical',
        right: 10,
        top: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: {
          fontSize: 10,
          color: '#333'
        }
      },
      series: [{
        name: 'Fuentes de Error',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['45%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: {
          show: true,
          fontSize: 10,
          color: '#333',
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: true,
          length: 5,
          length2: 10,
          lineStyle: {
            color: '#999'
          }
        },
        data: [
          { value: 45, name: 'Mapa', itemStyle: { color: '#FF6384' } },
          { value: 25, name: 'API', itemStyle: { color: '#36A2EB' } },
          { value: 15, name: 'Autenticación', itemStyle: { color: '#FFCE56' } },
          { value: 10, name: 'Interfaz', itemStyle: { color: '#4BC0C0' } },
          { value: 5, name: 'Otros', itemStyle: { color: '#9966FF' } }
        ]
      }]
    };

    let retentionChartInstance: echarts.ECharts | null = null;
    let errorChartInstance: echarts.ECharts | null = null;

    const simulateRealTimeEvents = () => {
      const eventTypes = ['login', 'predict', 'view', 'logout'];
      const descriptions = [
        'Usuario inició sesión',
        'Predicción en torneo',
        'Torneo visualizado',
        'Noticias vistas',
        'Estadísticas de jugador',
        'Usuario cerró sesión'
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
    
    const initCharts = async () => {
      await nextTick();
      
      // Gráfico 1: Crecimiento de usuarios (ChartJS)
      if (userGrowthChart.value) {
        new Chart(userGrowthChart.value, {
          type: 'line',
          data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
              label: 'Usuarios Registrados',
              data: [320000, 380000, 430000, 470000, 503738, 550000],
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: false }
            }
          }
        });
      }
      
      // Gráfico 2: Uso de funcionalidades (ApexCharts)
      if (featureUsageChart.value) {
        const chart = new ApexCharts(featureUsageChart.value, {
          series: [{
            name: 'Uso',
            data: [60, 45, 30, 15]
          }],
          chart: {
            type: 'bar',
            height: '100%',
            background: 'transparent'
          },
          colors: ['#4CAF50'],
          plotOptions: {
            bar: {
              borderRadius: 4,
              horizontal: true,
            }
          },
          dataLabels: { enabled: false },
          xaxis: {
            categories: ['Torneos', 'Noticias', 'Predicciones', 'Otros']
          },
          tooltip: {
            y: {
              formatter: function(val: number) {
                return val + "%";
              }
            }
          }
        });
        chart.render();
      }
      
      // Gráfico 3: Retención de usuarios (ECharts)
      if (retentionChart.value) {
        retentionChartInstance = echarts.init(retentionChart.value);
        retentionChartInstance.setOption(retentionChartOptions);
        
        setTimeout(() => {
          retentionChartInstance?.resize();
          retentionChartInstance?.setOption(retentionChartOptions, true);
          chartLoaded.value = true;
        }, 100);
      }
      
      // Gráfico 4: Dispositivos (ChartJS)
      if (deviceChart.value) {
        new Chart(deviceChart.value, {
          type: 'doughnut',
          data: {
            labels: ['Android', 'iOS', 'Web'],
            datasets: [{
              data: [55, 35, 10],
              backgroundColor: ['#4CAF50', '#2196F3', '#9E9E9E'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
              legend: { 
                position: 'bottom',
                labels: {
                  font: {
                    size: 10
                  }
                }
              } 
            }
          }
        });
      }
      
      // Gráfico 5: Rendimiento (ApexCharts)
      if (performanceChart.value) {
        const chart = new ApexCharts(performanceChart.value, {
          series: [{
            name: 'Tiempo (ms)',
            data: [800, 750, 900, 850, 950, 700]
          }],
          chart: {
            type: 'radar',
            height: '100%',
            background: 'transparent'
          },
          colors: ['#2196F3'],
          xaxis: {
            categories: ['Inicio', 'Torneos', 'Predicciones', 'Noticias', 'Ranking', 'Perfil']
          },
          yaxis: { show: false },
          tooltip: {
            y: {
              formatter: function(val: number) {
                return val + "ms";
              }
            }
          }
        });
        chart.render();
      }
      
      // Gráfico 6: Errores (ECharts)
      if (errorChart.value) {
        errorChartInstance = echarts.init(errorChart.value);
        errorChartInstance.setOption(errorChartOptions);
        
        setTimeout(() => {
          errorChartInstance?.resize();
          errorChartInstance?.setOption(errorChartOptions, true);
        }, 150);
      }
      
      // Gráfico 7: Duración de sesión (ApexCharts)
      if (sessionChart.value) {
        const chart = new ApexCharts(sessionChart.value, {
          series: [45, 30, 15, 7, 3],
          chart: { 
            type: 'pie', 
            height: '80%',
            background: 'transparent',
            width: '100%'
          },
          labels: ['<1 min', '1-2 min', '2-5 min', '5-10 min', '>10 min'],
          colors: ['#2196F3', '#4CAF50', '#FFC107', '#FF9800', '#9E9E9E'],
          legend: {
            position: 'right',
            horizontalAlign: 'center',
            fontSize: '10px',
            fontFamily: 'Roboto, sans-serif',
            markers: {
              width: 8,
              height: 8,
              radius: 4
            },
            itemMargin: {
              horizontal: 0,
              vertical: 2
            },
            formatter: function(seriesName: string, opts: any) {
              return `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}%`;
            }
          },
          dataLabels: {
            enabled: false
          },
          plotOptions: {
            pie: {
              donut: {
                size: '65%',
                labels: {
                  show: false
                }
              }
            }
          },
          tooltip: {
            y: {
              formatter: function(val: number) {
                return val + "%";
              }
            }
          },
          responsive: [{
            breakpoint: 768,
            options: {
              legend: {
                position: 'bottom'
              }
            }
          }]
        });
        chart.render();
      }
    };

    const handleResize = () => {
      if (retentionChartInstance) {
        retentionChartInstance.resize();
        retentionChartInstance.setOption(retentionChartOptions, true);
      }
      if (errorChartInstance) {
        errorChartInstance.resize();
        errorChartInstance.setOption(errorChartOptions, true);
      }
    };
    
    onMounted(() => {
      initCharts();
      simulateRealTimeEvents();
      window.addEventListener('resize', handleResize);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
      if (retentionChartInstance) retentionChartInstance.dispose();
      if (errorChartInstance) errorChartInstance.dispose();
    });
    
    const changeView = () => {
      setTimeout(() => {
        initCharts();
        handleResize();
      }, 50);
    };
    
    return {
      viewMode,
      chartLoaded,
      userGrowthChart,
      featureUsageChart,
      retentionChart,
      deviceChart,
      performanceChart,
      errorChart,
      sessionChart,
      realTimeEvents,
      apiEndpoints,
      uiIssues,
      getEventTypeTranslation,
      changeView
    };
  }
});
</script>

<style scoped>
/* Reset de estilos conflictivos */
ion-content {
  --overflow: hidden;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.dashboard-content {
  --background: #f8f9fa;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  overflow: hidden;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  gap: 8px;
}

.view-mode-selector {
  margin-bottom: 8px;
  max-width: 380px;
  margin-left: auto;
  margin-right: auto;
  flex-shrink: 0;
}

.progress-card {
  background: white;
  border-radius: 8px;
  padding: 8px;
  flex-shrink: 0;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.progress-bar {
  height: 16px;
  background: #f0f0f0;
  border-radius: 9px;
  margin: 6px 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  transition: width 0.5s;
}

.progress-label {
  color: white;
  font-weight: bold;
  margin-right: 4px;
  font-size: 0.65rem;
}

.progress-note {
  color: #666;
  font-size: 0.65rem;
  margin-top: 4px;
}

.dashboard-grid {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 8px;
  overflow: hidden;
}

.chart-row {
  display: flex;
  flex: 1;
  gap: 8px;
  min-height: 0;
}

.top-row {
  flex: 1.5;
}

.bottom-row {
  flex: 1;
}

.chart-card {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.business-chart {
  border-left: 3px solid #4CAF50;
}

.technical-chart {
  border-left: 3px solid #2196F3;
}

.chart-card h3 {
  color: #2e2e34;
  margin: 0 0 6px 0;
  font-size: 0.85rem;
  font-family: 'Roboto', sans-serif;
  flex-shrink: 0;
}

.echart-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  background-color: transparent !important;
}

canvas, .apexcharts-canvas, .echarts {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  background-color: transparent !important;
}

.real-time-events, .ui-issues, .api-usage {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  font-size: 0.75rem;
  padding: 2px;
}

.event-item, .issue-item {
  padding: 4px 0;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 40px 60px 1fr;
  gap: 4px;
  align-items: center;
  font-size: 0.7rem;
}

.event-time, .issue-component {
  color: #666;
}

.event-type, .issue-priority {
  font-size: 0.6rem;
  padding: 2px 4px;
  border-radius: 3px;
  text-align: center;
}

.event-type.login {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.event-type.predict {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.event-type.view {
  background-color: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.event-type.logout {
  background-color: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.priority-alta {
  background-color: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.priority-media {
  background-color: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.priority-baja {
  background-color: rgba(158, 158, 158, 0.1);
  color: #9E9E9E;
}

.api-usage {
  margin-top: 4px;
}

.api-endpoint {
  margin-bottom: 4px;
}

.endpoint-name {
  font-size: 0.7rem;
  margin-bottom: 2px;
}

.endpoint-bar {
  height: 10px;
  background-color: #eee;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 6px;
}

.business-chart .bar-fill {
  background-color: #4CAF50;
}

.technical-chart .bar-fill {
  background-color: #2196F3;
}

.bar-label {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.6rem;
  color: #2e2e34;
}

/* Estilos específicos para gráficos */
.technical-chart .apexcharts-legend {
  right: 4px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 40% !important;
  max-height: 90% !important;
  overflow-y: auto !important;
  padding: 4px !important;
  background: rgba(255, 255, 255, 0.7) !important;
  border-radius: 5px !important;
}

.technical-chart .apexcharts-legend-series {
  display: flex !important;
  align-items: center !important;
  margin: 2px 0 !important;
  padding: 2px 4px !important;
}

.technical-chart .apexcharts-legend-marker {
  margin-right: 4px !important;
  width: 8px !important;
  height: 8px !important;
}

.technical-chart .apexcharts-legend-text {
  font-size: 0.65rem !important;
  color: #333 !important;
}

/* Responsive */
@media (max-width: 1200px) {
  .chart-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .chart-card {
    min-height: 180px;
  }
  
  .echart-container {
    min-height: 160px;
  }
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 8px;
  }
  
  .technical-chart .apexcharts-legend {
    position: relative !important;
    width: 100% !important;
    top: auto !important;
    right: auto !important;
    transform: none !important;
    margin-top: 8px !important;
  }
  
  .chart-card h3 {
    font-size: 0.8rem;
  }
  
  .event-item, .issue-item {
    font-size: 0.65rem;
    grid-template-columns: 60px 80px 1fr;
  }
}
</style>