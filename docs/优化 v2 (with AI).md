## 一、前端优化

1. 异步上传与任务队列
   - 用户发起上传后，前端将任务推入本地队列，依次执行异步请求。
   - 可选方案：
     - 浏览器存储：利用 IndexedDB 或 localStorage 持久化队列，刷新或重开浏览器后依然可续传。
     - 后端排队：前端只提交任务元信息（如文件 ID、分片信息），后端统一排队调度，前端只需跟踪状态。
2. 思考点
   - 持久化：关闭浏览器后保证未完成任务的恢复
   - 可视化：向用户展示当前队列长度
   - 重试机制：上传失败后如何重试
   - 上传优化：支持分片上传和上传到对象存储

## 二、后端优化

### 1. 大文件缓存

方案：将原始大文件或热点 JSON 内容缓存在 Redis，前端预览时直接从缓存读取，降低数据库和磁盘 I/O 压力。

缓存策略：
设置合理的 TTL；
按访问频次采用 LRU 或 LFU 淘汰缓存；
超大文件考虑上传到对象存储

### 2. 无引用副本清除

- 方案：json_files.ref_count 记录引用数；当减到 0，标记为“待删除”；由定时任务扫描并清理文件和缓存。
- 定时任务：可考虑分批扫描、分页删除，并记录进度，避免一次性长时间锁表或阻塞 I/O。

### 3. ref_count 并发更新

- 问题：两个并发事务同时读取并自增，导致一次更新丢失。

方案：

1. 原子更新

```sql
UPDATE json_files SET ref_count = ref_count + 1 WHERE id = :file_id;
```

2. 悲观锁

```sql
-- 添加引用
BEGIN TRANSACTION;
SELECT ref_count FROM json_files WHERE id = ? FOR UPDATE;
UPDATE json_files SET ref_count = ref_count + 1 WHERE id = ?;
COMMIT;

-- 删除引用
BEGIN TRANSACTION;
SELECT ref_count FROM json_files WHERE id = ? FOR UPDATE;
UPDATE json_files SET ref_count = ref_count - 1 WHERE id = ?;
COMMIT;
```

3. 乐观锁

添加 version 字段

```sql
-- 添加version字段到json_files表
ALTER TABLE json_files ADD COLUMN version INT DEFAULT 0;

-- 更新引用计数
BEGIN TRANSACTION;
SELECT ref_count, version FROM json_files WHERE id = ?;
UPDATE json_files
SET ref_count = ref_count + 1, version = version + 1
WHERE id = ? AND version = ?;
-- 检查影响的行数，如果为0则重试
COMMIT;
```
