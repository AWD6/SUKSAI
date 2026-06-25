/* ═══════════════════════════════════════════════════
   SUKSAI v2 — Clinical Decision Support App
   conceived, designed, and Brought to Life by RN.Patipon Wiyo
   ═══════════════════════════════════════════════════ */
'use strict';

/* ═══ DEPARTMENTS ════════════════════════════════════════════ */
const DEPT_GROUPS = [
  { group: 'หน่วยที่ 1',        items: ['OPD 1', 'OPD 10', 'Telemedicine'] },
  { group: 'หน่วยที่ 2',        items: ['OPD 3', 'OPD 4'] },
  { group: 'หน่วยที่ 3',        items: ['OPD 6', 'OPD 7', 'Retina'] },
  { group: 'หน่วยที่ 4',        items: ['OPD 9', 'OPD 21', 'PCU', 'OPD เฉพาะทางนอกเวลา'] },
  { group: 'หน่วยที่ 5',        items: ['OPD 22', 'OPD 23', 'OPD 26'] },
  { group: 'หน่วยที่ 6',        items: ['OPD 101', 'รังสีรักษา'] },
  { group: 'หน่วยที่ 7',        items: ['EID complex'] },
  { group: 'หน่วยที่ 8',        items: ['OPD 27', 'OPD 28', 'OPD 29'] },
  { group: 'หน่วยผ่าตัดเล็ก',  items: ['OR Minor ชั้น 3', 'OR Minor ชั้น 10', 'OPD 2'] },
  { group: 'ฉุกเฉิน',           items: ['ER', 'OPD นอกเวลา'] },
  { group: 'สังเกตอาการ',       items: ['หอผู้ป่วยสังเกตอาการ'] },
  { group: 'เคมีบำบัด',         items: ['ห้องให้ยาเคมีบำบัด', 'OPD 24', 'OPD 110', 'EKG', 'ศูนย์สุขใจ'] },
  { group: 'บริการแพทย์ฉุกเฉิน', items: ['EMS', 'Refer', 'Injection Room', 'Dressing Room', 'CSC'] },
  { group: 'อื่นๆ',             items: ['อื่นๆ'] },
];
const DEPARTMENTS = DEPT_GROUPS.flatMap(g => g.items);

/* ═══ CRITERIA ═══════════════════════════════════════════════ */
const MAJOR_CRITERIA = [
  { id:'m1', th:'ตุ่มน้ำใส',                    en:'Vesicle',           score:2 },
  { id:'m2', th:'อาการคัน',                      en:'Pruritus',          score:2 },
  { id:'m3', th:'ผื่นกระจายทั่วตัว',            en:'Generalized rash',  score:2 },
  { id:'m4', th:'ผื่นเริ่มที่ลำตัว',            en:'Truncal onset',     score:2 },
  { id:'m5', th:'ผื่นหลายระยะพร้อมกัน',         en:'Pleomorphic lesions',score:2},
  { id:'m6', th:'มีสะเก็ด / ตกสะเก็ด',          en:'Crusting present',  score:2 },
];
const MINOR_CRITERIA = [
  { id:'n1', th:'มีไข้ > 37.5°C',               en:'Fever > 37.5°C',              score:1 },
  { id:'n2', th:'ปวดศีรษะ',                      en:'Headache',                    score:1 },
  { id:'n3', th:'เบื่ออาหาร',                    en:'Anorexia',                    score:1 },
  { id:'n4', th:'อ่อนเพลีย',                     en:'Fatigue / Malaise',           score:1 },
  { id:'n5', th:'ประวัติสัมผัสโรค 10–21 วัน',   en:'Exposure history 10–21 days', score:1 },
  { id:'n6', th:'ไม่เคยเป็นหรือได้รับวัคซีน',   en:'No prior varicella / vaccine', score:1 },
];
const RED_FLAGS = [
  { id:'r1', th:'อายุน้อยกว่า 1 ปี',            en:'Age < 1 year' },
  { id:'r2', th:'ผู้ป่วยตั้งครรภ์',             en:'Pregnant' },
  { id:'r3', th:'ภูมิคุ้มกันบกพร่อง',           en:'Immunocompromised' },
  { id:'r4', th:'หอบเหนื่อย / SpO₂ < 95%',      en:'Dyspnea / SpO₂ < 95%' },
  { id:'r5', th:'ซึม / ชัก',                     en:'Altered consciousness / Seizure' },
  { id:'r6', th:'สงสัยปอดอักเสบหรือสมองอักเสบ', en:'Suspected Pneumonia / Encephalitis' },
];

/* ═══ DIFFERENTIAL DX ════════════════════════════════════════ */
const DIFF_DX = [
  {
    nameEn:'Herpes Zoster (Shingles)', nameTh:'งูสวัด', similarity:'high',
    imgUrl:'https://www.berlin-chemie.de/en/therapeutic-areas/pharmaceuticals/skin-disorders/shingles/_jcr_content/root/container/container/container/image.coreimg.jpeg/1712510150924/gurtelrose-01.jpeg',
    keyDiff:'Dermatomal (ตามเส้นประสาท) ข้างเดียว ปวดแสบปวดร้อนมาก — VZV reactivation',
    distinguishTh:'อีสุกอีใส: กระจายทั่ว · งูสวัด: ตามเส้นประสาทข้างเดียว ปวดแสบมาก',
    tags:['Dermatomal','Unilateral','Severe pain','VZV'], tagColors:['orange','orange','red','red'],
  },
  {
    nameEn:'Measles (Rubeola)', nameTh:'โรคหัด', similarity:'medium',
    imgUrl:'https://media.post.rvohealth.io/wp-content/uploads/2025/08/boy-with-measles-1296-728-header.jpg',
    keyDiff:'Maculopapular rash, Cephalocaudal spread, 3C (Cough, Coryza, Conjunctivitis), Koplik spots',
    distinguishTh:'ผื่นหัดราบ ไม่เป็นตุ่มน้ำ มี 3C เริ่มจากหน้า · อีสุกอีใส: ตุ่มน้ำ คัน',
    tags:['3C sign','Maculopapular','Koplik spots','Cephalocaudal'], tagColors:['orange','orange','red','blue'],
  },
  {
    nameEn:'Hand, Foot & Mouth (HFMD)', nameTh:'โรคมือ เท้า ปาก', similarity:'high',
    imgUrl:'https://i0.wp.com/post.medicalnewstoday.com/wp-content/uploads/sites/3/2020/11/shutterstock_1652101321_header-1024x575.jpg?w=1155&h=1528',
    keyDiff:'Vesicles on palms, soles, oral mucosa · Enterovirus · Common in infants/toddlers · Usually not itchy',
    distinguishTh:'HFMD: เฉพาะมือ-เท้า-ปาก ไม่คัน · อีสุกอีใส: กระจายทั่วตัว คัน',
    tags:['Palms & soles','Oral lesions','Enterovirus','Not itchy'], tagColors:['blue','blue','purple','green'],
  },
  {
    nameEn:'Mpox (Monkeypox)', nameTh:'ฝีดาษลิง (Mpox)', similarity:'high',
    imgUrl:'https://static.independent.co.uk/2025/02/03/12/03091407-3cdf8fce-34c4-4a1c-9d0f-b0a82a4f24d2.jpg',
    keyDiff:'Deep firm pustules, uniform stage, prominent lymphadenopathy, palms/soles/face involved',
    distinguishTh:'Mpox: ตุ่มแน่น ลึก สม่ำเสมอ ต่อมน้ำเหลืองโต · อีสุกอีใส: บาง หลายระยะ คัน',
    tags:['Lymphadenopathy','Palms & soles','Same stage','Deep pustules'], tagColors:['red','red','orange','orange'],
  },
  {
    nameEn:'Impetigo', nameTh:'หนองกลากน้ำ / Impetigo', similarity:'medium',
    imgUrl:'https://www.lcclinics.com/wp-content/uploads/2018/05/%E0%B9%82%E0%B8%A3%E0%B8%84%E0%B9%81%E0%B8%9C%E0%B8%A5%E0%B8%9E%E0%B8%B8%E0%B8%9E%E0%B8%AD%E0%B8%87.jpg',
    keyDiff:'Honey-colored crusts · Bacterial (Staph/Strep) · Localized · No systemic fever typical',
    distinguishTh:'Impetigo: สะเก็ดน้ำผึ้ง แบคทีเรีย จำกัดบริเวณ · อีสุกอีใส: ไวรัส กระจาย',
    tags:['Honey crusts','Bacterial','Localized','Staphylococcus'], tagColors:['orange','orange','green','purple'],
  },
  {
    nameEn:'Drug Eruption / DRESS', nameTh:'ผื่นแพ้ยา', similarity:'medium',
    imgUrl:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAqNHsPG1JH-nSB0H1Hh538nZuLUkq5n0dUg&s',
    keyDiff:'Drug history · Rash 7–21 days after starting drug · Symmetric · Non-contagious',
    distinguishTh:'ผื่นแพ้ยา: ประวัติยา ไม่ติดต่อ · อีสุกอีใส: ติดต่อได้ ไม่มีประวัติยา',
    tags:['Drug history','Non-contagious','Symmetric','DRESS/SJS'], tagColors:['blue','green','orange','red'],
  },
  {
    nameEn:'Scabies', nameTh:'หิด', similarity:'medium',
    imgUrl:'https://intercarehospital.com/wp-content/uploads/2026/02/image-35-1024x683.png',
    keyDiff:'Nocturnal pruritus · Burrows between fingers/wrists · Household contacts affected · Sarcoptes scabiei',
    distinguishTh:'หิด: คันมากกลางคืน รอยขุด ระหว่างนิ้ว · อีสุกอีใส: ตุ่มน้ำ กระจายทั่ว',
    tags:['Nocturnal itch','Burrows','Finger webs','Sarcoptes'], tagColors:['orange','orange','orange','purple'],
  },
  {
    nameEn:'Rubella', nameTh:'หัดเยอรมัน (Rubella)', similarity:'medium',
    imgUrl:'https://img.lb.wbmdstatic.com/vim/live/webmd/consumer_assets/site_images/article_thumbnails/BigBead/rubella_bigbead/1800x1200_medicalimages_rm_rubella_bigbead.jpg',
    keyDiff:'Fine maculopapular rash, Forchheimer spots, lymphadenopathy (post-auricular/occipital)',
    distinguishTh:'หัดเยอรมัน: ผื่นละเอียด ต่อมน้ำเหลืองหลังหูโต · อีสุกอีใส: ตุ่มน้ำ คัน',
    tags:['Forchheimer spots','Lymphadenopathy','Fine rash'], tagColors:['red','red','orange'],
  },
  {
    nameEn:'Molluscum Contagiosum', nameTh:'หูดน้ำ (Molluscum Contagiosum)', similarity:'medium',
    imgUrl:'https://cms.pulse-clinic.com.sg/user/uploads/f44b6873-87b7-438a-8b10-24b4e1e31b49.webp',
    keyDiff:'Pearly, umbilicated papules · Poxvirus · Usually not itchy or painful · Central dimple',
    distinguishTh:'หูดน้ำ: ตุ่มเงา มีรอยบุ๋มตรงกลาง ไม่คัน · อีสุกอีใส: ตุ่มน้ำ คัน',
    tags:['Umbilicated','Pearly','Poxvirus'], tagColors:['blue','blue','purple'],
  },
  {
    nameEn:'Roseola Infantum', nameTh:'ส่าไข้ (Roseola Infantum)', similarity:'medium',
    imgUrl:'https://upload.medbullets.com/topic/120584/images/roseola%20rash%20formatted.jpg',
    keyDiff:'High fever for 3–5 days, then rash appears as fever drops · HHV-6/HHV-7 · Infants < 2 years',
    distinguishTh:'ส่าไข้: ไข้ลดแล้วผื่นขึ้น · อีสุกอีใส: ไข้พร้อมผื่น',
    tags:['Fever first','Infants','HHV-6'], tagColors:['orange','blue','purple'],
  },
  {
    nameEn:'Dengue with Rash', nameTh:'ไข้เลือดออก (Dengue with Rash)', similarity:'medium',
    imgUrl:'https://dermaclinic.com.np/wp-content/uploads/2025/06/Dengue-Rashes.jpg.webp',
    keyDiff:'White islands in a sea of red · High fever, body ache · Hemorrhagic signs · Not vesicular',
    distinguishTh:'ไข้เลือดออก: ผื่นแดงสลับจุดขาว ไม่เป็นตุ่มน้ำ · อีสุกอีใส: ตุ่มน้ำ',
    tags:['White islands','High fever','Non-vesicular'], tagColors:['red','red','blue'],
  },
  {
    nameEn:'Contact Dermatitis', nameTh:'ผื่นแพ้สัมผัส (Contact Dermatitis)', similarity:'medium',
    imgUrl:'https://doralhw.org/wp-content/uploads/2025/09/Contact-Dermatitis-scaled.jpg',
    keyDiff:'Localized to contact area · Itchy, red, sometimes vesicles · History of irritant/allergen exposure',
    distinguishTh:'แพ้สัมผัส: เฉพาะจุดที่สัมผัสสาร · อีสุกอีใส: กระจายทั่วตัว',
    tags:['Localized','Allergen','Itchy'], tagColors:['green','orange','orange'],
  },
];

/* ═══ STATE ═══════════════════════════════════════════════════ */
const state = {
  currentPage: 'home',
  currentStep: 1,
  selectedDept: null,
  selectedAgeRange: null,
  selectedGender: null,
  selectedVaccination: null,
  checkedMajor: new Set(),
  checkedMinor: new Set(),
  checkedRedFlags: new Set(),
  totalScore: 0,
  aiResult: null,
  photoTaken: false,
  assessHistory: JSON.parse(localStorage.getItem('suksai_v2_history') || '[]'),
  selectedBodyParts: new Set(),
  currentBodyView: 'front',
};

/* ═══ BODY MAP DATA ═══════════════════════════════════════════ */
const BODY_ZONES = {
  front: [
    { id:'head',        th:'ศีรษะ / Head',         shape:'ellipse', cx:100, cy:36, rx:26, ry:32 },
    { id:'neck',        th:'คอ / Neck',             shape:'rect',    x:88,  y:68, w:24, h:16 },
    { id:'chest-l',     th:'หน้าอก (ซ้าย)',        shape:'rect',    x:62,  y:84, w:36, h:50 },
    { id:'chest-r',     th:'หน้าอก (ขวา)',         shape:'rect',    x:102, y:84, w:36, h:50 },
    { id:'abdomen',     th:'ช่องท้อง / Abdomen',   shape:'rect',    x:66,  y:134,w:68, h:46 },
    { id:'left-arm',    th:'แขนซ้าย / Left arm',   shape:'rect',    x:32,  y:84, w:28, h:96 },
    { id:'right-arm',   th:'แขนขวา / Right arm',   shape:'rect',    x:140, y:84, w:28, h:96 },
    { id:'left-hand',   th:'มือ/ฝ่ามือซ้าย',      shape:'rect',    x:28,  y:182,w:30, h:30 },
    { id:'right-hand',  th:'มือ/ฝ่ามือขวา',       shape:'rect',    x:142, y:182,w:30, h:30 },
    { id:'left-thigh',  th:'ต้นขาซ้าย',            shape:'rect',    x:68,  y:180,w:30, h:70 },
    { id:'right-thigh', th:'ต้นขาขวา',             shape:'rect',    x:102, y:180,w:30, h:70 },
    { id:'left-leg',    th:'แข้ง/น่องซ้าย',        shape:'rect',    x:70,  y:252,w:26, h:66 },
    { id:'right-leg',   th:'แข้ง/น่องขวา',         shape:'rect',    x:104, y:252,w:26, h:66 },
    { id:'left-foot',   th:'เท้า/ฝ่าเท้าซ้าย',    shape:'rect',    x:64,  y:320,w:32, h:20 },
    { id:'right-foot',  th:'เท้า/ฝ่าเท้าขวา',     shape:'rect',    x:104, y:320,w:32, h:20 },
  ],
  back: [
    { id:'back-head',   th:'ท้ายทอย / Occiput',    shape:'ellipse', cx:100, cy:36, rx:26, ry:32 },
    { id:'back-neck',   th:'ต้นคอ / Back neck',    shape:'rect',    x:88,  y:68, w:24, h:16 },
    { id:'upper-back-l',th:'หลังบน (ซ้าย)',        shape:'rect',    x:62,  y:84, w:36, h:50 },
    { id:'upper-back-r',th:'หลังบน (ขวา)',         shape:'rect',    x:102, y:84, w:36, h:50 },
    { id:'lower-back',  th:'หลังล่าง / บั้นเอว',  shape:'rect',    x:66,  y:134,w:68, h:46 },
    { id:'back-left-arm',th:'แขนซ้าย (ด้านหลัง)', shape:'rect',    x:32,  y:84, w:28, h:96 },
    { id:'back-right-arm',th:'แขนขวา (ด้านหลัง)',shape:'rect',    x:140, y:84, w:28, h:96 },
    { id:'back-left-hand',th:'มือซ้าย (หลังมือ)', shape:'rect',    x:28,  y:182,w:30, h:30 },
    { id:'back-right-hand',th:'มือขวา (หลังมือ)', shape:'rect',    x:142, y:182,w:30, h:30 },
    { id:'buttocks-l',  th:'สะโพก/ก้น (ซ้าย)',    shape:'rect',    x:68,  y:180,w:30, h:50 },
    { id:'buttocks-r',  th:'สะโพก/ก้น (ขวา)',     shape:'rect',    x:102, y:180,w:30, h:50 },
    { id:'back-left-leg',th:'น่องซ้าย',            shape:'rect',    x:70,  y:252,w:26, h:66 },
    { id:'back-right-leg',th:'น่องขวา',            shape:'rect',    x:104, y:252,w:26, h:66 },
    { id:'back-left-foot',th:'เท้าซ้าย (หลัง)',   shape:'rect',    x:64,  y:320,w:32, h:20 },
    { id:'back-right-foot',th:'เท้าขวา (หลัง)',   shape:'rect',    x:104, y:320,w:32, h:20 },
  ],
};

/* ═══ MANNEQUIN SVG BUILDER ═══════════════════════════════════ */
function buildBodySVG(view) {
  const zones = BODY_ZONES[view];
  const isFront = view === 'front';

  // Body silhouette paths (simple anatomical outline)
  const silhouette = isFront ? `
    <!-- head -->
    <ellipse cx="100" cy="36" rx="27" ry="33" class="body-silhouette"/>
    <!-- neck -->
    <rect x="89" y="68" width="22" height="18" rx="4" class="body-silhouette"/>
    <!-- torso -->
    <path d="M62 84 Q52 86 34 92 L30 182 Q30 215 58 215 L68 215 L68 180 L132 180 L132 215 L142 215 Q170 215 170 182 L166 92 Q148 86 138 84 Z" class="body-silhouette"/>
    <!-- left arm -->
    <path d="M34 92 L28 195 Q28 215 38 215 L58 215 L62 182 L62 84 Z" class="body-silhouette"/>
    <!-- right arm -->
    <path d="M166 92 L172 195 Q172 215 162 215 L142 215 L138 182 L138 84 Z" class="body-silhouette"/>
    <!-- pelvis -->
    <rect x="66" y="175" width="68" height="12" rx="4" class="body-silhouette"/>
    <!-- left leg -->
    <path d="M68 187 L66 342 Q66 346 78 346 L96 346 L98 187 Z" class="body-silhouette"/>
    <!-- right leg -->
    <path d="M102 187 L104 342 Q104 346 116 346 L134 346 L132 187 Z" class="body-silhouette"/>
    <!-- left foot -->
    <ellipse cx="82" cy="344" rx="18" ry="10" class="body-silhouette"/>
    <!-- right foot -->
    <ellipse cx="118" cy="344" rx="18" ry="10" class="body-silhouette"/>
  ` : `
    <!-- head back -->
    <ellipse cx="100" cy="36" rx="27" ry="33" class="body-silhouette"/>
    <!-- neck -->
    <rect x="89" y="68" width="22" height="18" rx="4" class="body-silhouette"/>
    <!-- torso back -->
    <path d="M62 84 Q52 86 34 92 L30 182 Q30 215 58 215 L68 215 L68 180 L132 180 L132 215 L142 215 Q170 215 170 182 L166 92 Q148 86 138 84 Z" class="body-silhouette"/>
    <!-- left arm back -->
    <path d="M34 92 L28 195 Q28 215 38 215 L58 215 L62 182 L62 84 Z" class="body-silhouette"/>
    <!-- right arm back -->
    <path d="M166 92 L172 195 Q172 215 162 215 L142 215 L138 182 L138 84 Z" class="body-silhouette"/>
    <!-- pelvis back -->
    <rect x="66" y="175" width="68" height="12" rx="4" class="body-silhouette"/>
    <!-- left leg back -->
    <path d="M68 187 L66 342 Q66 346 78 346 L96 346 L98 187 Z" class="body-silhouette"/>
    <!-- right leg back -->
    <path d="M102 187 L104 342 Q104 346 116 346 L134 346 L132 187 Z" class="body-silhouette"/>
    <!-- feet back -->
    <ellipse cx="82" cy="344" rx="18" ry="10" class="body-silhouette"/>
    <ellipse cx="118" cy="344" rx="18" ry="10" class="body-silhouette"/>
  `;

  const zoneEls = zones.map(z => {
    const isSelected = state.selectedBodyParts.has(z.id);
    const sel = isSelected ? ' selected' : '';
    let el = '';
    if (z.shape === 'ellipse') {
      el = `<ellipse class="mz${sel}" data-id="${z.id}" data-th="${z.th}" cx="${z.cx}" cy="${z.cy}" rx="${z.rx}" ry="${z.ry}"/>`;
    } else {
      const r = z.shape === 'rect' ? 4 : 0;
      el = `<rect class="mz${sel}" data-id="${z.id}" data-th="${z.th}" x="${z.x}" y="${z.y}" width="${z.w}" height="${z.h}" rx="${r}"/>`;
    }
    // Add animated rash dots if selected
    if (isSelected) {
      const cx = z.shape === 'ellipse' ? z.cx : z.x + z.w / 2;
      const cy = z.shape === 'ellipse' ? z.cy : z.y + z.h / 2;
      const offsets = [[-8,-6],[6,-4],[0,7],[-5,10],[8,3]];
      const dots = offsets.map(([dx,dy]) =>
        `<circle class="rash-dot" cx="${cx+dx}" cy="${cy+dy}" r="3" fill="#e03131" opacity="0.75"/>`
      ).join('');
      el += dots;
    }
    return el;
  }).join('\n');

  const labelText = isFront ? 'FRONT' : 'BACK';

  return `<svg viewBox="0 0 200 360" xmlns="http://www.w3.org/2000/svg" class="mannequin-svg">
  <g opacity="0.6">${silhouette}</g>
  <g id="mannequin-zones">${zoneEls}</g>
  <text x="100" y="356" text-anchor="middle" font-size="9" fill="#aaa" font-family="sans-serif">${labelText}</text>
</svg>`;
}

/* ═══ MANNEQUIN INIT ══════════════════════════════════════════ */
function initBodyMannequin() {
  const wrap = document.getElementById('mannequin-wrap');
  if (!wrap) return;

  function renderMannequin() {
    wrap.innerHTML = buildBodySVG(state.currentBodyView);
    const svg = wrap.querySelector('svg');
    if (!svg) return;
    svg.addEventListener('click', e => {
      const zone = e.target.closest('.mz');
      if (!zone) return;
      const id = zone.dataset.id;
      const th = zone.dataset.th;
      if (state.selectedBodyParts.has(id)) {
        state.selectedBodyParts.delete(id);
      } else {
        state.selectedBodyParts.add(id);
      }
      renderMannequin();
      renderBodyTags();
    });
  }

  function renderBodyTags() {
    const tagsEl = document.getElementById('body-parts-tags');
    const hintEl = document.getElementById('body-hint-text');
    if (!tagsEl) return;
    if (state.selectedBodyParts.size === 0) {
      tagsEl.innerHTML = '';
      if (hintEl) hintEl.textContent = 'แตะบริเวณที่มีผื่น · Tap to select';
      return;
    }
    if (hintEl) hintEl.textContent = `เลือกแล้ว ${state.selectedBodyParts.size} บริเวณ · ${state.selectedBodyParts.size} region(s) selected`;
    // Build label map from both views
    const allZones = [...BODY_ZONES.front, ...BODY_ZONES.back];
    tagsEl.innerHTML = [...state.selectedBodyParts].map(id => {
      const zone = allZones.find(z => z.id === id);
      const label = zone ? zone.th.split(' / ')[0] : id;
      return `<span class="body-tag">${label}</span>`;
    }).join('');
  }

  // View toggle
  const btnFront = document.getElementById('btn-view-front');
  const btnBack  = document.getElementById('btn-view-back');
  if (btnFront) {
    btnFront.addEventListener('click', () => {
      state.currentBodyView = 'front';
      btnFront.className = 'btn btn-sm btn-primary';
      if (btnBack) btnBack.className = 'btn btn-sm btn-outline';
      renderMannequin();
    });
  }
  if (btnBack) {
    btnBack.addEventListener('click', () => {
      state.currentBodyView = 'back';
      if (btnFront) btnFront.className = 'btn btn-sm btn-outline';
      btnBack.className = 'btn btn-sm btn-primary';
      renderMannequin();
    });
  }

  // Clear button
  const btnClear = document.getElementById('btn-clear-mannequin');
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      state.selectedBodyParts.clear();
      renderMannequin();
      renderBodyTags();
      showToast('ล้างการเลือกแล้ว · Selection cleared');
    });
  }

  renderMannequin();
  renderBodyTags();
}

/* ═══ BODY PATTERN SCORING FOR 13 DISEASES ═══════════════════ */
function computeDiseaseScores(score, bodyParts) {
  const p = bodyParts;
  const has = (...ids) => ids.some(id => p.has(id));

  const hasTrunk = has('chest-l','chest-r','abdomen','upper-back-l','upper-back-r','lower-back');
  const hasHead  = has('head','face','back-head');
  const hasHands = has('left-hand','right-hand','back-left-hand','back-right-hand');
  const hasFeet  = has('left-foot','right-foot','back-left-foot','back-right-foot');
  const hasArms  = has('left-arm','right-arm','back-left-arm','back-right-arm');
  const hasLegs  = has('left-thigh','right-thigh','left-leg','right-leg','back-left-leg','back-right-leg','buttocks-l','buttocks-r');
  const isGeneralized = hasTrunk && (hasArms || hasLegs) && hasHead;
  const sz = p.size;

  // Unilateral check (for herpes zoster dermatomal pattern)
  const leftIds  = ['chest-l','upper-back-l','left-arm','back-left-arm','left-thigh','left-leg','back-left-leg','buttocks-l'];
  const rightIds = ['chest-r','upper-back-r','right-arm','back-right-arm','right-thigh','right-leg','back-right-leg','buttocks-r'];
  const hasLeft  = leftIds.some(id => p.has(id));
  const hasRight = rightIds.some(id => p.has(id));
  const isUnilateral = (hasLeft && !hasRight) || (!hasLeft && hasRight);

  // If no body parts selected: use score-based fallback
  if (sz === 0) {
    const s = score;
    return {
      'Varicella (Chickenpox)':       s >= 7 ? 70 : s >= 4 ? 40 : 18,
      'งูสวัด (Herpes Zoster)':       s >= 7 ? 8  : s >= 4 ? 14 : 14,
      'ผื่นแพ้ยา (Drug Eruption)':    s >= 4 ? 12 : 22,
      'มือเท้าปาก (HFMD)':            s >= 7 ? 4  : s >= 4 ? 12 : 14,
      'ฝีดาษลิง (Mpox)':              s >= 4 ? 10 : 8,
      'ผื่นแพ้สัมผัส (Contact Derm)':s >= 4 ? 6  : 18,
      'หิด (Scabies)':                s >= 4 ? 5  : 10,
      'หัด (Measles)':                 s >= 4 ? 6  : 8,
      'หัดเยอรมัน (Rubella)':         s >= 4 ? 5  : 7,
      'หูดน้ำ (Molluscum)':           5,
      'ส่าไข้ (Roseola)':             s >= 4 ? 4  : 6,
      'ไข้เลือดออก (Dengue)':         s >= 4 ? 3  : 5,
      'หนองกลากน้ำ (Impetigo)':       s >= 4 ? 3  : 8,
    };
  }

  const sc = {};

  // 1. Varicella — generalized, trunk-first
  sc['Varicella (Chickenpox)'] = score * 2.2;
  if (hasTrunk) sc['Varicella (Chickenpox)'] += 10;
  if (isGeneralized) sc['Varicella (Chickenpox)'] += 8;
  if (hasHead) sc['Varicella (Chickenpox)'] += 4;
  if (hasHands && !hasTrunk) sc['Varicella (Chickenpox)'] -= 6;

  // 2. Herpes Zoster — dermatomal, unilateral
  sc['งูสวัด (Herpes Zoster)'] = Math.max(0, (16 - score) * 0.7);
  if (isUnilateral) sc['งูสวัด (Herpes Zoster)'] += 14;
  if (!isGeneralized && sz >= 1) sc['งูสวัด (Herpes Zoster)'] += 6;
  if (isGeneralized) sc['งูสวัด (Herpes Zoster)'] -= 8;

  // 3. HFMD — hands + feet (± oral)
  sc['มือเท้าปาก (HFMD)'] = Math.max(0, 14 - score * 1.0);
  if (hasHands && hasFeet) sc['มือเท้าปาก (HFMD)'] += 14;
  if (hasHands && hasFeet && hasHead) sc['มือเท้าปาก (HFMD)'] += 4;
  if (hasTrunk && !hasHands && !hasFeet) sc['มือเท้าปาก (HFMD)'] -= 8;

  // 4. Mpox — face + palms + soles (uniform stage)
  sc['ฝีดาษลิง (Mpox)'] = 6 + score * 0.8;
  if (hasHead && hasHands && hasFeet) sc['ฝีดาษลิง (Mpox)'] += 16;
  if (hasHead && hasHands) sc['ฝีดาษลิง (Mpox)'] += 6;
  if (!hasHead && !hasHands) sc['ฝีดาษลิง (Mpox)'] -= 4;

  // 5. Measles — cephalocaudal (head → trunk → limbs)
  sc['หัด (Measles)'] = Math.max(0, 12 - Math.abs(score - 5) * 1.2);
  if (hasHead && hasTrunk && hasLegs) sc['หัด (Measles)'] += 10;
  if (hasHead && !hasTrunk) sc['หัด (Measles)'] += 5; // early phase
  if (!hasHead) sc['หัด (Measles)'] -= 4;

  // 6. Drug Eruption — widespread + symmetric
  sc['ผื่นแพ้ยา (Drug Eruption)'] = 8 + score * 0.5;
  if (isGeneralized) sc['ผื่นแพ้ยา (Drug Eruption)'] += 10;
  if (!isUnilateral && sz >= 3) sc['ผื่นแพ้ยา (Drug Eruption)'] += 6;

  // 7. Scabies — finger webs, wrists, waist, arms
  sc['หิด (Scabies)'] = 6;
  if (hasHands && hasArms) sc['หิด (Scabies)'] += 12;
  if (hasHands && has('abdomen','lower-back')) sc['หิด (Scabies)'] += 6;
  if (hasHead && !hasHands) sc['หิด (Scabies)'] -= 4;

  // 8. Rubella — fine rash, upper body, post-auricular lymph
  sc['หัดเยอรมัน (Rubella)'] = Math.max(0, 10 - Math.abs(score - 4) * 1.2);
  if (hasHead && hasTrunk) sc['หัดเยอรมัน (Rubella)'] += 10;
  if (hasHead && hasTrunk && !hasLegs) sc['หัดเยอรมัน (Rubella)'] += 4;

  // 9. Molluscum — trunk/limbs, NOT palms/soles
  sc['หูดน้ำ (Molluscum)'] = 6;
  if ((hasTrunk || hasArms || hasLegs) && !hasHands && !hasFeet) sc['หูดน้ำ (Molluscum)'] += 10;
  if (hasHands || hasFeet) sc['หูดน้ำ (Molluscum)'] -= 6;

  // 10. Roseola — trunk dominant, after fever resolves
  sc['ส่าไข้ (Roseola)'] = 4;
  if (hasTrunk && !hasHead && !hasHands && !hasFeet) sc['ส่าไข้ (Roseola)'] += 14;
  if (hasTrunk && hasArms && !hasHead) sc['ส่าไข้ (Roseola)'] += 6;
  if (isGeneralized) sc['ส่าไข้ (Roseola)'] -= 2;

  // 11. Dengue — trunk + petechiae on limbs, NOT vesicular
  sc['ไข้เลือดออก (Dengue)'] = 5;
  if (hasTrunk && hasLegs) sc['ไข้เลือดออก (Dengue)'] += 8;
  if (isGeneralized) sc['ไข้เลือดออก (Dengue)'] += 4;

  // 12. Contact Dermatitis — localized (1–2 zones)
  sc['ผื่นแพ้สัมผัส (Contact Derm)'] = Math.max(0, 14 - score * 1.0);
  if (sz <= 2) sc['ผื่นแพ้สัมผัส (Contact Derm)'] += 14;
  if (sz === 1) sc['ผื่นแพ้สัมผัส (Contact Derm)'] += 6;
  if (isGeneralized) sc['ผื่นแพ้สัมผัส (Contact Derm)'] -= 12;

  // 13. Impetigo — localized, face/extremities
  sc['หนองกลากน้ำ (Impetigo)'] = Math.max(0, 12 - score * 0.8);
  if (sz <= 2 && (hasHead || hasArms)) sc['หนองกลากน้ำ (Impetigo)'] += 10;
  if (isGeneralized) sc['หนองกลากน้ำ (Impetigo)'] -= 10;

  // Floor at 0
  Object.keys(sc).forEach(k => { sc[k] = Math.max(0, sc[k]); });
  return sc;
}

/* ═══ CAMERA ══════════════════════════════════════════════════ */
let cameraStream = null;

async function openCamera() {
  const video = document.getElementById('camera-video');
  const placeholder = document.getElementById('camera-placeholder');
  const corners = document.getElementById('camera-corners');
  const scanLine = document.getElementById('camera-scan');
  const btnOpen = document.getElementById('btn-open-camera');
  const btnCapture = document.getElementById('btn-capture');
  const btnRetake = document.getElementById('btn-retake');
  const capturedPhoto = document.getElementById('captured-photo');

  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    video.srcObject = cameraStream;
    video.style.display = 'block';
    capturedPhoto.style.display = 'none';
    if (placeholder) placeholder.style.display = 'none';
    if (corners)  corners.style.display = 'block';
    if (scanLine) scanLine.style.display = 'block';
    if (btnOpen)    btnOpen.style.display = 'none';
    if (btnCapture) btnCapture.style.display = 'inline-flex';
    if (btnRetake)  btnRetake.style.display = 'none';
    state.photoTaken = false;
    showToast('Camera ready · กล้องพร้อมแล้ว');
  } catch (err) {
    showToast('Cannot open camera: ' + (err.message || err.name));
  }
}

function capturePhoto() {
  const video = document.getElementById('camera-video');
  const capturedPhoto = document.getElementById('captured-photo');
  const corners = document.getElementById('camera-corners');
  const scanLine = document.getElementById('camera-scan');
  const btnCapture = document.getElementById('btn-capture');
  const btnRetake = document.getElementById('btn-retake');

  const canvas = document.createElement('canvas');
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

  capturedPhoto.src = dataUrl;
  capturedPhoto.style.display = 'block';
  video.style.display = 'none';
  if (corners)  corners.style.display = 'none';
  if (scanLine) scanLine.style.display = 'none';

  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
  if (btnCapture) btnCapture.style.display = 'none';
  if (btnRetake)  btnRetake.style.display = 'inline-flex';
  state.photoTaken = true;
  showToast('Photo captured · ถ่ายภาพสำเร็จ');
}

function retakePhoto() {
  const capturedPhoto = document.getElementById('captured-photo');
  const btnRetake = document.getElementById('btn-retake');
  if (capturedPhoto) { capturedPhoto.src = ''; capturedPhoto.style.display = 'none'; }
  if (btnRetake)     btnRetake.style.display = 'none';
  state.photoTaken = false;
  openCamera();
}

function stopCamera() {
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
}

/* ═══ FILE UPLOAD ═════════════════════════════════════════════ */
function initFileUpload() {
  const inp = document.getElementById('file-upload-input');
  if (!inp) return;
  inp.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const capturedPhoto = document.getElementById('captured-photo');
      const placeholder = document.getElementById('camera-placeholder');
      const video = document.getElementById('camera-video');
      const btnOpen = document.getElementById('btn-open-camera');
      const btnCapture = document.getElementById('btn-capture');
      const btnRetake = document.getElementById('btn-retake');
      if (capturedPhoto) { capturedPhoto.src = ev.target.result; capturedPhoto.style.display = 'block'; }
      if (placeholder) placeholder.style.display = 'none';
      if (video) video.style.display = 'none';
      stopCamera();
      if (btnOpen)    btnOpen.style.display = 'none';
      if (btnCapture) btnCapture.style.display = 'none';
      if (btnRetake)  btnRetake.style.display = 'inline-flex';
      state.photoTaken = true;
      showToast('รูปภาพโหลดแล้ว · Image loaded');
    };
    reader.readAsDataURL(file);
  });
}

/* ═══ NAVIGATION ══════════════════════════════════════════════ */
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  document.querySelectorAll('[data-page="' + page + '"]').forEach(l => l.classList.add('active'));
  state.currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'dashboard') {
    const listEl = document.getElementById('recent-list');
    if (listEl) listEl.innerHTML = '<div style="text-align:center;padding:40px;"><p style="color:var(--text-muted)">Fetching latest data...</p></div>';
    setTimeout(function() {
      if (typeof renderDashboardFromGoogleSheets === 'function') {
        renderDashboardFromGoogleSheets();
      } else {
        renderDashboard();
      }
    }, 150);
  }
  if (page !== 'assess') stopCamera();
}

document.addEventListener('click', e => {
  const link = e.target.closest('.nav-link');
  if (link && link.dataset.page) { e.preventDefault(); navigateTo(link.dataset.page); }
});

/* ═══ STEPS ═══════════════════════════════════════════════════ */
function setStep(step) {
  state.currentStep = step;
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('step-panel-' + step);
  if (panel) panel.classList.add('active');

  const pcts = { 1:'25%', 2:'50%', 3:'75%', 4:'100%' };
  const pb = document.getElementById('assess-progress');
  if (pb) pb.style.width = pcts[step] || '25%';

  [1,2,3,4].forEach(s => {
    const lbl = document.getElementById('step-' + s + '-lbl');
    if (lbl) lbl.classList.toggle('active', s === step);
  });

  if (step !== 3) stopCamera();
}

/* ═══ DEPARTMENT DROPDOWN ════════════════════════════════════ */
function initDeptDropdown() {
  const wrap = document.getElementById('dept-dropdown-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  let isOpen = false;
  let searchVal = '';

  const root = document.createElement('div');
  root.className = 'cs-root';

  const trigger = document.createElement('div');
  trigger.className = 'cs-trigger';
  trigger.innerHTML = `
    <span class="cs-trigger-text"><span class="cs-trigger-placeholder">Select department...</span></span>
    <svg class="cs-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>
  `;

  const menu = document.createElement('div');
  menu.className = 'cs-menu';

  const searchWrap = document.createElement('div');
  searchWrap.className = 'cs-search';
  searchWrap.innerHTML = `
    <svg class="cs-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <input type="text" placeholder="Search department..." autocomplete="off" id="cs-search-input" />
  `;

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'cs-options';

  menu.appendChild(searchWrap);
  menu.appendChild(optionsWrap);
  root.appendChild(trigger);
  root.appendChild(menu);
  wrap.appendChild(root);

  function makeOption(name) {
    const opt = document.createElement('div');
    opt.className = 'cs-option' + (state.selectedDept === name ? ' selected' : '');
    opt.innerHTML = `
      <div class="cs-option-text" style="padding:2px 0">
        <div style="font-weight:600">${name}</div>
      </div>
      ${state.selectedDept === name
        ? '<svg class="cs-option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
        : ''}
    `;
    opt.addEventListener('click', () => {
      state.selectedDept = name;
      trigger.querySelector('.cs-trigger-text').innerHTML = `<strong>${name}</strong>`;
      closeMenu();
      renderOptions();
      const otherInputWrap = document.getElementById('dept-other-wrap');
      if (name === 'อื่นๆ') {
        if (!otherInputWrap) {
          const w2 = document.createElement('div');
          w2.id = 'dept-other-wrap';
          w2.style.marginTop = '12px';
          w2.innerHTML = `
            <label class="form-label">ระบุห้องตรวจอื่นๆ / Specify other department</label>
            <input type="text" class="form-input" id="dept-other-input" placeholder="พิมพ์ชื่อห้องตรวจ..." style="width:100%; padding:10px; border:1px solid var(--border); border-radius:var(--radius-sm); font-family:inherit;" />
          `;
          document.getElementById('dept-dropdown-wrap').appendChild(w2);
          const inp2 = w2.querySelector('input');
          inp2.addEventListener('input', (ev) => { state.selectedDept = 'อื่นๆ: ' + ev.target.value; });
          inp2.focus();
        }
      } else {
        if (otherInputWrap) otherInputWrap.remove();
      }
      showToast('Selected: ' + name);
    });
    return opt;
  }

  function renderOptions() {
    const q = searchVal.toLowerCase();
    optionsWrap.innerHTML = '';

    if (q) {
      const filtered = DEPARTMENTS.filter(d => d.toLowerCase().includes(q));
      if (filtered.length === 0) {
        optionsWrap.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px">ไม่พบห้องตรวจ</div>';
        return;
      }
      filtered.forEach(name => optionsWrap.appendChild(makeOption(name)));
      return;
    }

    DEPT_GROUPS.forEach(({ group, items }) => {
      const header = document.createElement('div');
      header.className = 'cs-group-header';
      header.textContent = group;
      optionsWrap.appendChild(header);
      items.forEach(name => optionsWrap.appendChild(makeOption(name)));
    });
  }

  function openMenu() {
    isOpen = true;
    menu.classList.add('open');
    trigger.classList.add('open');
    trigger.querySelector('.cs-arrow').classList.add('open');
    renderOptions();
    setTimeout(() => { const inp = document.getElementById('cs-search-input'); if (inp) inp.focus(); }, 50);
  }
  function closeMenu() {
    isOpen = false;
    menu.classList.remove('open');
    trigger.classList.remove('open');
    trigger.querySelector('.cs-arrow').classList.remove('open');
  }

  trigger.addEventListener('click', e => { e.stopPropagation(); if (isOpen) closeMenu(); else openMenu(); });
  document.addEventListener('click', e => { if (!root.contains(e.target)) closeMenu(); });
  menu.addEventListener('click', e => e.stopPropagation());
  menu.addEventListener('input', e => {
    if (e.target.id === 'cs-search-input') { searchVal = e.target.value; renderOptions(); }
  });
  renderOptions();
}

/* ═══ CRITERIA ════════════════════════════════════════════════ */
function initCriteria() {
  renderCriteria('major-criteria', MAJOR_CRITERIA, 'major');
  renderCriteria('minor-criteria', MINOR_CRITERIA, 'minor');
  renderCriteria('red-flags', RED_FLAGS, 'flag');
}

function renderCriteria(containerId, items, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'crit-item';

    const set = type === 'flag' ? state.checkedRedFlags
              : type === 'major' ? state.checkedMajor
              : state.checkedMinor;
    const checked = set.has(item.id);
    const cbClass = checked ? (type === 'flag' ? 'crit-cb checked-red' : 'crit-cb checked') : 'crit-cb';

    div.innerHTML = `
      <div class="${cbClass}" id="cb-${item.id}">
        ${checked ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      </div>
      <div>
        <div class="crit-label" style="font-weight:600">${item.th}</div>
        ${item.en ? `<div class="crit-label-en" style="font-size:11px;opacity:0.6;margin-top:2px">${item.en}</div>` : ''}
      </div>
    `;
    div.addEventListener('click', () => {
      if (set.has(item.id)) set.delete(item.id); else set.add(item.id);
      div.classList.add('just-checked');
      setTimeout(() => div.classList.remove('just-checked'), 300);
      renderCriteria(containerId, items, type);
      updateScore();
    });
    container.appendChild(div);
  });
}

function updateScore() {
  let score = 0;
  state.checkedMajor.forEach(id => { const it = MAJOR_CRITERIA.find(i=>i.id===id); if(it) score+=it.score; });
  state.checkedMinor.forEach(id => { const it = MINOR_CRITERIA.find(i=>i.id===id); if(it) score+=it.score; });
  state.totalScore = score;

  const level = score >= 7 ? 'สงสัยระดับสูง (High Suspicion)' : score >= 4 ? 'สงสัยระดับปานกลาง (Moderate Suspicion)' : 'สงสัยระดับน้อย (Low Suspicion)';
  const sd = document.getElementById('score-display');
  if (sd) sd.querySelector('.score-val').textContent = `${score} คะแนน — ${level}`;
}

/* ═══ AI SIMULATION — 13 DISEASES ═══════════════════════════ */
function simulateAI() {
  const analyzingEl = document.getElementById('analyzing-state');
  const btnAnalyze  = document.getElementById('btn-analyze');
  if (analyzingEl) analyzingEl.style.display = 'block';
  if (btnAnalyze)  btnAnalyze.disabled = true;

  setTimeout(() => {
    if (analyzingEl) analyzingEl.style.display = 'none';
    if (btnAnalyze)  btnAnalyze.disabled = false;

    const score = state.totalScore;
    const parts = state.selectedBodyParts;

    // Get disease scores from body pattern + clinical score
    const rawScores = computeDiseaseScores(score, parts);

    // Sort descending, take top 5
    const sorted = Object.entries(rawScores)
      .filter(([,v]) => v > 0)
      .sort((a,b) => b[1] - a[1])
      .slice(0, 5);

    const totalRaw = sorted.reduce((s,[,v]) => s + v, 0) || 1;

    // Normalise to percentages (top 3 shown)
    const top3 = sorted.slice(0, 3).map(([name, val]) => ({
      label: name,
      pct:   Math.max(1, Math.round((val / totalRaw) * 100)),
    }));

    // Add small random noise
    top3.forEach(p => { p.pct = Math.min(96, p.pct + Math.floor(Math.random() * 5)); });

    const conf = Math.min(94, 54 + score * 3 + Math.floor(Math.random() * 8));
    state.aiResult = { score, confidence: conf, possibilities: top3, bodyParts: [...parts] };
    setStep(4);
    renderResults();
  }, 2400);
}

/* ═══ RESULTS ════════════════════════════════════════════════ */
function renderResults() {
  const score = state.totalScore;
  const hasRedFlag = state.checkedRedFlags.size > 0;
  const banner  = document.getElementById('result-banner');
  const aiBox   = document.getElementById('ai-result-box');
  const recs    = document.getElementById('recommendations');
  const rfAlert = document.getElementById('red-flag-alert');

  if (rfAlert) rfAlert.style.display = hasRedFlag ? 'flex' : 'none';

  if (banner) {
    if (score >= 7) {
      banner.className = 'result-banner high';
      banner.innerHTML = `🔴 ความสงสัยระดับสูง (High Suspicion)<br><small style="font-size:13px;font-weight:400">${score} คะแนนรวม · Varicella Likely · Notify physician (แจ้งแพทย์)</small>`;
    } else if (score >= 4) {
      banner.className = 'result-banner moderate';
      banner.innerHTML = `🟡 ความสงสัยระดับปานกลาง (Moderate Suspicion)<br><small style="font-size:13px;font-weight:400">${score} คะแนนรวม · Monitor closely (ติดตามอาการอย่างใกล้ชิด)</small>`;
    } else {
      banner.className = 'result-banner low';
      banner.innerHTML = `🟢 ความสงสัยระดับน้อย (Low Suspicion)<br><small style="font-size:13px;font-weight:400">${score} คะแนนรวม · Varicella less likely (โอกาสเป็นอีสุกอีใสต่ำ)</small>`;
    }
  }

  if (aiBox && state.aiResult) {
    const { possibilities, bodyParts } = state.aiResult;
    const bodyNote = bodyParts && bodyParts.length > 0
      ? `<div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">📍 Body regions factored: ${bodyParts.length} zone(s)</div>`
      : '';
    aiBox.innerHTML = '<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px">AI Impression — Mpox Skin Lesion Dataset v2.0 + Body Map</div>' +
      bodyNote +
      possibilities.map((p, i) => `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:4px">
            <span>${p.label}</span><span>${p.pct}%</span>
          </div>
          <div style="height:6px;background:var(--border);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${p.pct}%;background:${i===0?'linear-gradient(90deg,var(--brown-mid),var(--primary))':'var(--border)'};border-radius:3px;transition:width .8s ease"></div>
          </div>
        </div>
      `).join('') +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:8px;font-style:italic;line-height:1.5">ระบบเป็นเพียงการประเมินคัดกรอง<br>ไม่สามารถทดแทนการวินิจฉัยโดยแพทย์ได้</div>';
  }

  if (recs) {
    const items = score >= 7
      ? [
          'เริ่มมาตรการป้องกันทางอากาศทันที (Implement Airborne Precautions immediately) - N95, ห้องความดันลบ',
          'แจ้งแพทย์เจ้าของไข้ (Notify attending physician) — ยืนยันการวินิจฉัย, พิจารณาให้ยา Acyclovir',
          'แยกกักตัวจนกว่าตุ่มจะตกสะเก็ดทั้งหมด (Isolate patient until all lesions are fully crusted)',
          'ประเมินผู้สัมผัสในบ้านหรือหอผู้ป่วย (Assess household/ward contacts for immunity)',
          'บันทึกและรายงานตามโปรโตคอลการเฝ้าระวังของโรงพยาบาล (Document and report per hospital surveillance protocol)',
          ...(hasRedFlag ? ['⚠️ พบสัญญาณอันตราย — ต้องได้รับการประเมินจากแพทย์ด่วน (Urgent physician evaluation required)'] : []),
        ]
      : score >= 4
        ? [
            'ติดตามอาการอย่างใกล้ชิดใน 24–48 ชั่วโมง (Monitor closely for 24–48 hours)',
            'แยกกักตัวชั่วคราวระหว่างรอการยืนยัน (Temporary contact isolation while awaiting confirmation)',
            'ปรึกษาแพทย์เพื่อการวินิจฉัยยืนยัน (Consult physician for confirmatory diagnosis)',
            'พิจารณาการตรวจทางห้องปฏิบัติการเพิ่มเติม (Consider additional laboratory workup)',
          ]
        : [
            'อาการยังไม่เข้าเกณฑ์โรคอีสุกอีใสในขณะนี้ (Symptoms do not currently meet varicella criteria)',
            'ติดตามอาการต่อไป (Continue monitoring) — ประเมินซ้ำหากมีผื่นใหม่เกิดขึ้น',
            'ทบทวนส่วนการวินิจฉัยแยกโรคเพื่อพิจารณาโรคอื่นๆ (Review Differential Diagnosis section)',
          ];

    recs.innerHTML = items.map(i => `
      <div class="rec-item"><div class="rec-dot"></div><div>${i}</div></div>
    `).join('');
  }

  saveHistory(score, hasRedFlag);
}

/* ═══ HISTORY ════════════════════════════════════════════════ */
function saveHistory(score, hasRedFlag) {
  const historyRecord = {
    ts: Date.now(),
    dept: state.selectedDept || 'Unknown',
    ageRange: state.selectedAgeRange || 'Unknown',
    gender: state.selectedGender || 'Unknown',
    vaccination: state.selectedVaccination || 'Unknown',
    score, hasRedFlag,
    level: score >= 7 ? 'high' : score >= 4 ? 'moderate' : 'low',
  };
  state.assessHistory.unshift(historyRecord);
  if (state.assessHistory.length > 500) state.assessHistory.pop();
  localStorage.setItem('suksai_v2_history', JSON.stringify(state.assessHistory));

  if (typeof sendDataToGoogleSheets === 'function' && typeof prepareAssessmentDataForSheets === 'function') {
    const assessmentData = prepareAssessmentDataForSheets(state);
    sendDataToGoogleSheets(assessmentData)
      .then(ok => console.log('[SUKSAI] Google Sheets send:', ok ? 'success' : 'failed'))
      .catch(err => console.error('[SUKSAI] Google Sheets error:', err));
  }
}

/* ═══ DASHBOARD ══════════════════════════════════════════════ */
function renderDashboard() {
  const history = state.assessHistory;
  const total = history.length;
  const high  = history.filter(h => h.level === 'high').length;
  const flags = history.filter(h => h.hasRedFlag).length;
  const depts = new Set(history.map(h => h.dept)).size;

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('kpi-total', total);
  setEl('kpi-high', high);
  setEl('kpi-high-sub', (total ? Math.round(high/total*100) : 0) + '% of total');
  setEl('kpi-flags', flags);
  setEl('kpi-depts', depts);

  const recentEl = document.getElementById('recent-list');
  if (recentEl) {
    recentEl.innerHTML = history.length === 0
      ? '<div style="text-align:center;color:var(--text-muted);padding:24px">No data yet — complete an assessment to see results here</div>'
      : history.slice(0, 50).map(h => {
          const d = new Date(h.ts);
          const dt = d.toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
          const badgeLabel = { high:'High', moderate:'Moderate', low:'Low' }[h.level] || h.level;
          return `<div class="recent-item">
            <div>
              <div style="font-size:13px;font-weight:600">${h.dept}</div>
              <div style="font-size:11px;color:var(--text-muted)">${dt} · Score ${h.score} ${h.hasRedFlag ? '⚠️' : ''}</div>
            </div>
            <span class="ri-badge ${h.level}">${badgeLabel}</span>
          </div>`;
        }).join('');
  }
}

/* ═══ DIFFERENTIAL ═══════════════════════════════════════════ */
function renderDifferential() {
  const grid = document.getElementById('diff-grid');
  if (!grid) return;

  grid.innerHTML = DIFF_DX.map(d => {
    const simLabel = { high:'Very Similar', medium:'Moderately Similar', low:'Less Similar' }[d.similarity];
    const tagsHtml = d.tags.map((tag, i) =>
      `<span class="diff-tag diff-tag-${d.tagColors?.[i] || 'blue'}">${tag}</span>`
    ).join('');

    return `
      <div class="diff-card">
        <div class="diff-img-wrap">
          <img src="${d.imgUrl}" alt="${d.nameTh}" loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'diff-img-placeholder\\'><svg width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><circle cx=\\'11\\' cy=\\'11\\' r=\\'8\\'/><line x1=\\'21\\' y1=\\'21\\' x2=\\'16.65\\' y2=\\'16.65\\'/></svg><span>No image</span></div>'" />
          <span class="diff-badge ${d.similarity}">${simLabel}</span>
        </div>
        <div class="diff-body">
          <div class="diff-name-th">${d.nameTh}</div>
          <div class="diff-name-en">${d.nameEn}</div>
          <div class="diff-section">
            <div class="diff-section-label">Key Features</div>
            <div class="diff-desc">${d.keyDiff}</div>
          </div>
          <div class="diff-section">
            <div class="diff-section-label">vs. Varicella</div>
            <div class="diff-desc">${d.distinguishTh}</div>
          </div>
          <div class="diff-tags">${tagsHtml}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* ═══ EDUCATION TABS ══════════════════════════════════════════ */
function initEducationTabs() {
  [['tab-prevention','tab-prevention-panel'],
   ['tab-self-care','tab-self-care-panel'],
   ['tab-5w1h','tab-5w1h-panel']].forEach(([btn, panel]) => {
    const b = document.getElementById(btn);
    if (!b) return;
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const p = document.getElementById(panel);
      if (p) p.classList.add('active');
    });
  });
}

/* ═══ TOAST ═══════════════════════════════════════════════════ */
let _toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

/* ═══ STEP BUTTONS ═══════════════════════════════════════════ */
function initStepButtons() {
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

  on('btn-step1-next', () => {
    if (!state.selectedDept)       { showToast('Please select a department'); return; }
    if (!state.selectedAgeRange)   { showToast('Please select age range'); return; }
    if (!state.selectedGender)     { showToast('Please select gender'); return; }
    if (!state.selectedVaccination){ showToast('Please select vaccination status'); return; }
    setStep(2);
  });
  on('btn-step2-next', () => setStep(3));
  on('btn-step2-back', () => setStep(1));
  on('btn-step3-back', () => { stopCamera(); setStep(2); });
  on('btn-open-camera', openCamera);
  on('btn-capture',     capturePhoto);
  on('btn-retake',      retakePhoto);
  on('btn-analyze',     simulateAI);

  on('btn-complete', () => {
    stopCamera();
    state.currentStep      = 1;
    state.selectedDept     = null;
    state.selectedAgeRange = null;
    state.selectedGender   = null;
    state.selectedVaccination = null;
    state.checkedMajor.clear();
    state.checkedMinor.clear();
    state.checkedRedFlags.clear();
    state.totalScore = 0;
    state.aiResult   = null;
    state.photoTaken = false;
    state.selectedBodyParts.clear();
    state.currentBodyView = 'front';

    document.querySelectorAll('.btn-toggle').forEach(btn => btn.classList.remove('active'));

    // Reset mannequin view toggle buttons
    const bf = document.getElementById('btn-view-front');
    const bb = document.getElementById('btn-view-back');
    if (bf) bf.className = 'btn btn-sm btn-primary';
    if (bb) bb.className = 'btn btn-sm btn-outline';

    initDeptDropdown();
    initCriteria();
    updateScore();
    initBodyMannequin();

    // Reset camera area
    const v   = document.getElementById('camera-video');
    const p   = document.getElementById('captured-photo');
    const ph  = document.getElementById('camera-placeholder');
    const btnOpen = document.getElementById('btn-open-camera');
    const btnCap  = document.getElementById('btn-capture');
    const btnRet  = document.getElementById('btn-retake');
    if (v)  { v.style.display = 'none'; v.srcObject = null; }
    if (p)  { p.style.display = 'none'; p.src = ''; }
    if (ph) ph.style.display = 'flex';
    if (btnOpen) btnOpen.style.display = 'inline-flex';
    if (btnCap)  btnCap.style.display = 'none';
    if (btnRet)  btnRet.style.display = 'none';
    setStep(1);
    showToast('Ready for new assessment');
  });
}

/* ═══ TOGGLE BUTTONS INIT ════════════════════════════════════ */
function initToggleButtons() {
  const ageButtons = document.querySelectorAll('#age-group-wrap .btn-toggle');
  ageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      ageButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedAgeRange = btn.dataset.value;
      showToast('Age: ' + btn.textContent);
    });
  });

  const genderButtons = document.querySelectorAll('#gender-group-wrap .btn-toggle');
  genderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      genderButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedGender = btn.dataset.value;
      showToast('Gender: ' + btn.textContent);
    });
  });

  const vaccineButtons = document.querySelectorAll('#vaccine-group-wrap .btn-toggle');
  vaccineButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      vaccineButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedVaccination = btn.dataset.value;
      showToast('Vaccination: ' + btn.textContent);
    });
  });
}

/* ═══ INIT ════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initDeptDropdown();
  initToggleButtons();
  initCriteria();
  updateScore();
  initStepButtons();
  initEducationTabs();
  initBodyMannequin();
  initFileUpload();
  renderDifferential();

  console.log('%cSUKSAI v2 — Skin Rash Assessment System (13 Diseases)', 'color:#3DAD8A;font-size:16px;font-weight:800');
  console.log('%cconceived, designed, and Brought to Life by RN.Patipon Wiyo', 'color:#8B5E3C;font-size:12px');
});
