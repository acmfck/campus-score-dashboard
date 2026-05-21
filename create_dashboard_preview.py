from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageFilter


BASE = Path(__file__).resolve().parent
OUT = BASE / "screenshots" / "dashboard.png"
FONT_REG = r"C:\Windows\Fonts\NotoSansSC-VF.ttf"
FONT_BOLD = r"C:\Windows\Fonts\simhei.ttf"


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    path = FONT_BOLD if bold and Path(FONT_BOLD).exists() else FONT_REG
    return ImageFont.truetype(path, size=size)


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text(draw, xy, value, size, fill=(238, 248, 255), bold=False, anchor=None):
    draw.text(xy, value, font=font(size, bold), fill=fill, anchor=anchor)


def draw_card(draw, box, title, value, note, accent=(85, 214, 255)):
    x1, y1, x2, y2 = box
    rounded(draw, box, 16, (8, 35, 73, 214), (99, 186, 255, 110), 2)
    draw.line((x1 + 18, y1 + 1, x1 + 92, y1 + 1), fill=accent, width=3)
    text(draw, (x1 + 24, y1 + 20), title, 23, (155, 210, 240))
    text(draw, (x1 + 24, y1 + 62), value, 48, (245, 251, 255), True)
    text(draw, (x1 + 24, y2 - 32), note, 18, (174, 222, 247))
    draw.ellipse((x2 - 74, y1 + 24, x2 - 22, y1 + 76), outline=accent + (150,), width=3)


def draw_bar_panel(draw, box):
    x1, y1, x2, y2 = box
    rounded(draw, box, 16, (8, 35, 73, 220), (99, 186, 255, 110), 2)
    text(draw, (x1 + 24, y1 + 24), "班级排名", 28, bold=True)
    text(draw, (x2 - 24, y1 + 30), "平均分", 18, (155, 210, 240), anchor="ra")
    rows = [("计科一班", 89.08), ("软件二班", 86.96), ("软件一班", 85.03), ("计科二班", 80.95)]
    max_v = max(v for _, v in rows)
    start_y = y1 + 82
    for i, (name, val) in enumerate(rows):
        y = start_y + i * 50
        text(draw, (x1 + 24, y), name, 20, (211, 238, 255))
        track = (x1 + 132, y + 8, x2 - 88, y + 24)
        rounded(draw, track, 8, (255, 255, 255, 24))
        fill_w = int((track[2] - track[0]) * val / max_v)
        rounded(draw, (track[0], track[1], track[0] + fill_w, track[3]), 8, (85, 214, 255, 230))
        text(draw, (x2 - 24, y - 1), f"{val:.2f}", 20, (238, 248, 255), True, "ra")


def draw_course_panel(draw, box):
    x1, y1, x2, y2 = box
    rounded(draw, box, 16, (8, 35, 73, 220), (99, 186, 255, 110), 2)
    text(draw, (x1 + 24, y1 + 24), "课程对比", 28, bold=True)
    text(draw, (x2 - 24, y1 + 30), "平均/区间", 18, (155, 210, 240), anchor="ra")
    rows = [("Web前端开发", 88.53, 78, 99), ("程序设计", 87.58, 77, 99), ("人工智能导论", 86.52, 74, 97), ("数据库原理", 86.42, 74, 98), ("数据结构", 85.43, 73, 95), ("软件工程", 84.53, 73, 96)]
    start_y = y1 + 70
    for i, (name, avg, lo, hi) in enumerate(rows):
        y = start_y + i * 32
        text(draw, (x1 + 24, y), name, 18, (211, 238, 255))
        track = (x1 + 134, y + 8, x2 - 88, y + 20)
        rounded(draw, track, 6, (255, 255, 255, 24))
        left = track[0] + int((track[2] - track[0]) * (lo - 50) / 50)
        right = track[0] + int((track[2] - track[0]) * (hi - 50) / 50)
        rounded(draw, (left, track[1], right, track[3]), 6, (255, 209, 102, 230))
        text(draw, (x2 - 24, y - 2), f"{avg:.2f}", 18, (238, 248, 255), True, "ra")


def draw_trend_panel(draw, box):
    x1, y1, x2, y2 = box
    rounded(draw, box, 16, (8, 35, 73, 220), (99, 186, 255, 110), 2)
    text(draw, (x1 + 24, y1 + 24), "成绩趋势", 28, bold=True)
    text(draw, (x2 - 24, y1 + 30), "月度平均分", 18, (155, 210, 240), anchor="ra")
    values = [("02", 83.52), ("03", 85.47), ("04", 87.52)]
    px1, py1, px2, py2 = x1 + 54, y1 + 86, x2 - 48, y2 - 54
    for i in range(4):
        yy = py1 + i * (py2 - py1) / 3
        draw.line((px1, yy, px2, yy), fill=(70, 119, 160, 110), width=1)
    min_v, max_v = 82, 89
    pts = []
    for i, (_, val) in enumerate(values):
        xx = px1 + i * (px2 - px1) / (len(values) - 1)
        yy = py2 - (val - min_v) / (max_v - min_v) * (py2 - py1)
        pts.append((xx, yy))
    draw.line(pts, fill=(110, 231, 183), width=5, joint="curve")
    for (label, val), (xx, yy) in zip(values, pts):
        draw.ellipse((xx - 7, yy - 7, xx + 7, yy + 7), fill=(255, 209, 102))
        text(draw, (xx, yy - 34), f"{val:.2f}", 18, (238, 248, 255), True, "mm")
        text(draw, (xx, py2 + 28), f"{label}月", 18, (155, 210, 240), anchor="mm")


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", (1440, 900), (6, 20, 37))
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    for cx, cy, r, color in [
        (170, 90, 260, (51, 154, 255, 96)),
        (1260, 80, 230, (24, 214, 255, 58)),
        (1160, 760, 280, (110, 231, 183, 35)),
    ]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color)
    overlay = overlay.filter(ImageFilter.GaussianBlur(32))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(img)

    for x in range(0, 1440, 44):
        draw.line((x, 0, x, 900), fill=(130, 207, 255, 18))
    for y in range(0, 900, 44):
        draw.line((0, y, 1440, y), fill=(130, 207, 255, 18))

    draw.rectangle((0, 0, 1440, 118), fill=(8, 39, 80, 190))
    draw.line((0, 118, 1440, 118), fill=(121, 198, 255, 90), width=2)
    text(draw, (36, 24), "Campus Academic Performance Center", 18, (85, 214, 255))
    text(draw, (36, 52), "校园学生成绩数据大屏", 48, bold=True)
    text(draw, (36, 100), "数据库实时读取 · 后端接口聚合 · 多维筛选分析", 20, (150, 200, 232))
    text(draw, (1404, 42), "2023级教学质量监测", 20, (150, 200, 232), anchor="ra")
    text(draw, (1404, 78), "更新时间 2026/5/21 19:00", 21, (238, 248, 255), True, "ra")

    left, top, gap = 36, 136, 18
    card_w = (1440 - 72 - 2 * gap) // 3
    filter_h = 86
    card_h = 150
    rounded(draw, (left, top, 1440 - left, top + filter_h), 16, (8, 35, 73, 220), (99, 186, 255, 110), 2)
    text(draw, (left + 24, top + 20), "班级筛选", 18, (155, 210, 240))
    text(draw, (left + 24, top + 52), "全部班级", 24, (238, 248, 255), True)
    text(draw, (left + 385, top + 20), "课程筛选", 18, (155, 210, 240))
    text(draw, (left + 385, top + 52), "全部课程", 24, (238, 248, 255), True)
    text(draw, (left + 745, top + 20), "月份筛选", 18, (155, 210, 240))
    text(draw, (left + 745, top + 52), "全部月份", 24, (238, 248, 255), True)
    text(draw, (1404 - 24, top + 52), "支持班级、课程、月份联动分析", 22, (110, 231, 183), True, "ra")
    top = top + filter_h + gap
    values = [
        ("学生总数", "32", "覆盖 4 个行政班", (85, 214, 255)),
        ("课程总数", "8", "核心课程与拓展课程", (85, 214, 255)),
        ("平均分", "85.51", "整体水平稳定", (110, 231, 183)),
        ("最高分", "99", "来自多门优势课程", (85, 214, 255)),
        ("优秀率", "24.48%", "90 分及以上", (85, 214, 255)),
        ("及格率", "100%", "无不及格记录", (255, 209, 102)),
    ]
    for i, item in enumerate(values):
        row, col = divmod(i, 3)
        x1 = left + col * (card_w + gap)
        y1 = top + row * (card_h + gap)
        draw_card(draw, (x1, y1, x1 + card_w, y1 + card_h), *item)

    third_y = top + 2 * (card_h + gap)
    chart_h = 286
    draw_bar_panel(draw, (left, third_y, left + card_w, third_y + chart_h))
    draw_course_panel(draw, (left + card_w + gap, third_y, left + card_w * 2 + gap, third_y + chart_h))
    draw_trend_panel(draw, (left + (card_w + gap) * 2, third_y, left + card_w * 3 + gap * 2, third_y + chart_h))

    img.convert("RGB").save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    main()
