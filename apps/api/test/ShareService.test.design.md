# ShareService 单元测试设计报告

## 1. 概述

本文档描述了 `ShareService` 类的单元测试设计。`ShareService` 用于处理文件共享操作，包括创建共享文件、获取共享文件、删除共享文件、检查文件是否过期以及获取用户文件列表等功能。

## 2. 测试策略

测试采用单元测试方法，使用 Vitest 作为测试框架和 vi 作为模拟工具。测试主要通过以下方式进行：

1. **隔离依赖**：模拟数据库操作和外部依赖（如 UserFileModel、RawJsonModel）
2. **边界值测试**：测试各种边界条件和异常情况
3. **功能测试**：验证各个功能按预期工作
4. **错误处理测试**：验证服务能够正确处理各种错误情况

## 3. 测试用例设计

### 3.1 createSharedFile 方法测试

| 测试用例 ID | 测试场景                   | 预期结果                       | 测试方法                                                      |
| ----------- | -------------------------- | ------------------------------ | ------------------------------------------------------------- |
| CS-01       | 不设置过期时间创建共享文件 | 成功创建共享文件，返回 shareId | `should create a shared file successfully without expiration` |
| CS-02       | 设置过期时间创建共享文件   | 成功创建带有过期时间的共享文件 | `should create a shared file with expiration successfully`    |
| CS-03       | 创建共享文件时发生错误     | 返回错误结果                   | `should handle errors when creating a shared file`            |

**测试要点**：

- 验证文件创建时生成唯一的 shareId
- 验证过期时间计算正确
- 验证 JSON 内容和用户文件记录正确创建
- 验证错误处理机制

### 3.2 getSharedFile 方法测试

| 测试用例 ID | 测试场景             | 预期结果                  | 测试方法                                             |
| ----------- | -------------------- | ------------------------- | ---------------------------------------------------- |
| GS-01       | 获取存在的共享文件   | 成功获取文件内容和元数据  | `should get a shared file successfully`              |
| GS-02       | 获取不存在的共享文件 | 返回 NOT_FOUND 错误       | `should return error when shared file is not found`  |
| GS-03       | 获取已过期的共享文件 | 返回 FILE_EXPIRED 错误    | `should return error when file is expired`           |
| GS-04       | 获取未共享的文件     | 返回 FILE_NOT_SHARED 错误 | `should return error when file is not shared`        |
| GS-05       | 获取内容丢失的文件   | 返回 NOT_FOUND 错误       | `should return error when file content is not found` |

**测试要点**：

- 验证文件存在性检查
- 验证过期检查
- 验证共享状态检查
- 验证内容获取和结果格式

### 3.3 deleteSharedFile 方法测试

| 测试用例 ID | 测试场景                   | 预期结果                               | 测试方法                                                               |
| ----------- | -------------------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| DS-01       | 作为所有者删除共享文件     | 成功删除文件（更新共享状态和引用计数） | `should delete a shared file successfully when user is the owner`      |
| DS-02       | 不指定用户 ID 删除共享文件 | 成功删除文件                           | `should delete a shared file successfully when no user ID is provided` |
| DS-03       | 删除不存在的共享文件       | 返回 NOT_FOUND 错误                    | `should return error when shared file is not found`                    |
| DS-04       | 非所有者删除共享文件       | 返回 FORBIDDEN 错误                    | `should return error when user is not the owner`                       |
| DS-05       | 删除过程中发生错误         | 返回 INTERNAL_ERROR 错误               | `should handle errors during deletion`                                 |

**测试要点**：

- 验证所有权检查
- 验证事务处理
- 验证共享状态更新
- 验证引用计数减少

### 3.4 isExpired 方法测试

| 测试用例 ID | 测试场景             | 预期结果   | 测试方法                                           |
| ----------- | -------------------- | ---------- | -------------------------------------------------- |
| IE-01       | 检查已过期文件       | 返回 true  | `should return true for expired files`             |
| IE-02       | 检查未过期文件       | 返回 false | `should return false for non-expired files`        |
| IE-03       | 检查无过期时间的文件 | 返回 false | `should return false for files without expiration` |
| IE-04       | 检查不存在的文件     | 返回 false | `should return false when file is not found`       |

**测试要点**：

- 验证过期时间计算逻辑
- 验证边界条件处理

### 3.5 getUserFiles 方法测试

| 测试用例 ID | 测试场景               | 预期结果                   | 测试方法                                                 |
| ----------- | ---------------------- | -------------------------- | -------------------------------------------------------- |
| GU-01       | 获取用户所有文件       | 成功返回文件列表和总记录数 | `should get user files successfully`                     |
| GU-02       | 仅获取已过期文件       | 成功返回已过期文件列表     | `should get expired files only when expiredOnly is true` |
| GU-03       | 仅获取已共享文件       | 成功返回已共享文件列表     | `should get shared files only when sharedOnly is true`   |
| GU-04       | 获取文件过程中发生错误 | 返回 INTERNAL_ERROR 错误   | `should handle errors when getting user files`           |

**测试要点**：

- 验证分页功能
- 验证过滤条件（已过期、已共享）
- 验证结果转换和格式

## 4. 测试数据设计

测试数据主要包括：

1. **模拟用户**：测试用户 ID、文件名等
2. **模拟文件内容**：JSON 数据
3. **模拟共享记录**：包括 shareId、过期时间、共享状态等
4. **模拟数据库交互**：模拟 UserFileModel 和 RawJsonModel 的返回结果

这些数据通过 vi.mock() 方法模拟，确保测试的隔离性和可重复性。

## 5. 模拟与依赖隔离

测试中模拟了以下组件：

1. **数据库交互**：模拟 db.transaction 方法，避免实际数据库操作
2. **UserFileModel**：模拟用户文件模型的方法，如 createUserFile, getUserFileByShareId 等
3. **RawJsonModel**：模拟 JSON 内容模型的方法，如 add, getById, decrementRefCount 等
4. **随机 UUID 生成**：模拟 randomUUID 方法，确保测试的可预测性
5. **日期时间**：在需要的测试中模拟 Date.now 方法，控制时间相关的测试

## 6. 测试执行流程

1. **准备阶段（beforeAll）**：

   - 设置所有需要的模拟方法和返回值
   - 准备测试数据

2. **测试执行**：

   - 按功能分组执行测试用例
   - 验证返回结果和预期行为
   - 验证模拟方法是否被正确调用

3. **清理阶段（afterAll）**：
   - 清理所有模拟
   - 恢复环境

## 7. 测试覆盖率目标

测试旨在覆盖 ShareService 类的所有公共方法和主要的执行路径：

- 成功路径：验证正常操作条件下的行为
- 错误路径：验证异常条件下的错误处理
- 边界条件：验证边界值的处理
- 业务逻辑验证：确保业务规则得到正确实施

## 8. 总结与建议

ShareService 的单元测试通过模拟依赖组件，实现了对服务层逻辑的完整测试。这种测试方法确保了业务逻辑的正确性，而不依赖于实际的数据库或外部系统。

### 8.1 潜在改进

1. **集成测试**：添加与真实数据库交互的集成测试
2. **性能测试**：添加针对文件共享服务的性能测试用例
3. **安全测试**：增加更多安全相关的测试场景，如权限验证
4. **模拟恢复**：在每个测试后恢复模拟状态，减少测试间的干扰
