/* ═══════════════════════════════════════════════════════════════
   CHARTS VISUALIZATION — SUKSAI v3 (Pastel & Animated)
   Enhanced with Pastel Colors, Gradients, and Smooth Animations
   ═══════════════════════════════════════════════════════════════ */

const chartInstances = {
  deptBar: null, riskPie: null, ageBar: null,
  vaccinePie: null, genderPie: null, scoreBar: null, trendLine: null
};

// ── Pastel Color Palette ────────────────────────────────────────
const C = {
  // Soft Pastel Colors
  pastelMint:    '#A8D8D8',    // Soft mint
  pastelCoral:   '#FFB3BA',    // Soft coral/pink
  pastelPeach:   '#FFCCCB',    // Soft peach
  pastelYellow:  '#FFFFCC',    // Soft yellow
  pastelLavender:'#E6D7F0',    // Soft lavender
  pastelSky:     '#B3E5FC',    // Soft sky blue
  pastelGreen:   '#C8E6C9',    // Soft green
  pastelOrange:  '#FFD9B3',    // Soft orange
  pastelRose:    '#F8BBD0',    // Soft rose
  pastelTeal:    '#B2DFDB',    // Soft teal
  
  // Primary Accents (slightly darker for contrast)
  primary:       '#3DAD8A',
  secondary:     '#8B5E3C',
  danger:        '#E74C3C',
  warning:       '#F39C12',
  
  // Neutral
  white:         '#ffffff',
  border:        'rgba(0,0,0,0.06)',
};

const PASTEL_PALETTE = [
  C.pastelMint, C.pastelCoral, C.pastelPeach, C.pastelYellow,
  C.pastelLavender, C.pastelSky, C.pastelGreen, C.pastelOrange,
  C.pastelRose, C.pastelTeal
];

// ── Shared tooltip style with Pastel ────────────────────────────
const isMobile = window.innerWidth < 768;

const TOOLTIP = {
  backgroundColor: 'rgba(255,255,255,0.95)',
  titleColor: '#333',
  bodyColor: '#555',
  padding: isMobile ? 10 : 14,
  cornerRadius: 12,
  titleFont: { size: isMobile ? 11 : 13, weight: '700' },
  bodyFont: { size: isMobile ? 10 : 12 },
  borderColor: C.primary,
  borderWidth: 2,
  displayColors: true,
  boxPadding: 6,
  boxBorderRadius: 8,
  shadowColor: 'rgba(0,0,0,0.1)',
  shadowBlur: 8,
};

/* ═══ LOAD CHART.JS ═══════════════════════════════════════════ */
function loadChartJS() {
  return new Promise((resolve, reject) => {
    if (typeof Chart !== 'undefined') { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* ═══ DESTROY ALL ═════════════════════════════════════════════ */
function destroyAllCharts() {
  document.querySelectorAll(".no-data-overlay").forEach(el => el.remove());
  document.querySelectorAll("#page-dashboard canvas").forEach(c => { c.style.display = ""; });
  Object.keys(chartInstances).forEach(k => {
    if (chartInstances[k]) { chartInstances[k].destroy(); chartInstances[k] = null; }
  });
}

/* ═══ GRADIENT HELPER ═════════════════════════════════════════ */
function makeGradient(ctx, color1, color2, height = 300) {
  const g = ctx.getContext('2d').createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, color1);
  g.addColorStop(1, color2);
  return g;
}

/* ═══ 1. DEPARTMENT BAR CHART (Horizontal) ════════════════════ */
function createDeptBarChart(data) {
  const ctx = document.getElementById('chart-dept-bar');
  if (!ctx) return;
  if (chartInstances.deptBar) { chartInstances.deptBar.destroy(); chartInstances.deptBar = null; }

  const deptCounts = {};
  data.forEach(d => {
    const dept = d['OPD'] || d['Examination Room'] || d['Examination_Room'] || 'Unknown';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  const sorted = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  if (sorted.length === 0) {
    renderNoData(ctx, 'ยังไม่มีข้อมูลห้องตรวจ');
    return;
  }

  // Pastel gradient by rank
  const bgColors = sorted.map((_, i) => {
    const ratio = i / Math.max(sorted.length - 1, 1);
    const colors = [C.pastelMint, C.pastelSky, C.pastelTeal, C.pastelGreen];
    return colors[i % colors.length];
  });

  chartInstances.deptBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(d => d[0]),
      datasets: [{
        label: 'จำนวนเคส',
        data: sorted.map(d => d[1]),
        backgroundColor: bgColors,
        borderColor: bgColors.map(c => c),
        borderWidth: 0,
        borderRadius: 12,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      animation: {
        duration: 1200,
        easing: 'easeOutElastic',
        delay: (ctx) => {
          let delay = 0;
          if (ctx.type === 'data') {
            delay = ctx.dataIndex * 50 + ctx.datasetIndex * 100;
          }
          return delay;
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: TOOLTIP
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.02)', drawBorder: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#999' },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#666' },
          border: { display: false },
        }
      }
    }
  });
}

/* ═══ 2. RISK LEVEL DOUGHNUT ══════════════════════════════════ */
function createRiskPieChart(data) {
  const ctx = document.getElementById('chart-risk-pie');
  if (!ctx) return;
  if (chartInstances.riskPie) { chartInstances.riskPie.destroy(); chartInstances.riskPie = null; }

  const counts = { High: 0, Moderate: 0, Low: 0 };
  data.forEach(d => {
    const s = parseInt(d['Evaluation Score'] || d['Evaluation_Score']) || 0;
    if (s >= 7) counts.High++;
    else if (s >= 4) counts.Moderate++;
    else counts.Low++;
  });

  const total = counts.High + counts.Moderate + counts.Low;

  chartInstances.riskPie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['High Risk (≥7)', 'Moderate Risk (4-6)', 'Low Risk (<4)'],
      datasets: [{
        data: [counts.High, counts.Moderate, counts.Low],
        backgroundColor: [C.pastelRose, C.pastelOrange, C.pastelGreen],
        borderColor: C.white,
        borderWidth: 4,
        hoverOffset: 16,
        hoverBorderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      animation: {
        animateRotate: true,
        duration: 1400,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: isMobile ? 10 : 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 12 }
        },
        tooltip: TOOLTIP
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw(chart) {
        const { ctx: c, chartArea: { left, top, right, bottom } } = chart;
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;
        c.save();
        c.font = `bold ${isMobile ? '20px' : '28px'} Inter, sans-serif`;
        c.fillStyle = '#333';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(total, cx, cy - 10);
        c.font = `${isMobile ? '11px' : '12px'} Inter, sans-serif`;
        c.fillStyle = '#999';
        c.fillText('เคสทั้งหมด', cx, cy + 14);
        c.restore();
      }
    }]
  });
}

/* ═══ 3. AGE RANGE BAR CHART ══════════════════════════════════ */
function createAgeBarChart(data) {
  const ctx = document.getElementById('chart-age-bar');
  if (!ctx) return;
  if (chartInstances.ageBar) { chartInstances.ageBar.destroy(); chartInstances.ageBar = null; }

  const ageOrder = ['0-1 ปี', '2-5 ปี', '6-12 ปี', '13-18 ปี', '19+ ปี'];
  const ageCounts = {};
  ageOrder.forEach(a => ageCounts[a] = 0);

  data.forEach(d => {
    const age = d['Age Range'] || d['Age_Range'] || d['ageRange'] || '';
    if (ageCounts.hasOwnProperty(age)) ageCounts[age]++;
  });

  const values = ageOrder.map(a => ageCounts[a]);
  const bgColors = [C.pastelSky, C.pastelMint, C.pastelTeal, C.pastelGreen, C.pastelLavender];

  chartInstances.ageBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ageOrder,
      datasets: [{
        label: 'จำนวนเคส',
        data: values,
        backgroundColor: bgColors,
        borderColor: bgColors,
        borderWidth: 0,
        borderRadius: 12,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutBounce',
        delay: (ctx) => {
          let delay = 0;
          if (ctx.type === 'data') {
            delay = ctx.dataIndex * 80;
          }
          return delay;
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: TOOLTIP
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.02)', drawBorder: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#999' },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#666' },
          border: { display: false },
        }
      }
    }
  });
}

/* ═══ 4. VACCINATION STATUS DOUGHNUT ══════════════════════════ */
function createVaccinePieChart(data) {
  const ctx = document.getElementById('chart-vaccine-pie');
  if (!ctx) return;
  if (chartInstances.vaccinePie) { chartInstances.vaccinePie.destroy(); chartInstances.vaccinePie = null; }

  const counts = {};
  data.forEach(d => {
    const v = d['Vaccination Status'] || d['Vaccination_Status'] || d['vaccination'] || 'Unknown';
    counts[v] = (counts[v] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  chartInstances.vaccinePie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: Object.values(counts),
        backgroundColor: PASTEL_PALETTE.slice(0, labels.length),
        borderColor: C.white,
        borderWidth: 4,
        hoverOffset: 16,
        hoverBorderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      animation: {
        animateRotate: true,
        duration: 1400,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: isMobile ? 9 : 11 }, padding: 12, usePointStyle: true, pointStyleWidth: 10 }
        },
        tooltip: TOOLTIP
      }
    }
  });
}

/* ═══ 5. GENDER DOUGHNUT ══════════════════════════════════════ */
function createGenderPieChart(data) {
  const ctx = document.getElementById('chart-gender-pie');
  if (!ctx) return;
  if (chartInstances.genderPie) { chartInstances.genderPie.destroy(); chartInstances.genderPie = null; }

  const counts = { 'ชาย / Male': 0, 'หญิง / Female': 0 };
  data.forEach(d => {
    const g = d['Gender'] || d['gender'] || '';
    if (g === 'M' || g === 'ชาย' || g === 'ชาย / Male') counts['ชาย / Male']++;
    else if (g === 'F' || g === 'หญิง' || g === 'หญิง / Female') counts['หญิง / Female']++;
  });

  const total = counts['ชาย / Male'] + counts['หญิง / Female'];

  chartInstances.genderPie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['ชาย / Male', 'หญิง / Female'],
      datasets: [{
        data: [counts['ชาย / Male'], counts['หญิง / Female']],
        backgroundColor: [C.pastelSky, C.pastelRose],
        borderColor: C.white,
        borderWidth: 4,
        hoverOffset: 16,
        hoverBorderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      animation: {
        animateRotate: true,
        duration: 1400,
        easing: 'easeInOutQuart'
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: isMobile ? 10 : 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 12 }
        },
        tooltip: TOOLTIP
      }
    },
    plugins: [{
      id: 'centerGender',
      afterDraw(chart) {
        const { ctx: c, chartArea: { left, top, right, bottom } } = chart;
        const cx = (left + right) / 2;
        const cy = (top + bottom) / 2;
        const mPct = total ? Math.round(counts['ชาย / Male'] / total * 100) : 0;
        c.save();
        c.font = `bold ${isMobile ? '18px' : '26px'} Inter, sans-serif`;
        c.fillStyle = '#333';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(mPct + '%', cx, cy - 10);
        c.font = `${isMobile ? '10px' : '11px'} Inter, sans-serif`;
        c.fillStyle = '#999';
        c.fillText('ชาย', cx, cy + 12);
        c.restore();
      }
    }]
  });
}

/* ═══ 6. SCORE DISTRIBUTION BAR ══════════════════════════════ */
function createScoreBarChart(data) {
  const ctx = document.getElementById('chart-score-bar');
  if (!ctx) return;
  if (chartInstances.scoreBar) { chartInstances.scoreBar.destroy(); chartInstances.scoreBar = null; }

  const bins = { '0-3\n(Low)': 0, '4-6\n(Moderate)': 0, '7-9\n(High)': 0, '10+\n(Very High)': 0 };
  data.forEach(d => {
    const s = parseInt(d['Evaluation Score'] || d['Evaluation_Score']) || 0;
    if (s <= 3)      bins['0-3\n(Low)']++;
    else if (s <= 6) bins['4-6\n(Moderate)']++;
    else if (s <= 9) bins['7-9\n(High)']++;
    else             bins['10+\n(Very High)']++;
  });

  chartInstances.scoreBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(bins),
      datasets: [{
        label: 'จำนวนเคส',
        data: Object.values(bins),
        backgroundColor: [C.pastelGreen, C.pastelOrange, C.pastelRose, C.pastelCoral],
        borderColor: [C.pastelGreen, C.pastelOrange, C.pastelRose, C.pastelCoral],
        borderWidth: 0,
        borderRadius: 12,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutElastic',
        delay: (ctx) => {
          let delay = 0;
          if (ctx.type === 'data') {
            delay = ctx.dataIndex * 100;
          }
          return delay;
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: TOOLTIP
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.02)', drawBorder: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#999' },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#666' },
          border: { display: false },
        }
      }
    }
  });
}

/* ═══ 7. TREND LINE CHART ════════════════════════════════════ */
function createTrendLineChart(data) {
  const ctx = document.getElementById('chart-trend-line');
  if (!ctx) return;
  if (chartInstances.trendLine) { chartInstances.trendLine.destroy(); chartInstances.trendLine = null; }

  const today = new Date();
  const last14 = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last14.push(d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }));
  }

  const dayCounts = {};
  last14.forEach(d => dayCounts[d] = 0);

  data.forEach(d => {
    const dateStr = d['Date'] || d['date'] || '';
    if (dateStr) {
      try {
        const date = new Date(dateStr);
        const key = date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
        if (dayCounts.hasOwnProperty(key)) dayCounts[key]++;
      } catch (e) {}
    }
  });

  const values = last14.map(d => dayCounts[d]);

  chartInstances.trendLine = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last14,
      datasets: [{
        label: 'Daily Cases',
        data: values,
        borderColor: C.primary,
        backgroundColor: 'rgba(168, 216, 216, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: C.pastelMint,
        pointBorderColor: C.white,
        pointBorderWidth: 3,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: C.primary,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1400,
        easing: 'easeInOutQuad'
      },
      plugins: {
        legend: { display: false },
        tooltip: TOOLTIP
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.02)', drawBorder: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#999' },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: isMobile ? 9 : 11 }, color: '#666' },
          border: { display: false },
        }
      }
    }
  });
}

/* ═══ RENDER ALL CHARTS ═══════════════════════════════════════ */
async function renderAllCharts(data) {
  try {
    await loadChartJS();
    destroyAllCharts();
    createDeptBarChart(data);
    createRiskPieChart(data);
    createAgeBarChart(data);
    createVaccinePieChart(data);
    createGenderPieChart(data);
    createScoreBarChart(data);
    createTrendLineChart(data);
  } catch (err) {
    console.error('Chart rendering error:', err);
  }
}

/* ═══ NO DATA STATE ═══════════════════════════════════════════ */
function renderNoData(ctx, message) {
  const overlay = document.createElement('div');
  overlay.className = 'no-data-overlay';
  overlay.style.cssText = `
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.9); border-radius: 12px;
    font-size: 13px; color: #999; text-align: center; z-index: 10;
  `;
  overlay.textContent = message;
  ctx.parentElement.style.position = 'relative';
  ctx.parentElement.appendChild(overlay);
  ctx.style.display = 'none';
}
