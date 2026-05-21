const fallback = {
  filters: {
    classes: [{ className: "计科一班" }, { className: "计科二班" }, { className: "软件一班" }, { className: "软件二班" }],
    courses: [
      { courseId: 1, courseName: "高等数学" },
      { courseId: 2, courseName: "程序设计" },
      { courseId: 3, courseName: "大学英语" },
      { courseId: 4, courseName: "数据结构" },
      { courseId: 5, courseName: "数据库原理" },
      { courseId: 6, courseName: "Web前端开发" },
      { courseId: 7, courseName: "软件工程" },
      { courseId: 8, courseName: "人工智能导论" }
    ],
    months: [{ month: "2026-02" }, { month: "2026-03" }, { month: "2026-04" }]
  },
  overview: {
    studentCount: 32,
    courseCount: 8,
    averageScore: 85.51,
    highestScore: 99,
    excellentRate: 24.48,
    passRate: 100,
    updateTime: "2026/5/21 19:00"
  },
  classes: [
    { className: "计科一班", avgScore: 89.08 },
    { className: "软件二班", avgScore: 86.96 },
    { className: "软件一班", avgScore: 85.03 },
    { className: "计科二班", avgScore: 80.95 }
  ],
  courses: [
    { courseName: "Web前端开发", avgScore: 88.53, maxScore: 99, minScore: 78 },
    { courseName: "程序设计", avgScore: 87.58, maxScore: 99, minScore: 77 },
    { courseName: "人工智能导论", avgScore: 86.52, maxScore: 97, minScore: 74 },
    { courseName: "数据库原理", avgScore: 86.42, maxScore: 98, minScore: 74 },
    { courseName: "数据结构", avgScore: 85.43, maxScore: 95, minScore: 73 },
    { courseName: "软件工程", avgScore: 84.53, maxScore: 96, minScore: 73 }
  ],
  trends: [
    { month: "2026-02", avgScore: 83.52 },
    { month: "2026-03", avgScore: 85.47 },
    { month: "2026-04", avgScore: 87.52 }
  ]
};

async function getJson(url, fallbackValue) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(url);
    return await response.json();
  } catch (error) {
    return fallbackValue;
  }
}

function setMetric(id, value, suffix = "") {
  document.getElementById(id).textContent = `${value}${suffix}`;
}

function currentQuery() {
  const params = new URLSearchParams();
  const className = document.getElementById("classFilter").value;
  const courseId = document.getElementById("courseFilter").value;
  const month = document.getElementById("monthFilter").value;
  if (className) params.set("className", className);
  if (courseId) params.set("courseId", courseId);
  if (month) params.set("month", month);
  const query = params.toString();
  return query ? `?${query}` : "";
}

function fillSelect(id, rows, valueKey, labelKey, defaultLabel) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">${defaultLabel}</option>`;
  rows.forEach((item) => {
    const option = document.createElement("option");
    option.value = item[valueKey];
    option.textContent = item[labelKey];
    select.appendChild(option);
  });
}

function renderClasses(rows) {
  const max = Math.max(...rows.map((item) => item.avgScore), 1);
  document.getElementById("classChart").innerHTML = rows.length
    ? rows
        .map((item) => {
          const width = Math.round((item.avgScore / max) * 100);
          return `
            <div class="bar-row">
              <span>${item.className}</span>
              <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
              <strong>${item.avgScore}</strong>
            </div>
          `;
        })
        .join("")
    : `<div class="empty">暂无班级数据</div>`;
}

function renderCourses(rows) {
  document.getElementById("courseChart").innerHTML = rows.length
    ? rows.slice(0, 6)
        .map((item) => {
          const left = Math.max(0, item.minScore - 50);
          const width = Math.max(8, item.maxScore - item.minScore);
          return `
            <div class="course-item">
              <span>${item.courseName}</span>
              <div class="course-range"><span style="left:${left}%;width:${width}%"></span></div>
              <strong>${item.avgScore}</strong>
            </div>
          `;
        })
        .join("")
    : `<div class="empty">暂无课程数据</div>`;
}

function renderTrend(rows) {
  const svg = document.getElementById("trendChart");
  const width = 420;
  const height = 160;
  const pad = 28;
  if (!rows.length) {
    svg.innerHTML = `<text x="210" y="88" fill="#9ed7ff" font-size="16" text-anchor="middle">暂无趋势数据</text>`;
    return;
  }
  const scores = rows.map((item) => item.avgScore);
  const min = Math.min(...scores) - 2;
  const max = Math.max(...scores) + 2;
  const points = rows.map((item, index) => {
    const x = rows.length === 1 ? width / 2 : pad + (index * (width - pad * 2)) / (rows.length - 1);
    const y = height - pad - ((item.avgScore - min) / (max - min || 1)) * (height - pad * 2);
    return { x, y, label: item.month, value: item.avgScore };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = points.length > 1
    ? `${path} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`
    : "";

  svg.innerHTML = `
    <defs>
      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#55d6ff" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#55d6ff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${area ? `<path d="${area}" fill="url(#trendFill)"></path>` : ""}
    <path d="${path}" fill="none" stroke="#6ee7b7" stroke-width="4" stroke-linecap="round"></path>
    ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#ffd166"></circle>`).join("")}
    ${points.map((point) => `<text x="${point.x}" y="${height - 6}" fill="#9ed7ff" font-size="13" text-anchor="middle">${point.label.slice(5)}</text>`).join("")}
    ${points.map((point) => `<text x="${point.x}" y="${point.y - 12}" fill="#eef8ff" font-size="13" text-anchor="middle">${point.value}</text>`).join("")}
  `;
}

async function loadFilters() {
  const filters = await getJson("/api/filters", fallback.filters);
  fillSelect("classFilter", filters.classes, "className", "className", "全部班级");
  fillSelect("courseFilter", filters.courses, "courseId", "courseName", "全部课程");
  fillSelect("monthFilter", filters.months, "month", "month", "全部月份");
}

async function loadDashboard() {
  const query = currentQuery();
  const [overview, classes, courses, trends] = await Promise.all([
    getJson(`/api/overview${query}`, fallback.overview),
    getJson(`/api/classes${query}`, fallback.classes),
    getJson(`/api/courses${query}`, fallback.courses),
    getJson(`/api/trends${query}`, fallback.trends)
  ]);

  setMetric("studentCount", overview.studentCount);
  setMetric("courseCount", overview.courseCount);
  setMetric("averageScore", overview.averageScore);
  setMetric("highestScore", overview.highestScore);
  setMetric("excellentRate", overview.excellentRate, "%");
  setMetric("passRate", overview.passRate, "%");
  document.getElementById("updateTime").textContent = `更新时间 ${overview.updateTime}`;

  renderClasses(classes);
  renderCourses(courses);
  renderTrend(trends);
}

async function main() {
  await loadFilters();
  ["classFilter", "courseFilter", "monthFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("change", loadDashboard);
  });
  await loadDashboard();
}

main();
