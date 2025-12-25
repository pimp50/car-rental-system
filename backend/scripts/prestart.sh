#! /usr/bin/env bash

set -e
set -x

# 让数据库启动（SQLite不需要等待）
python app/backend_pre_start.py

# 注释掉Alembic迁移（SQLite使用自动建表）
# alembic upgrade head

# 创建初始数据
python app/initial_data.py