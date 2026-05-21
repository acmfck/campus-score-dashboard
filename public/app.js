const fallback = {
  overview: {
    studentCount: 8,
    courseCount: 5,
    averageScore: 82.27,
    highestScore: 96,
    excellentRate: 32.14,
    passRate: 98.21,
    updateTime: "2026/5/21 16:30"
  },
  classes: [
    { className: "计科一班", avgScore: 90.5 },
    { className: "软件二班", avgScore: 88.43 },
    { className: "软件一班", avgScore: 75.5 },
    { className: "计科二班", avgScore: 74.64 }
  ],
  courses: [
    { courseName: "程序设计", avgScore: 84.63, maxScore: 96, minScore: 63 },
    { courseName: "高等数学", avgScore: 82.92, maxScore: 96, minScore: 58 },
    { courseName: "数据库原理", avgScore: 82.25, maxScore: 92, minScore: 67 },
    { courseName: "数据结构", avgScore: 81.75, maxScore: 94, minScore: 61 },
    { courseName: "大学英语", avgScore: 78.5, maxScore: 91, minScore: 66 }
  ],
  trends: [
    { month: "2026-02", avgScore: 81.47 },
    { month: "2026-03", avgScore: 83.25 },
    { month: "2026-04", avgScore: 85.25 }
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

function renderClasses(rows) {
  const max = Math.max(...rows.map((item) => item.avgScore));
  document.getElementById("classChart").innerHTML = rows
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
    .join("");
}

function renderCourses(rows) {
  document.getElementById("courseChart").innerHTML = rows
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
    .join("");
}

function renderTrend(rows) {
  const svg = document.getElementById("trendChart");
  const width = 420;
  const height = 160;
  const pad = 28;
  const scores = rows.map((item) => item.avgScore);
  const min = Math.min(...scores) - 2;
  const max = Math.max(...scores) + 2;
  const points = rows.map((item, index) => {
    const x = pad + (index * (width - pad * 2)) / (rows.length - 1);
    const y = height - pad - ((item.avgScore - min) / (max - min)) * (height - pad * 2);
    return { x, y, label: item.month, value: item.avgScore };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const area = `${path} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#55d6ff" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#55d6ff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#trendFill)"></path>
    <path d="${path}" fill="none" stroke="#6ee7b7" stroke-width="4" stroke-linecap="round"></path>
    ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="5" fill="#ffd166"></circle>`).join("")}
    ${points.map((point) => `<text x="${point.x}" y="${height - 6}" fill="#9ed7ff" font-size="13" text-anchor="middle">${point.label.slice(5)}</text>`).join("")}
    ${points.map((point) => `<text x="${point.x}" y="${point.y - 12}" fill="#eef8ff" font-size="13" text-anchor="middle">${point.value}</text>`).join("")}
  `;
}

async function loadDashboard() {
  const [overview, classes, courses, trends] = await Promise.all([
    getJson("/api/overview", fallback.overview),
    getJson("/api/classes", fallback.classes),
    getJson("/api/courses", fallback.courses),
    getJson("/api/trends", fallback.trends)
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

loadDashboard();
