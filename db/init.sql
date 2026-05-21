DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  gender TEXT NOT NULL,
  class_name TEXT NOT NULL,
  grade_name TEXT NOT NULL
);

CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  teacher TEXT NOT NULL,
  credit INTEGER NOT NULL
);

CREATE TABLE grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  exam_month TEXT NOT NULL,
  score REAL NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

INSERT INTO students (name, gender, class_name, grade_name) VALUES
('张晨', '男', '计科一班', '2023级'),
('李雨欣', '女', '计科一班', '2023级'),
('王浩', '男', '计科二班', '2023级'),
('赵敏', '女', '计科二班', '2023级'),
('陈宇', '男', '软件一班', '2023级'),
('周悦', '女', '软件一班', '2023级'),
('刘思远', '男', '软件二班', '2023级'),
('何佳怡', '女', '软件二班', '2023级');

INSERT INTO courses (name, teacher, credit) VALUES
('高等数学', '刘老师', 4),
('程序设计', '黄老师', 4),
('大学英语', '孙老师', 3),
('数据结构', '吴老师', 4),
('数据库原理', '郑老师', 3);

INSERT INTO grades (student_id, course_id, exam_month, score) VALUES
(1,1,'2026-02',88),(1,2,'2026-02',94),(1,3,'2026-02',81),(1,4,'2026-02',90),(1,5,'2026-02',87),
(2,1,'2026-02',91),(2,2,'2026-02',96),(2,3,'2026-02',89),(2,4,'2026-02',92),(2,5,'2026-02',90),
(3,1,'2026-02',76),(3,2,'2026-02',82),(3,3,'2026-02',73),(3,4,'2026-02',79),(3,5,'2026-02',78),
(4,1,'2026-02',69),(4,2,'2026-02',74),(4,3,'2026-02',66),(4,4,'2026-02',71),(4,5,'2026-02',70),
(5,1,'2026-02',85),(5,2,'2026-02',87),(5,3,'2026-02',80),(5,4,'2026-02',84),(5,5,'2026-02',89),
(6,1,'2026-02',58),(6,2,'2026-02',63),(6,3,'2026-02',72),(6,4,'2026-02',61),(6,5,'2026-02',67),
(7,1,'2026-02',82),(7,2,'2026-02',86),(7,3,'2026-02',76),(7,4,'2026-02',83),(7,5,'2026-02',85),
(8,1,'2026-02',93),(8,2,'2026-02',95),(8,3,'2026-02',91),(8,4,'2026-02',94),(8,5,'2026-02',92),
(1,1,'2026-03',90),(2,1,'2026-03',93),(3,1,'2026-03',79),(4,1,'2026-03',72),
(5,1,'2026-03',88),(6,1,'2026-03',65),(7,1,'2026-03',84),(8,1,'2026-03',95),
(1,1,'2026-04',92),(2,1,'2026-04',94),(3,1,'2026-04',81),(4,1,'2026-04',75),
(5,1,'2026-04',90),(6,1,'2026-04',68),(7,1,'2026-04',86),(8,1,'2026-04',96);
