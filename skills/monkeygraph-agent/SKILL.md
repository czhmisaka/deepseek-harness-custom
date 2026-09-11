---
name: monkeygraph-agent
description: MonkeyGraph 知识图谱服务 - 创建和管理图谱、节点、边，进行图算法查询、属性筛选、聚合统计、语义搜索、版本管理
---

# MonkeyGraph Agent

通过 curl + Agent Key 访问 MonkeyGraph 知识图谱服务。

---

## 认证信息

| 配置项 | 值 |
|--------|-----|
| API Key | `f177087ff3e04b5da83b0dbb14b63f1e` |
| API Base | `http://localhost:13001/api/agent` |
| 前端界面 | `http://localhost:13002/agents` |

---

## 快速开始

### 1. 创建 Agent

1. 打开 `http://localhost:13002/agents` 登录账户
2. 点击"**+ 创建 Agent**"按钮
3. 填写名称，点击创建
4. **立即复制 API Key**（只显示一次）

### 2. 开始使用

```javascript
const API_KEY = 'your-api-key';
const API_BASE = 'http://localhost:13001/api/agent';

async function createGraph(name, description) {
  const res = await fetch(`${API_BASE}/graphs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Agent ${API_KEY}`
    },
    body: JSON.stringify({ name, description })
  });
  return await res.json();
}
```

---

## API 端点完整参考

### Agent 管理

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取当前 Agent 信息 | GET | `/api/agent/me` |
| 更新 Agent 信息 | PUT | `/api/agent/me` |
| 轮换 API Key | POST | `/api/agent/rotate-key` |
| 获取配额使用情况 | GET | `/api/agent/quota` |

### 图谱操作

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取图谱列表 | GET | `/api/agent/graphs` |
| 获取图谱详情 | GET | `/api/agent/graphs/:id` |
| **获取图谱概览（轻量）** | **GET** | **/api/agent/graphs/:id/summary** |
| 创建图谱 | POST | `/api/agent/graphs` |
| 删除图谱 | DELETE | `/api/agent/graphs/:id` |
| **获取图谱权限** | **GET** | **/api/agent/graphs/:graphId/permission** |
| **导出全景图谱** | **GET** | **/api/agent/graphs/:id/export** |

### 图谱授权管理

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取已授权 Agent 列表 | GET | `/api/agent/graphs/:graphId/agents` |
| 授权 Agent 访问 | POST | `/api/agent/graphs/:graphId/agents` |
| 更新 Agent 权限 | PUT | `/api/agent/graphs/:graphId/agents/:agentId` |
| 撤销授权 | DELETE | `/api/agent/graphs/:graphId/agents/:agentId` |

### 节点操作

| 功能 | 方法 | 路径 |
|------|------|------|
| **分页获取节点列表** | **GET** | **/api/agent/graphs/:graphId/nodes** |
| 创建节点 | POST | `/api/agent/graphs/:graphId/nodes` |
| 更新单个节点 | PUT | `/api/agent/graphs/:graphId/nodes/:nodeId` |
| 删除单个节点 | DELETE | `/api/agent/graphs/:graphId/nodes/:nodeId` |
| 批量创建节点 | POST | `/api/agent/graphs/:graphId/batch/nodes` |
| 批量更新节点 | PUT | `/api/agent/graphs/:graphId/batch/nodes` |
| **批量删除节点** | **DELETE** | **/api/agent/graphs/:graphId/batch/nodes** |

### 边操作

| 功能 | 方法 | 路径 |
|------|------|------|
| **分页获取边列表** | **GET** | **/api/agent/graphs/:graphId/edges** |
| 批量创建边 | POST | `/api/agent/graphs/:graphId/batch/edges` |

### 图算法

| 功能 | 方法 | 路径 |
|------|------|------|
| 度统计 | GET | `/api/agent/graphs/:id/degrees` |
| 邻居查询 | GET | `/api/agent/graphs/:id/nodes/:nodeId/neighbors` |
| 路径查找 | GET | `/api/agent/graphs/:id/path` |

### 向量检索（语义搜索）

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取 Embedding 状态 | GET | `/api/agent/graphs/:id/embedding/status` |
| 计算所有节点 Embedding | POST | `/api/agent/graphs/:id/embedding/compute` |
| 语义搜索节点 | GET | `/api/agent/graphs/:id/embedding/search` |
| 获取相似节点 | GET | `/api/agent/graphs/:id/embedding/similar/:nodeId` |
| 聚类分析 | POST | `/api/agent/graphs/:id/embedding/cluster` |
| 删除所有 Embedding | DELETE | `/api/agent/graphs/:id/embedding` |

### 检索增强（属性查询与数值排序）

| 功能 | 方法 | 路径 |
|------|------|------|
| 属性筛选+排序查询 | POST | `/api/agent/graphs/:id/nodes/query` |
| Top-N 查询 | GET | `/api/agent/graphs/:id/nodes/top` |
| 排名查询 | POST | `/api/agent/graphs/:id/nodes/rank` |
| 聚合统计 | POST | `/api/agent/graphs/:id/nodes/aggregate` |
| **按类型分组聚合** | **GET** | **/api/agent/graphs/:id/nodes/aggregate/by-type** |
| 字段统计 | GET | `/api/agent/graphs/:id/nodes/field-stats` |

### 版本管理

| 功能 | 方法 | 路径 |
|------|------|------|
| 创建快照 | POST | `/api/agent/graphs/:graphId/snapshot` |
| 获取版本列表 | GET | `/api/agent/graphs/:graphId/versions` |
| 回滚到指定版本 | POST | `/api/agent/graphs/:graphId/rollback` |

### Workspace

| 功能 | 方法 | 路径 |
|------|------|------|
| 创建 Workspace | POST | `/api/agent/workspaces` |
| 获取 Workspace 列表 | GET | `/api/agent/workspaces` |

### 管理员 API（需要 admin 权限）

| 功能 | 方法 | 路径 |
|------|------|------|
| 获取所有图谱 | GET | `/api/agent/admin/graphs` |
| 获取所有 Agent | GET | `/api/agent/admin/agents` |

---

## 节点操作详解

### 如何给节点增加/更新属性

#### 方式一：批量更新节点属性（推荐）

```javascript
async function mg_batch_update_nodes({ graph_id, nodes }) {
  const response = await fetch(`${API_BASE}/graphs/${graph_id}/batch/nodes`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Agent ${API_KEY}`
    },
    body: JSON.stringify({ nodes })
  });
  return await response.json();
}

// 使用示例
const result = await mg_batch_update_nodes({
  graph_id: '图谱ID',
  nodes: [
    {
      id: '节点ID1',
      properties: {
        薪资: '30000元/月',
        部门: '技术部'
      }
    }
  ]
});
```

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodes | array | 是 | 节点列表，每个节点包含 id 和要更新的字段 |

**节点更新字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 节点 ID（必填） |
| label | string | 节点标签/名称 |
| type | string | 节点类型（person/organization/location/concept/event/product/skill/default） |
| properties | object | 节点属性（可添加新属性或更新现有属性） |
| x | number | 节点 X 坐标 |
| y | number | 节点 Y 坐标 |

#### 方式二：单个更新节点属性

```javascript
async function mg_update_node({ graph_id, node_id, updates }) {
  const response = await fetch(`${API_BASE}/graphs/${graph_id}/nodes/${node_id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Agent ${API_KEY}`
    },
    body: JSON.stringify(updates)
  });
  return await response.json();
}
```

#### 方式三：创建节点时直接设置属性

```javascript
const node = await mg_create_node({
  graph_id: '图谱ID',
  label: '新员工',
  type: 'person',
  properties: {
    姓名: '王五',
    职位: '产品经理',
    部门: '产品部'
  }
});
```

**注意：**
- 更新属性时会**合并**现有属性，不会替换整个 properties 对象
- 删除属性：将其值设为 `null`
- 批量更新单次最多支持 500 个节点

---

## 检索增强详解

### 属性筛选 + 排序查询

```bash
curl -X POST http://localhost:13001/api/agent/graphs/{graphId}/nodes/query \
  -H "Authorization: Agent your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "book",
    "filters": [{"field": "评分", "operator": ">=", "value": 8}],
    "sort": {"field": "评分", "order": "desc", "type": "number"},
    "pagination": {"page": 1, "limit": 10}
  }'
```

#### 筛选操作符

| 操作符 | 说明 |
|--------|------|
| `=`, `!=` | 等于/不等于 |
| `>`, `<`, `>=`, `<=` | 比较运算 |
| `contains` | 包含 |
| `startsWith` | 开头匹配 |
| `endsWith` | 结尾匹配 |
| `in` | 在列表中 |
| `exists` | 字段存在 |

#### 数值排序关键点

对于数值字段必须指定 `sort.type: "number"` 或 `"numeric"`：

```json
// ✅ 正确：数值排序 (9.8 > 9.5 > 8.0)
{"sort": {"field": "评分", "order": "desc", "type": "number"}}

// ❌ 错误：字符串排序 (9.8 < 9.5 < 8.0)
{"sort": {"field": "评分", "order": "desc"}}
```

#### Top-N 查询

```bash
curl -X GET "http://localhost:13001/api/agent/graphs/{graphId}/nodes/top?field=评分&order=desc&limit=10" \
  -H "Authorization: Agent your-api-key"
```

#### 按类型分组聚合

```bash
curl -X GET "http://localhost:13001/api/agent/graphs/{graphId}/nodes/aggregate/by-type?field=销售额&operations=sum,avg,count" \
  -H "Authorization: Agent your-api-key"
```

---

## 导出全景图谱

Agent 可以通过接口获取图谱的可视化图片（PNG 格式），样式与前端页面保持一致。

```
GET /api/agent/graphs/:id/export
```

**查询参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| width | number | 否 | 图片宽度，默认 7680 (8K) |
| height | number | 否 | 图片高度，默认 4320 (8K) |
| scale | number | 否 | 缩放比例，默认 1 |

**JavaScript 示例：**

```javascript
async function exportGraphAsPNG({ graphId, width = 7680, height = 4320 }) {
  const response = await fetch(
    `${API_BASE}/graphs/${graphId}/export?width=${width}&height=${height}`,
    {
      headers: { 'Authorization': `Agent ${API_KEY}` },
      responseType: 'blob'
    }
  );

  if (response.ok) {
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    return { success: true, imageUrl, blob };
  }
  return { success: false, error: '导出失败' };
}
```

---

## 响应格式说明

### 成功响应

```json
// 列表接口
{ "data": [...], "total": 10 }

// 批量操作
{ "count": 10, "ids": ["id1", "id2", ...] }

// 单个资源
{ "graph": {...} } 或 { "node": {...} }
```

### 列表接口查询参数

| 参数 | 说明 | 示例 |
|------|------|------|
| `summary` | 摘要模式，只返回核心字段 | `?summary=true` |
| `fields` | 指定返回字段（逗号分隔） | `?fields=id,name` |
| `page` | 页码（默认 1） | `?page=2` |
| `limit` | 每页数量（默认 100，最大 500） | `?limit=50` |

### 错误响应

```json
{
  "error": "错误信息",
  "code": "ERROR_CODE"
}
```

**常见错误代码：**
| 代码 | 说明 |
|------|------|
| `MISSING_NAME` | 缺少必需字段 |
| `GRAPH_NOT_FOUND` | 图谱不存在 |
| `NODE_NOT_FOUND` | 节点不存在 |
| `ACCESS_DENIED` | 权限不足 |
| `ADMIN_REQUIRED` | 需要管理员权限 |
| `BATCH_TOO_LARGE` | 批量大小超限 |
| `EMBEDDING_UNAVAILABLE` | Embedding 服务不可用 |

---

## 节点类型与属性设计

| 类型 | 说明 | 适用场景 |
|------|------|----------|
| `person` | 人物 | 员工、用户、名人 |
| `organization` | 组织 | 公司、部门、团队 |
| `location` | 地点 | 城市、建筑物、办公室 |
| `concept` | 概念 | 抽象知识、术语 |
| `event` | 事件 | 会议、项目、活动 |
| `product` | 产品 | 产品、服务 |
| `skill` | 技能 | 工具、技能、软件 |
| `default` | 默认 | 其他类型 |

---

## 注意事项

1. **API Key 管理**：注册后务必保存 API Key，只返回一次
2. **轮换 Key**：`POST /api/agent/rotate-key` 后旧 Key 立即失效
3. **批量限制**：单次批量操作最多 500 条
4. **配额限制**：默认月度配额 100000 次请求
5. **Embedding 服务**：向量检索需要本地运行 embedding 服务（默认 http://127.0.0.1:1234）
6. **导出图片**：导出接口返回 PNG 格式图片，需要处理 blob 响应

---

## 相关链接

- MonkeyGraph 项目：https://github.com/czhmisaka/monkey_graph
- OpenClaw 项目：https://github.com/openclaw
- 本文档版本：1.4.0
- 更新日期：2026/3/25
