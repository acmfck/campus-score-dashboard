const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const students = [
  { id: 1, name: "张晨", gender: "男", class_name: "计科一班", grade_name: "2023级" },
  { id: 2, name: "李雨欣", gender: "女", class_name: "计科一班", grade_name: "2023级" },
  { id: 3, name: "王浩", gender: "男", class_name: "计科二班", grade_name: "2023级" },
  { id: 4, name: "赵敏", gender: "女", class_name: "计科二班", grade_name: "2023级" },
  { id: 5, name: "陈宇", gender: "男", class_name: "软件一班", grade_name: "2023级" },
  { id: 6, name: "周悦", gender: "女", class_name: "软件一班", grade_name: "2023级" },
  { id: 7, name: "刘思远", gender: "男", class_name: "软件二班", grade_name: "2023级" },
  { id: 8, name: "何佳怡", gender: "女", class_name: "软件二班", grade_name: "2023级" }
];

const courses = [
  { id: 1, name: "高等数学", teacher: "刘老师", credit: 4 },
  { id: 2, name: "程序设计", teacher: "黄老师", credit: 4 },
  { id: 3, name: "大学英语", teacher: "孙老师", credit: 3 },
  { id: 4, name: "数据结构", teacher: "吴老师", credit: 4 },
  { id: 5, name: "数据库原理", teacher: "郑老师", credit: 3 }
];

const grades = [
  [1, 1, "2026-02", 88], [1, 2, "2026-02", 94], [1, 3, "2026-02", 81], [1, 4, "2026-02", 90], [1, 5, "2026-02", 87],
  [2, 1, "2026-02", 91], [2, 2, "2026-02", 96], [2, 3, "2026-02", 89], [2, 4, "2026-02", 92], [2, 5, "2026-02", 90],
  [3, 1, "2026-02", 76], [3, 2, "2026-02", 82], [3, 3, "2026-02", 73], [3, 4, "2026-02", 79], [3, 5, "2026-02", 78],
  [4, 1, "2026-02", 69], [4, 2, "2026-02", 74], [4, 3, "2026-02", 66], [4, 4, "2026-02", 71], [4, 5, "2026-02", 70],
  [5, 1, "2026-02", 85], [5, 2, "2026-02", 87], [5, 3, "2026-02", 80], [5, 4, "2026-02", 84], [5, 5, "2026-02", 89],
  [6, 1, "2026-02", 58], [6, 2, "2026-02", 63], [6, 3, "2026-02", 72], [6, 4, "2026-02", 61], [6, 5, "2026-02", 67],
  [7, 1, "2026-02", 82], [7, 2, "2026-02", 86], [7, 3, "2026-02", 76], [7, 4, "2026-02", 83], [7, 5, "2026-02", 85],
  [8, 1, "2026-02", 93], [8, 2, "2026-02", 95], [8, 3, "2026-02", 91], [8, 4, "2026-02", 94], [8, 5, "2026-02", 92],
  [1, 1, "2026-03", 90], [2, 1, "2026-03", 93], [3, 1, "2026-03", 79], [4, 1, "2026-03", 72],
  [5, 1, "2026-03", 88], [6, 1, "2026-03", 65], [7, 1, "2026-03", 84], [8, 1, "2026-03", 95],
  [1, 1, "2026-04", 92], [2, 1, "2026-04", 94], [3, 1, "2026-04", 81], [4, 1, "2026-04", 75],
  [5, 1, "2026-04", 90], [6, 1, "2026-04", 68], [7, 1, "2026-04", 86], [8, 1, "2026-04", 96]
].map(([student_id, course_id, exam_month, score], index) => ({ id: index + 1, student_id, course_id, exam_month, score }));

function round(value) {
  return Math.round(value * 100) / 100;
}

function avg(items) {
  return items.reduce((sum, item) => sum + item, 0) / items.length;
}

function studentById(id) {
  return students.find((item) => item.id === id);
}

function courseById(id) {
  return courses.find((item) => item.id === id);
}

function overview() {
  const scores = grades.map((item) => item.score);
  const lowScoresByClass = {};
  grades.filter((item) => item.score < 60).forEach((item) => {
    const className = studentById(item.student_id).class_name;
    lowScoresByClass[className] = (lowScoresByClass[className] || 0) + 1;
  });
  const focusClass = Object.entries(lowScoresByClass).sort((a, b) => b[1] - a[1])[0]?.[0] || "暂无";

  return {
    studentCount: students.length,
    courseCount: courses.length,
    averageScore: round(avg(scores)),
    highestScore: Math.max(...scores),
    excellentRate: round((grades.filter((item) => item.score >= 90).length * 100) / grades.length),
    passRate: round((grades.filter((item) => item.score >= 60).length * 100) / grades.length),
    focusClass,
    updateTime: new Date().toLocaleString("zh-CN")
  };
}

function classesData() {
  const grouped = {};
  grades.forEach((item) => {
    const className = studentById(item.student_id).class_name;
    grouped[className] ||= [];
    grouped[className].push(item.score);
  });

  return Object.entries(grouped)
    .map(([className, scores]) => ({
      className,
      avgScore: round(avg(scores)),
      excellentRate: round((scores.filter((score) => score >= 90).length * 100) / scores.length),
      passRate: round((scores.filter((score) => score >= 60).length * 100) / scores.length)
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

function coursesData() {
  return courses
    .map((course) => {
      const scores = grades.filter((item) => item.course_id === course.id).map((item) => item.score);
      return {
        courseName: course.name,
        avgScore: round(avg(scores)),
        maxScore: Math.max(...scores),
        minScore: Math.min(...scores)
      };
    })
    .sort((a, b) => b.avgScore - a.avgScore);
}

function trendsData() {
  const grouped = {};
  grades.forEach((item) => {
    grouped[item.exam_month] ||= [];
    grouped[item.exam_month].push(item.score);
  });

  return Object.entries(grouped)
    .map(([month, scores]) => ({ month, avgScore: round(avg(scores)) }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function sendJson(res, data) {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function sendStatic(res, urlPath) {
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".png": "image/png"
  };
  const requested = urlPath === "/" ? "/index.html" : urlPath;
  const file = path.normalize(path.join(publicDir, requested));
  if (!file.startsWith(publicDir)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Forbidden");
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/health") {
    return sendJson(res, {
      status: "ok",
      database: "fallback-memory",
      counts: { students: students.length, courses: courses.length, grades: grades.length },
      timestamp: new Date().toISOString()
    });
  }
  if (urlPath === "/api/overview") return sendJson(res, overview());
  if (urlPath === "/api/classes") return sendJson(res, classesData());
  if (urlPath === "/api/courses") return sendJson(res, coursesData());
  if (urlPath === "/api/trends") return sendJson(res, trendsData());
  return sendStatic(res, urlPath);
});

server.listen(PORT, () => {
  console.log(`Campus score dashboard is running at http://localhost:${PORT}`);
  console.log("Using dependency-free local server with in-memory demo data.");
});
