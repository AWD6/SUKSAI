/* ═══════════════════════════════════════════════════════════════
   GOOGLE SHEETS INTEGRATION — SUKSAI v2 (Fixed)
   conceived, designed, and Brought to Life by RN.Patipon Wiyo
   ═══════════════════════════════════════════════════════════════ */

// ── Google Sheets / Form URLs ──────────────────────────────────
const GOOGLE_SHEETS_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1RrwD7_cp0ZT7j1V41nw4nBbntLN1MrkjNIBfQ8C6sng/gviz/tq?tqx=out:csv';
const GOOGLE_SHEETS_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScnraPUj7wxNYg-FBeN_feSpkOJe8pcu6t09Af3fa7kuKSWeg/formResponse';

/* ═══ CSV PARSER — รองรับ quoted fields ═══════════════════════ */
function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuote = !inQuote; }
    } else if (ch === ',' && !inQuote) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

/* ═══ FETCH DATA FROM GOOGLE SHEETS (CSV) ═══════════════════════ */
async function fetchGoogleSheetsData() {
  try {
    const response = await fetch(GOOGLE_SHEETS_CSV_URL + '&t=' + Date.now());
    if (!response.ok) throw new Error('HTTP ' + response.status);

    const csvText = await response.text();
    const rows = csvText.trim().split('\n');
    if (rows.length < 2) {
      console.log('[SUKSAI] Google Sheets: no data rows yet');
      return [];
    }

    const rawHeaders = parseCSVLine(rows[0]);

    // กำจัด Timestamp ซ้ำ — เก็บแค่อันแรก
    const headerMap = [];
    rawHeaders.forEach((h, idx) => {
      if (h === 'Timestamp') {
        if (!headerMap.some(x => x.name === 'Timestamp')) headerMap.push({ rawIdx: idx, name: h });
      } else {
        headerMap.push({ rawIdx: idx, name: h });
      }
    });

    const data = rows.slice(1).filter(r => r.trim()).map(row => {
      const values = parseCSVLine(row);
      const obj = {};
      headerMap.forEach(({ rawIdx, name }) => {
        obj[name] = values[rawIdx] || '';
      });
      return obj;
    });

    console.log('[SUKSAI] Fetched', data.length, 'records. Headers:', headerMap.map(h => h.name).join(', '));
    return data;
  } catch (error) {
    console.warn('[SUKSAI] fetchGoogleSheetsData error:', error.message);
    return [];
  }
}

/* ═══ SEND DATA TO GOOGLE SHEETS (via Google Form) ═══════════════
   หมายเหตุ: entry IDs ต้องตรงกับ Google Form ของคุณ
   วิธีตรวจสอบ: เปิด Form → View form → Inspect → ดู name="entry.XXXXXXX"
   ════════════════════════════════════════════════════════════════ */
async function sendDataToGoogleSheets(assessmentData) {
  try {
    const formData = new FormData();

    formData.append('entry.1971806859', assessmentData.timestamp);       // Timestamp
    formData.append('entry.246925354',  assessmentData.dept);            // OPD
    formData.append('entry.270170765',  assessmentData.ageRange);        // Age Range
    formData.append('entry.1510200690', assessmentData.gender);          // Gender
    formData.append('entry.1163397659', assessmentData.vaccination);     // Vaccination Status
    formData.append('entry.747359522',  assessmentData.hasRedFlag);      // Red Flag
    formData.append('entry.744478924',  assessmentData.aiImpression);    // AI Impression
    formData.append('entry.1436041788', assessmentData.recommendation);  // Clinical Recommendation
    // Evaluation Score field is not in current form, using a dummy or ignoring for now
    // formData.append('entry.XXXXXX', String(assessmentData.score)); 


    await fetch(GOOGLE_SHEETS_FORM_URL, {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
    });

    console.log('[SUKSAI] Data sent to Google Sheets');
    return true;
  } catch (error) {
    console.error('[SUKSAI] sendDataToGoogleSheets error:', error);
    return false;
  }
}

/* ═══ PREPARE ASSESSMENT DATA ════════════════════════════════════ */
function prepareAssessmentDataForSheets(state) {
  const now = new Date();
  const timestamp = now.toLocaleString('th-TH', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  });

  const genderLabel = state.selectedGender === 'M' ? 'ชาย / Male'
                    : state.selectedGender === 'F' ? 'หญิง / Female'
                    : state.selectedGender || 'Unknown';

  const vaccineLabel = {
    none:    'ไม่เคย',
    '1dose': '1 เข็ม',
    '2dose': '2 เข็ม',
    unknown: 'ไม่ทราบ',
  }[state.selectedVaccination] || state.selectedVaccination || 'Unknown';

  const ageLabel = {
    '0-1':  '0-1 ปี',
    '2-5':  '2-5 ปี',
    '6-12': '6-12 ปี',
    '13-18':'13-18 ปี',
    '19+':  '19+ ปี',
  }[state.selectedAgeRange] || state.selectedAgeRange || 'Unknown';

  const score = state.totalScore || 0;
  const level = score >= 7 ? 'High' : score >= 4 ? 'Moderate' : 'Low';

  return {
    timestamp,
    dept:        state.selectedDept || 'Unknown',
    ageRange:    ageLabel,
    gender:      genderLabel,
    vaccination: vaccineLabel,
    score,
    level,
    hasRedFlag:  state.checkedRedFlags.size > 0 ? 'Yes' : 'No',
    aiImpression:   state.aiResult?.possibilities?.[0]?.label || 'Pending',
    recommendation: level === 'High'     ? 'Airborne Precautions + Notify MD'
                  : level === 'Moderate' ? 'Monitor closely + Consult MD'
                  : 'Continue monitoring',
  };
}

/* ═══ NORMALIZE ROW — รองรับ column name หลายรูปแบบ ═══════════ */
function normalizeRow(d) {
  return {
    Timestamp:   d['Timestamp']          || d['timestamp']          || '',
    OPD:         d['OPD']                || d['Examination Room']   || d['Examination_Room'] || d['dept'] || 'Unknown',
    AgeRange:    d['Age Range']          || d['Age_Range']          || d['ageRange']         || 'Unknown',
    Gender:      d['Gender']             || d['gender']             || 'Unknown',
    Vaccination: d['Vaccination Status'] || d['Vaccination_Status'] || d['vaccination']      || 'Unknown',
    Score:       parseInt(d['Evaluation Score'] || d['Evaluation_Score'] || d['score']) || 0,
    RedFlag:     d['Red Flag'] === 'Yes' || d['Red_Flag'] === 'Yes' || d['hasRedFlag'] === 'Yes',
    AIImpression:   d['AI Impression']   || d['AI_Impression']      || d['aiImpression']     || '',
    Recommendation: d['Clinical Recommendation'] || d['recommendation'] || '',
  };
}

/* ═══ DATE PARSER HELPER ════════════════════════════════════════ */
function parseDate(ts) {
  if (!ts) return null;
  
  // 1. ลองใช้ native Date parser ก่อน (รองรับ ISO และ M/D/YYYY ส่วนใหญ่)
  let d = new Date(ts);
  if (!isNaN(d.getTime())) {
    // ถ้าปีมากกว่า 2500 แสดงว่าเป็นปี พ.ศ. ให้แปลงเป็น ค.ศ.
    if (d.getFullYear() > 2500) {
      d.setFullYear(d.getFullYear() - 543);
    }
    return d;
  }

  // 2. Fallback สำหรับรูปแบบเฉพาะ เช่น "20/06/2569"
  const parts = ts.split(/[\/\s:-]/);
  if (parts.length >= 3) {
    // ตรวจสอบว่าส่วนไหนเป็นปี (ปกติจะอยู่ตำแหน่ง 0 หรือ 2)
    let day, month, year;
    
    if (parseInt(parts[2]) > 100) {
      // รูปแบบ D/M/YYYY หรือ M/D/YYYY
      let p0 = parseInt(parts[0]);
      let p1 = parseInt(parts[1]);
      let p2 = parseInt(parts[2]);
      
      // ถ้าปีเป็น พ.ศ. ( > 2500) มักจะมาในรูปแบบ D/M/BE
      if (p2 > 2500) {
        if (p0 > 12) { // แน่นอนว่าเป็น Day
          day = p0; month = p1 - 1; year = p2;
        } else if (p1 > 12) { // แน่นอนว่าเป็น Day
          month = p0 - 1; day = p1; year = p2;
        } else {
          // กรณีคลุมเครือ 1/2/2569 -> มักจะเป็น D/M/BE สำหรับคนไทย
          day = p0; month = p1 - 1; year = p2;
        }
      } else {
        // ถ้าปีเป็น ค.ศ. มักจะมาจาก Google Form Timestamp ซึ่งเป็น M/D/YYYY
        if (p0 > 12) {
          day = p0; month = p1 - 1; year = p2;
        } else if (p1 > 12) {
          month = p0 - 1; day = p1; year = p2;
        } else {
          month = p0 - 1; day = p1; year = p2;
        }
      }
    } else if (parseInt(parts[0]) > 100) {
      // รูปแบบ YYYY-MM-DD
      year = parseInt(parts[0]);
      month = parseInt(parts[1]) - 1;
      day = parseInt(parts[2]);
    }

    if (year) {
      if (year > 2500) year -= 543;
      return new Date(year, month, day);
    }
  }
  return null;
}

/* ═══ RENDER DASHBOARD FROM GOOGLE SHEETS DATA ═══════════════════ */
async function renderDashboardFromGoogleSheets() {
  let data = await fetchGoogleSheetsData();

  // Data only from Google Sheets (No localStorage fallback for accuracy)
  if (!data || data.length === 0) {
    renderEmptyDashboard();
    return;
  } else {
    data = data.map(normalizeRow);
  }

  // ── Month/Year Filter Logic ──
  const filterEl = document.getElementById('filter-month-year');
  if (filterEl) {
    const months = [...new Set(data.map(d => {
      const dt = parseDate(d.Timestamp);
      if (!dt) return null;
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    }).filter(x => x))].sort().reverse();

    const currentVal = filterEl.value;
    
    // สร้าง Options ใหม่
    let optionsHtml = '<option value="all">ทุกช่วงเวลา / All Time</option>';
    months.forEach(m => {
      const [y, mm] = m.split('-');
      // แปลงปี ค.ศ. เป็น พ.ศ. สำหรับแสดงผลใน dropdown ภาษาไทย
      const yearBE = parseInt(y) + 543;
      const dateObj = new Date(y, mm - 1);
      const monthName = dateObj.toLocaleString('th-TH', { month: 'long' });
      optionsHtml += `<option value="${m}">${monthName} ${yearBE}</option>`;
    });

    filterEl.innerHTML = optionsHtml;
    
    // พยายามรักษาค่าที่เลือกไว้ ถ้าไม่มีในรายการใหม่ให้กลับไปที่ 'all'
    if ([...filterEl.options].some(opt => opt.value === currentVal)) {
      filterEl.value = currentVal;
    } else {
      filterEl.value = 'all';
    }

    if (filterEl.value !== 'all') {
      data = data.filter(d => {
        const dt = parseDate(d.Timestamp);
        if (!dt) return false;
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}` === filterEl.value;
      });
    }
  }

  // KPI
  const total      = data.length;
  const highRisk   = data.filter(d => (d.Score || 0) >= 7).length;
  const withFlags  = data.filter(d => d.RedFlag === true || d.RedFlag === 'Yes').length;
  const uniqueDepts = new Set(data.map(d => d.OPD || 'Unknown')).size;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('kpi-total',    total);
  setEl('kpi-high',     highRisk);
  setEl('kpi-high-sub', (total ? Math.round(highRisk / total * 100) : 0) + '% of total');
  setEl('kpi-flags',    withFlags);
  setEl('kpi-depts',    uniqueDepts);

  // Recent list
  const recentEl = document.getElementById('recent-list');
  if (recentEl) {
    recentEl.innerHTML = data.slice(0, 50).map(d => {
      const score = d.Score || 0;
      const level = score >= 7 ? 'high' : score >= 4 ? 'moderate' : 'low';
      const badgeLabel = { high: 'High', moderate: 'Moderate', low: 'Low' }[level];
      const hasFlag = d.RedFlag === true || d.RedFlag === 'Yes';
      return `<div class="recent-item">
        <div>
          <div style="font-size:13px;font-weight:600">${d.OPD}</div>
          <div style="font-size:11px;color:var(--text-muted)">${d.Timestamp} · Score ${score} ${hasFlag ? '⚠️' : ''}</div>
        </div>
        <span class="ri-badge ${level}">${badgeLabel}</span>
      </div>`;
    }).join('');
  }

  // Charts
  if (typeof renderAllCharts === 'function') {
    const chartsData = data.map(d => ({
      'OPD':                d.OPD,
      'Age Range':          d.AgeRange,
      'Gender':             d.Gender,
      'Vaccination Status': d.Vaccination,
      'Evaluation Score':   String(d.Score),
      'Red Flag':           d.RedFlag === true ? 'Yes' : (d.RedFlag || 'No'),
    }));
    await renderAllCharts(chartsData);
  }

  console.log('[SUKSAI] Dashboard updated with', total, 'records');
}

/* ═══ EMPTY DASHBOARD STATE ════════════════════════════════════ */
function renderEmptyDashboard() {
  ['kpi-total','kpi-high','kpi-flags','kpi-depts'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '0';
  });
  const sub = document.getElementById('kpi-high-sub');
  if (sub) sub.textContent = '0% of total';

  const recentEl = document.getElementById('recent-list');
  if (recentEl) {
    recentEl.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:32px 16px">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:12px;opacity:.4"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <div style="font-size:14px;font-weight:600;margin-bottom:4px">ยังไม่มีข้อมูล</div>
      <div style="font-size:12px">ทำการประเมินแรกเพื่อดูสถิติที่นี่</div>
    </div>`;
  }
  if (typeof renderAllCharts === 'function') renderAllCharts([]);
}

/* ═══ AUTO-REFRESH ══════════════════════════════════════════════ */
let _dashboardRefreshTimer = null;

function startDashboardAutoRefresh(intervalSeconds) {
  intervalSeconds = intervalSeconds || 60;
  if (_dashboardRefreshTimer) clearInterval(_dashboardRefreshTimer);
  renderDashboardFromGoogleSheets();
  _dashboardRefreshTimer = setInterval(renderDashboardFromGoogleSheets, intervalSeconds * 1000);
  console.log('[SUKSAI] Dashboard auto-refresh every', intervalSeconds, 's');
}

/* ═══ INITIALIZE ════════════════════════════════════════════════ */
function initGoogleSheetsIntegration() {
  console.log('[SUKSAI] Google Sheets integration ready');
  // เริ่มการดึงข้อมูลแบบ Real-time (ทุก 30 วินาที)
  startDashboardAutoRefresh(30);
}

initGoogleSheetsIntegration();
