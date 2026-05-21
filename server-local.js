const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const names = [
  ["张晨", "男", "计科一班"], ["李雨欣", "女", "计科一班"], ["王浩", "男", "计科一班"], ["赵敏", "女", "计科一班"],
  ["陈宇", "男", "计科一班"], ["周悦", "女", "计科一班"], ["刘思远", "男", "计科一班"], ["何佳怡", "女", "计科一班"],
  ["孙博文", "男", "计科二班"], ["林可欣", "女", "计科二班"], ["郭子航", "男", "计科二班"], ["唐诗雨", "女", "计科二班"],
  ["马俊杰", "男", "计科二班"], ["罗嘉怡", "女", "计科二班"], ["许明轩", "男", "计科二班"], ["邓雅琪", "女", "计科二班"],
  ["曹睿", "男", "软件一班"], ["韩若琳", "女", "软件一班"], ["梁启航", "男", "软件一班"], ["谢安琪", "女", "软件一班"],
  ["朱一鸣", "男", "软件一班"], ["郑嘉宁", "女", "软件一班"], ["沈泽宇", "男", "软件一班"], ["蒋雨桐", "女", "软件一班"],
  ["程浩然", "男", "软件二班"], ["叶欣然", "女", "软件二班"], ["黄子墨", "男", "软件二班"], ["袁思涵", "女", "软件二班"],
  ["冯逸凡", "男", "软件二班"], ["秦梦瑶", "女", "软件二班"], ["潘宇辰", "男", "软件二班"], ["顾佳音", "女", "软件二班"]
];

const students = names.map(([name, gender, class_name], index) => ({
  id: index + 1,
  name,
  gender,
  class_name,
  grade_name: "2023级"
}));

const courses = [
  { id: 1, name: "高等数学", teacher: "刘老师", credit: 4 },
  { id: 2, name: "程序设计", teacher: "黄老师", credit: 4 },
  { id: 3, name: "大学英语", teacher: "孙老师", credit: 3 },
  { id: 4, name: "数据结构", teacher: "吴老师", credit: 4 },
  { id: 5, name: "数据库原理", teacher: "郑老师", credit: 3 },
  { id: 6, name: "Web前端开发", teacher: "周老师", credit: 3 },
  { id: 7, name: "软件工程", teacher: "王老师", credit: 3 },
  { id: 8, name: "人工智能导论", teacher: "陈老师", credit: 2 }
];

const months = ["2026-02", "2026-03", "2026-04"];
const classBase = { "计科一班": 86, "计科二班": 78, "软件一班": 82, "软件二班": 84 };
const courseWeight = { 1: -1, 2: 3, 3: -3, 4: 1, 5: 2, 6: 4, 7: 0, 8: 2 };
const grades = [];

students.forEach((student) => {
  courses.forEach((course) => {
    months.forEach((month, monthIndex) => {
      const raw = classBase[student.class_name] + courseWeight[course.id] + monthIndex * 2 + ((student.id * 7 + course.id * 5 + monthIndex * 3) % 13) - 6;
      grades.push({
        id: grades.length + 1,
        student_id: student.id,
        course_id: course.id,
        exam_month: month,
        score: Math.max(52, Math.min(99, raw))
      });
    });
  });
});

function round(value) {
  return Math.round(value * 100) / 100;
}

function avg(items) {
  return items.length ? items.reduce((sum, item) => sum + item, 0) / items.length : 0;
}

function studentById(id) {
  return students.find((item) => item.id === id);
}

function courseById(id) {
  return courses.find((item) => item.id === id);
}

function filteredGrades(params) {
  return grades.filter((item) => {
    const student = studentById(item.student_id);
    return (!params.className || student.class_name === params.className)
      && (!params.courseId || String(item.course_id) === String(params.courseId))
      && (!params.month || item.exam_month === params.month);
  });
}

function overview(params) {
  const rows = filteredGrades(params);
  const scores = rows.map((item) => item.score);
  const studentIds = new Set(rows.map((item) => item.student_id));
  const courseIds = new Set(rows.map((item) => item.course_id));
  const lowScoresByClass = {};
  rows.filter((item) => item.score < 60).forEach((item) => {
    const className = studentById(item.student_id).class_name;
    lowScoresByClass[className] = (lowScoresByClass[className] || 0) + 1;
  });
  const focusClass = Object.entries(lowScoresByClass).sort((a, b) => b[1] - a[1])[0]?.[0] || "暂无";

  return {
    studentCount: studentIds.size,
    courseCount: courseIds.size,
    averageScore: round(avg(scores)),
    highestScore: scores.length ? Math.max(...scores) : 0,
    excellentRate: rows.length ? round((rows.filter((item) => item.score >= 90).length * 100) / rows.length) : 0,
    passRate: rows.length ? round((rows.filter((item) => item.score >= 60).length * 100) / rows.length) : 0,
    focusClass,
    updateTime: new Date().toLocaleString("zh-CN")
  };
}

function classesData(params) {
  const grouped = {};
  filteredGrades(params).forEach((item) => {
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

function coursesData(params) {
  const rows = filteredGrades(params);
  return courses
    .map((course) => {
      const scores = rows.filter((item) => item.course_id === course.id).map((item) => item.score);
      if (!scores.length) return null;
      return {
        courseName: course.name,
        avgScore: round(avg(scores)),
        maxScore: Math.max(...scores),
        minScore: Math.min(...scores)
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.avgScore - a.avgScore);
}

function trendsData(params) {
  const grouped = {};
  filteredGrades(params).forEach((item) => {
    grouped[item.exam_month] ||= [];
    grouped[item.exam_month].push(item.score);
  });

  return Object.entries(grouped)
    .map(([month, scores]) => ({ month, avgScore: round(avg(scores)) }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function filtersData() {
  return {
    classes: [...new Set(students.map((item) => item.class_name))].sort().map((className) => ({ className })),
    courses: courses.map((item) => ({ courseId: item.id, courseName: item.name })),
    months: months.map((month) => ({ month }))
  };
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
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const urlPath = decodeURIComponent(requestUrl.pathname);
  const params = Object.fromEntries(requestUrl.searchParams.entries());
  if (urlPath === "/health") {
    return sendJson(res, {
      status: "ok",
      database: "fallback-memory",
      counts: { students: students.length, courses: courses.length, grades: grades.length },
      timestamp: new Date().toISOString()
    });
  }
  if (urlPath === "/api/filters") return sendJson(res, filtersData());
  if (urlPath === "/api/overview") return sendJson(res, overview(params));
  if (urlPath === "/api/classes") return sendJson(res, classesData(params));
  if (urlPath === "/api/courses") return sendJson(res, coursesData(params));
  if (urlPath === "/api/trends") return sendJson(res, trendsData(params));
  return sendStatic(res, urlPath);
});

server.listen(PORT, () => {
  console.log(`Campus score dashboard is running at http://localhost:${PORT}`);
  console.log("Using dependency-free local server with in-memory demo data.");
});
