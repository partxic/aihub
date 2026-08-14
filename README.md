# aihub

Cloudflare Worker 上的 AI 聚合器

## 部署步骤

1. 打开 wrangler.jsonc 修改

```jsonc
    "d1_databases": [
        {
            "binding": "db",
            "database_name": "aihub-db",
            "database_id": "<D1 数据库 ID>",
            "remote": true
        }
    ]
```

2. 打开 init-db.sql 并在 D1 中执行

3. 转到 Workers 和 Pages > 你的 Worker 名字 > 变量和机密, 添加如下变量 (类型选密钥)

> - jwt_secret: 用于加密 token 的密钥

4. 在 worker 中部署

## 后台登录

初始用户和密码为 `admin`, 登录后在后台修改默认密码
