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
('王浩', '男', '计科一班', '2023级'),
('赵敏', '女', '计科一班', '2023级'),
('陈宇', '男', '计科一班', '2023级'),
('周悦', '女', '计科一班', '2023级'),
('刘思远', '男', '计科一班', '2023级'),
('何佳怡', '女', '计科一班', '2023级'),
('孙博文', '男', '计科二班', '2023级'),
('林可欣', '女', '计科二班', '2023级'),
('郭子航', '男', '计科二班', '2023级'),
('唐诗雨', '女', '计科二班', '2023级'),
('马俊杰', '男', '计科二班', '2023级'),
('罗嘉怡', '女', '计科二班', '2023级'),
('许明轩', '男', '计科二班', '2023级'),
('邓雅琪', '女', '计科二班', '2023级'),
('曹睿', '男', '软件一班', '2023级'),
('韩若琳', '女', '软件一班', '2023级'),
('梁启航', '男', '软件一班', '2023级'),
('谢安琪', '女', '软件一班', '2023级'),
('朱一鸣', '男', '软件一班', '2023级'),
('郑嘉宁', '女', '软件一班', '2023级'),
('沈泽宇', '男', '软件一班', '2023级'),
('蒋雨桐', '女', '软件一班', '2023级'),
('程浩然', '男', '软件二班', '2023级'),
('叶欣然', '女', '软件二班', '2023级'),
('黄子墨', '男', '软件二班', '2023级'),
('袁思涵', '女', '软件二班', '2023级'),
('冯逸凡', '男', '软件二班', '2023级'),
('秦梦瑶', '女', '软件二班', '2023级'),
('潘宇辰', '男', '软件二班', '2023级'),
('顾佳音', '女', '软件二班', '2023级');

INSERT INTO courses (name, teacher, credit) VALUES
('高等数学', '刘老师', 4),
('程序设计', '黄老师', 4),
('大学英语', '孙老师', 3),
('数据结构', '吴老师', 4),
('数据库原理', '郑老师', 3),
('Web前端开发', '周老师', 3),
('软件工程', '王老师', 3),
('人工智能导论', '陈老师', 2);

WITH
  months(exam_month, month_index) AS (
    VALUES ('2026-02', 0), ('2026-03', 1), ('2026-04', 2)
  ),
  class_base(class_name, base_score) AS (
    VALUES ('计科一班', 86), ('计科二班', 78), ('软件一班', 82), ('软件二班', 84)
  ),
  course_weight(course_id, weight_score) AS (
    VALUES (1, -1), (2, 3), (3, -3), (4, 1), (5, 2), (6, 4), (7, 0), (8, 2)
  )
INSERT INTO grades (student_id, course_id, exam_month, score)
SELECT
  students.id,
  courses.id,
  months.exam_month,
  MAX(52, MIN(99,
    class_base.base_score
    + course_weight.weight_score
    + months.month_index * 2
    + ((students.id * 7 + courses.id * 5 + months.month_index * 3) % 13) - 6
  )) AS score
FROM students
CROSS JOIN courses
CROSS JOIN months
JOIN class_base ON class_base.class_name = students.class_name
JOIN course_weight ON course_weight.course_id = courses.id;
