# MSlides

[English](README.md) · **ภาษาไทย**

[![smoke](https://github.com/JiramedFirst/MSlides/actions/workflows/smoke.yml/badge.svg)](https://github.com/JiramedFirst/MSlides/actions/workflows/smoke.yml)

Plugin สำหรับ Claude Code ที่ทำคู่มือการใช้งานเว็บแอปเป็นสไลด์ จับหน้าจอแต่ละหน้าด้วย Playwright วาดกรอบหมายเลขตามขั้นตอน
แล้วสร้างไฟล์ PPTX ที่แก้ต่อได้ (และ PDF) แยกตาม role

[![เดโม 24 วินาที: สั่ง Claude แล้วได้ภาพหน้าจอพร้อมกรอบหมายเลข และเปิดสไลด์ที่ได้](docs/images/demo.gif)](https://github.com/JiramedFirst/MSlides/releases/download/v1.1.0/MSlides-demo.mp4)

![สไลด์ขั้นตอนสองหน้าจากคู่มือตัวอย่าง](docs/images/hero.png)

## ติดตั้ง

```
/plugin marketplace add JiramedFirst/MSlides
/plugin install mslides@mslides
```

อยากได้เป็นวิดีโอสอนแทนสไลด์ ใช้ [TVideo](https://github.com/JiramedFirst/TVideo) ตัวพี่น้องกัน

## ใช้งาน

เปิดแอปในเครื่องพร้อมบัญชีทดสอบ role ละหนึ่งบัญชี แล้วสั่ง Claude เช่น

> ทำคู่มือการใช้งานสำหรับ role Viewer และ Editor ของแอปที่ localhost:3000

Claude อ่านโค้ดเพื่อหางานแต่ละอย่างและข้อความบน UI ที่ถูกต้อง แสดงรายการงานให้ดูก่อน แล้วจับหน้าจอ สร้างสไลด์ และตรวจหน้าที่ render ออกมา
ผลลัพธ์อยู่ที่ `<workspace>/out/`: PPTX ที่แก้ได้หนึ่งไฟล์ต่อหนึ่งฉบับ, PDF คู่กัน และถ้าใส่ `--md` จะได้ฉบับ Markdown
(ภาพครอปพร้อมกรอบหมายเลข) สำหรับ wiki

ภายหลังสั่งให้อัปเดตคู่มือหลัง UI เปลี่ยน หรือแก้สไลด์เฉพาะหน้าได้ ("เปลี่ยนขั้นที่ 2 ใน editor-02")

## สิ่งที่ต้องมี

- Python 3.10+ และ Node 18+ คำสั่ง `python3 <skill>/scripts/setup.py <workspace>` ติดตั้งที่เหลือให้: venv พร้อม package ของ skill,
  Playwright + chromium ใน workspace (ทำเอง: `npm i -D playwright && npx playwright install chromium`)
- ตัว render PDF (ไม่บังคับ) รองรับ macOS, Linux และ Windows:

| | bash (macOS / Linux) | PowerShell (Windows) |
|---|---|---|
| ตั้งรหัสผ่าน | `export MANUAL_PW_VIEWER='…'` | `$env:MANUAL_PW_VIEWER='…'` |
| ตัว render PDF | Keynote (macOS), LibreOffice (Linux) | PowerPoint หรือ LibreOffice |

## รหัสผ่าน

การจับหน้าจออ่านรหัสผ่านจาก environment variable เท่านั้น (`MANUAL_PW_<ROLE>`; `MANUAL_PW` ใช้เมื่อไม่มีแบบแยก role)
ไม่เขียนลงไฟล์และไม่พิมพ์ออกมา

จะไม่จับหน้าจอจาก host ที่ไม่ใช่ loopback เว้นแต่ใส่ไว้ใน `capture.allow_hosts` อย่าชี้ไปที่ production
ภาพหน้าจอระบบภายในอาจเป็นความลับ ดูแลไฟล์สไลด์ตามนั้น

## เดโม

`examples/demo-app/` เป็นแอปเล็ก ๆ แบบ static และ `examples/demo/` เก็บคู่มือที่จับจากแอปนี้

| สไลด์ขั้นตอน | ฟอร์ม | ตารางอ้างอิง |
|---|---|---|
| ![](docs/images/viewer-task.png) | ![](docs/images/editor-form.png) | ![](docs/images/reference-table.png) |

Smoke test เปิดแอปเดโม เล่นการจับหน้าจอซ้ำ สร้างทุกฉบับ (PDF + Markdown และฉบับธีมมืด) แล้วตรวจผล เป็น script เดียวกับที่ CI รันบน
Ubuntu และ Windows:

```bash
PYTHON=.venv/bin/python NODE_PATH=/path/to/node_modules python tests/smoke.py
```

## License

MIT
