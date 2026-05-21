const express = require("express");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "db", "school.db");
const initSqlPath = path.join(__dirname, "db", "init.sql");
const db = new sqlite3.Database(dbPath);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function filterClause(req, alias = "grades") {
  const conditions = [];
  const params = [];
  if (req.query.className) {
    conditions.push("students.class_name = ?");
    params.push(req.query.className);
  }
  if (req.query.courseId) {
    conditions.push(`${alias}.course_id = ?`);
    params.push(req.query.courseId);
  }
  if (req.query.month) {
    conditions.push(`${alias}.exam_month = ?`);
    params.push(req.query.month);
  }
  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params
  };
}

async function tableCounts() {
  const [students, courses, grades] = await Promise.all([
    get("SELECT COUNT(*) AS count FROM students"),
    get("SELECT COUNT(*) AS count FROM courses"),
    get("SELECT COUNT(*) AS count FROM grades")
  ]);

  return {
    students: students.count,
    courses: courses.count,
    grades: grades.count
  };
}

async function ensureDatabase() {
  const expectedTables = ["students", "courses", "grades"];
  const rows = await query(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name IN (${expectedTables.map(() => "?").join(",")})`,
    expectedTables
  );
  const hasAllTables = rows.length === expectedTables.length;

  if (hasAllTables) {
    const counts = await tableCounts();
    if (counts.students > 0 && counts.courses > 0 && counts.grades > 0) return counts;
  }

  const initSql = fs.readFileSync(initSqlPath, "utf-8");
  await exec(initSql);
  return tableCounts();
}

app.get("/health", async (req, res) => {
  try {
    const counts = await tableCounts();
    res.json({
      status: "ok",
      database: "ready",
      counts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "unavailable",
      message: error.message
    });
  }
});

app.get("/api/filters", async (req, res) => {
  try {
    const [classes, courses, months] = await Promise.all([
      query("SELECT DISTINCT class_name AS className FROM students ORDER BY class_name"),
      query("SELECT id AS courseId, name AS courseName FROM courses ORDER BY id"),
      query("SELECT DISTINCT exam_month AS month FROM grades ORDER BY exam_month")
    ]);
    res.json({ classes, courses, months });
  } catch (error) {
    res.status(500).json({ message: "筛选项查询失败", detail: error.message });
  }
});

app.get("/api/overview", async (req, res) => {
  try {
    const filter = filterClause(req);
    const [overview] = await query(`
      SELECT
        COUNT(DISTINCT students.id) AS studentCount,
        COUNT(DISTINCT courses.id) AS courseCount,
        ROUND(AVG(grades.score), 2) AS averageScore,
        MAX(grades.score) AS highestScore,
        ROUND(SUM(CASE WHEN grades.score >= 90 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS excellentRate,
        ROUND(SUM(CASE WHEN grades.score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS passRate
      FROM grades
      JOIN students ON grades.student_id = students.id
      JOIN courses ON grades.course_id = courses.id
      ${filter.where}
    `, filter.params);

    const [riskClass] = await query(`
      SELECT students.class_name AS className, COUNT(*) AS lowScoreCount
      FROM grades
      JOIN students ON grades.student_id = students.id
      JOIN courses ON grades.course_id = courses.id
      ${filter.where ? `${filter.where} AND grades.score < 60` : "WHERE grades.score < 60"}
      GROUP BY students.class_name
      ORDER BY lowScoreCount DESC
      LIMIT 1
    `, filter.params);

    res.json({
      studentCount: overview.studentCount || 0,
      courseCount: overview.courseCount || 0,
      averageScore: overview.averageScore || 0,
      highestScore: overview.highestScore || 0,
      excellentRate: overview.excellentRate || 0,
      passRate: overview.passRate || 0,
      focusClass: riskClass?.className || "暂无",
      updateTime: new Date().toLocaleString("zh-CN")
    });
  } catch (error) {
    res.status(500).json({ message: "总览数据查询失败", detail: error.message });
  }
});

app.get("/api/classes", async (req, res) => {
  try {
    const filter = filterClause(req);
    const rows = await query(`
      SELECT
        students.class_name AS className,
        ROUND(AVG(grades.score), 2) AS avgScore,
        ROUND(SUM(CASE WHEN grades.score >= 90 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS excellentRate,
        ROUND(SUM(CASE WHEN grades.score >= 60 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS passRate
      FROM grades
      JOIN students ON grades.student_id = students.id
      JOIN courses ON grades.course_id = courses.id
      ${filter.where}
      GROUP BY students.class_name
      ORDER BY avgScore DESC
    `, filter.params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "班级数据查询失败", detail: error.message });
  }
});

app.get("/api/courses", async (req, res) => {
  try {
    const filter = filterClause(req);
    const rows = await query(`
      SELECT
        courses.name AS courseName,
        ROUND(AVG(grades.score), 2) AS avgScore,
        MAX(grades.score) AS maxScore,
        MIN(grades.score) AS minScore
      FROM grades
      JOIN courses ON grades.course_id = courses.id
      JOIN students ON grades.student_id = students.id
      ${filter.where}
      GROUP BY courses.name
      ORDER BY avgScore DESC
    `, filter.params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "课程数据查询失败", detail: error.message });
  }
});

app.get("/api/trends", async (req, res) => {
  try {
    const filter = filterClause(req);
    const rows = await query(`
      SELECT exam_month AS month, ROUND(AVG(score), 2) AS avgScore
      FROM grades
      JOIN students ON grades.student_id = students.id
      JOIN courses ON grades.course_id = courses.id
      ${filter.where}
      GROUP BY exam_month
      ORDER BY exam_month
    `, filter.params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "趋势数据查询失败", detail: error.message });
  }
});

ensureDatabase()
  .then((counts) => {
    app.listen(PORT, () => {
      console.log(`Campus score dashboard is running at http://localhost:${PORT}`);
      console.log(`SQLite ready: students=${counts.students}, courses=${counts.courses}, grades=${counts.grades}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
