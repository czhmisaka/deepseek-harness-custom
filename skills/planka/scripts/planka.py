#!/usr/bin/env python3
"""
Planka 任务管理 Tool
支持：
- 默认操作"每周任务总览"项目的最新看板
- 创建新的周看板（看板+四个列表）
- 生成周报
- 权限控制（仅创建者可修改/删除）
"""
import httpx
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime

# ========== 配置 ==========
SKILL_DIR = Path(__file__).parent
CONFIG_FILE = SKILL_DIR / "config.json"
PLAANKA_BASE = "https://planka.zj.cool"

DEFAULT_PROJECT_NAME = "每周任务总览"
DEFAULT_LISTS = [
    "📋 昨日完成",
    "📌 今日计划", 
    "🤝 需要协调",
    "✅ 本周完成"
]

# ========== 配置管理 ==========
def load_config() -> dict:
    if CONFIG_FILE.exists():
        with open(CONFIG_FILE) as f:
            return json.load(f)
    return {}

def save_config(config: dict):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2, ensure_ascii=False)

def update_config(api_key: str = None, board_id: str = None, project_id: str = None):
    config = load_config()
    if api_key:
        config["api_key"] = api_key
    if board_id:
        config["board_id"] = board_id
    if project_id:
        config["project_id"] = project_id
    save_config(config)

# ========== Planka API 客户端 ==========
class PlankaTool:
    """Planka 任务管理工具"""
    
    def __init__(self, api_key: str = None, board_id: str = None):
        config = load_config()
        self.api_key = api_key or config.get("api_key")
        self.board_id = board_id or config.get("board_id")
        self.project_id = config.get("project_id")
        
        if not self.api_key:
            raise ValueError("未配置 API Key，请先调用 update_config(api_key='你的Key')")
        
        self.base = PLAANKA_BASE
        self.client = httpx.Client(timeout=30.0, follow_redirects=True, trust_env=False, verify=False)
    
    def close(self):
        self.client.close()
    
    def _headers(self) -> dict:
        return {"X-API-Key": self.api_key, "Content-Type": "application/json"}
    
    def _request(self, method: str, path: str, **kwargs) -> dict:
        url = f"{self.base}{path}"
        resp = self.client.request(method, url, headers=self._headers(), **kwargs)
        
        if resp.status_code >= 400:
            raise ValueError(f"API 请求失败 ({resp.status_code}): {resp.text}")
        
        if resp.headers.get("content-type", "").startswith("application/json"):
            return resp.json()
        return {}
    
    # ========== 用户信息 ==========
    def get_me(self) -> dict:
        data = self._request("GET", "/api/users/me")
        return data.get("item", {})
    
    def get_user_id(self) -> str:
        return self.get_me().get("id", "")
    
    def get_user_name(self) -> str:
        me = self.get_me()
        return me.get("name") or me.get("email", "未知用户")
    
    # ========== 项目操作 ==========
    def get_projects(self) -> List[dict]:
        """获取所有项目"""
        data = self._request("GET", "/api/projects")
        return data.get("items", [])
    
    def find_project_by_name(self, name: str) -> Optional[dict]:
        """根据名称查找项目"""
        projects = self.get_projects()
        for p in projects:
            if name in p.get("name", ""):
                return p
        return None
    
    def get_default_project(self) -> dict:
        """获取默认项目（每周任务总览）"""
        project = self.find_project_by_name(DEFAULT_PROJECT_NAME)
        if project:
            return project
        # 如果没找到，返回第一个项目
        projects = self.get_projects()
        if projects:
            return projects[0]
        raise ValueError(f"未找到项目: {DEFAULT_PROJECT_NAME}")
    
    # ========== 看板操作 ==========
    def get_boards(self, project_id: str = None) -> List[dict]:
        """获取项目下的所有看板"""
        if project_id is None:
            project_id = self.project_id
        if project_id is None:
            project = self.get_default_project()
            project_id = project.get("id")
        
        data = self._request("GET", f"/api/projects/{project_id}/boards")
        return data.get("items", [])
    
    def get_latest_board(self, project_id: str = None) -> dict:
        """获取最新的看板"""
        boards = self.get_boards(project_id)
        if not boards:
            raise ValueError(f"项目下没有看板，请先创建周看板")
        # 按创建时间排序，取最新的
        return sorted(boards, key=lambda x: x.get("createdAt", ""), reverse=True)[0]
    
    def get_board_detail(self, board_id: str = None) -> dict:
        """获取看板详情"""
        bid = board_id or self.board_id
        if not bid:
            # 自动获取最新看板
            board = self.get_latest_board()
            bid = board.get("id")
            self.board_id = bid
        return self._request("GET", f"/api/boards/{bid}")
    
    def create_board(self, name: str, project_id: str = None) -> dict:
        """创建看板"""
        if project_id is None:
            project = self.get_default_project()
            project_id = project.get("id")
        
        data = self._request(
            "POST",
            f"/api/projects/{project_id}/boards",
            json={"name": name, "position": 65536}
        )
        return data.get("item", {})
    
    # ========== 列表操作 ==========
    def get_lists(self, board_id: str = None) -> List[dict]:
        """获取看板的所有列表"""
        detail = self.get_board_detail(board_id)
        return detail.get("included", {}).get("lists", [])
    
    def create_list(self, board_id: str, name: str, position: float = 65536) -> dict:
        """创建列表"""
        data = self._request(
            "POST",
            f"/api/boards/{board_id}/lists",
            json={"type": "active", "name": name, "position": position}
        )
        return data.get("item", {})
    
    def find_list_by_name(self, name_keyword: str, board_id: str = None) -> Optional[dict]:
        """根据名称关键词查找列表"""
        lists = self.get_lists(board_id)
        for lst in lists:
            if name_keyword in lst.get("name", ""):
                return lst
        return None
    
    # ========== 创建周看板 ==========
    def create_weekly_board(self, board_name: str = None) -> dict:
        """
        创建新的周看板（包含四个默认列表）
        
        Args:
            board_name: 看板名称，默认"X月X日-X月X日"
        
        Returns:
            {"board": {...}, "lists": [...]}
        """
        if board_name is None:
            # 自动生成名称：下周一到下周五
            today = datetime.now()
            # 计算下周一
            days_until_monday = (7 - today.weekday()) % 7
            if days_until_monday == 0:
                days_until_monday = 7
            from datetime import timedelta
            next_monday = today + timedelta(days=days_until_monday)
            next_friday = next_monday + timedelta(days=4)
            board_name = f"{next_monday.month}月{next_monday.day}日-{next_friday.month}月{next_friday.day}日"
        
        # 创建看板
        board = self.create_board(board_name)
        board_id = board.get("id")
        
        # 创建四个默认列表
        lists = []
        for i, name in enumerate(DEFAULT_LISTS):
            lst = self.create_list(board_id, name, position=(i + 1) * 65536)
            lists.append(lst)
        
        # 自动切换到新看板
        self.board_id = board_id
        update_config(board_id=board_id)
        
        return {
            "board": board,
            "lists": lists
        }
    
    # ========== 卡片操作 ==========
    def get_cards(self, board_id: str = None) -> List[dict]:
        """获取看板的所有卡片"""
        detail = self.get_board_detail(board_id)
        return detail.get("included", {}).get("cards", [])
    
    def create_card(self, list_id: str, name: str, position: float = 65536) -> dict:
        """创建任务"""
        data = self._request(
            "POST",
            f"/api/lists/{list_id}/cards",
            json={"type": "project", "name": name, "position": position}
        )
        return data.get("item", {})
    
    def update_card(self, card_id: str, name: str = None, description: str = None) -> dict:
        """更新任务（仅创建者可操作）"""
        self._check_permission(card_id, "update")
        
        payload = {}
        if name: payload["name"] = name
        if description: payload["description"] = description
        
        data = self._request("PATCH", f"/api/cards/{card_id}", json=payload)
        return data.get("item", {})
    
    def move_card(self, card_id: str, target_list_id: str, position: float = 65536) -> dict:
        """移动任务（仅创建者可操作）"""
        self._check_permission(card_id, "move")
        
        data = self._request(
            "PATCH",
            f"/api/cards/{card_id}",
            json={"listId": target_list_id, "position": position}
        )
        return data.get("item", {})
    
    def delete_card(self, card_id: str) -> bool:
        """删除任务（仅创建者可操作）"""
        self._check_permission(card_id, "delete")
        self._request("DELETE", f"/api/cards/{card_id}")
        return True
    
    # ========== 权限检查 ==========
    def _check_permission(self, card_id: str, action: str):
        """检查操作权限"""
        if action in ("create", "read"):
            return
        
        user_id = self.get_user_id()
        cards = self.get_cards()
        
        for card in cards:
            if card["id"] == card_id:
                creator = card.get("creatorUserId")
                if creator and creator != user_id:
                    raise PermissionError(
                        f"无权{action}此任务，只有创建者可以执行"
                    )
                return
        
        raise ValueError(f"任务不存在: {card_id}")
    
    def is_card_creator(self, card_id: str) -> bool:
        """检查当前用户是否是卡片的创建者"""
        user_id = self.get_user_id()
        cards = self.get_cards()
        for card in cards:
            if card["id"] == card_id:
                return card.get("creatorUserId") == user_id
        return False
    
    # ========== 任务摘要 ==========
    def get_summary(self, board_id: str = None) -> dict:
        """获取任务摘要"""
        detail = self.get_board_detail(board_id)
        lists = detail.get("included", {}).get("lists", [])
        cards = detail.get("included", {}).get("cards", [])
        board_name = detail.get("item", {}).get("name", "")
        
        result = {
            "board_name": board_name,
            "board_id": self.board_id or board_id,
            "lists": [],
            "total": len(cards)
        }
        
        for lst in lists:
            if lst.get("name") is None:
                continue
            list_cards = [c for c in cards if c.get("listId") == lst["id"]]
            result["lists"].append({
                "id": lst["id"],
                "name": lst["name"],
                "count": len(list_cards),
                "cards": [
                    {"id": c["id"], "name": c["name"], "creatorUserId": c.get("creatorUserId")}
                    for c in list_cards
                ]
            })
        
        return result
    
    # ========== 周报生成 ==========
    def generate_weekly_report(self, board_id: str = None) -> dict:
        """
        生成详细周报，逐条列出每项任务
        
        Returns:
            {
                "board_name": str,
                "yesterday_done": [...],   # 昨日完成
                "today_plan": [...],       # 今日计划
                "week_done": [...],        # 本周完成
                "blockers": [...],         # 需要协调
                "report_text": str         # 格式化的周报文本
            }
        """
        summary = self.get_summary(board_id)
        
        yesterday_done = []
        today_plan = []
        week_done = []
        blockers = []
        
        for lst in summary["lists"]:
            list_name = lst.get("name", "")
            
            if "本周完成" in list_name or "已完成" in list_name:
                week_done.extend(lst["cards"])
            elif "需要协调" in list_name or "阻塞" in list_name:
                blockers.extend(lst["cards"])
            elif "昨日完成" in list_name:
                yesterday_done.extend(lst["cards"])
            elif "今日计划" in list_name:
                today_plan.extend(lst["cards"])
        
        # 格式化周报（逐条列出）
        user_name = self.get_user_name()
        today = datetime.now().strftime("%Y年%m月%d日")
        
        report_lines = [
            f"📊 {user_name} - 工作周报",
            f"📅 日期: {today}",
            f"📋 看板: {summary['board_name']}",
            "",
            f"✅ 本周完成 ({len(week_done)} 项)",
        ]
        
        if week_done:
            for card in week_done:
                report_lines.append(f"  • {card['name']}")
        else:
            report_lines.append("  （暂无）")
        
        report_lines.extend([
            "",
            f"📌 今日计划 ({len(today_plan)} 项)",
        ])
        
        if today_plan:
            for card in today_plan:
                report_lines.append(f"  • {card['name']}")
        else:
            report_lines.append("  （暂无）")
        
        report_lines.extend([
            "",
            f"📋 昨日完成 ({len(yesterday_done)} 项)",
        ])
        
        if yesterday_done:
            for card in yesterday_done:
                report_lines.append(f"  • {card['name']}")
        else:
            report_lines.append("  （暂无）")
        
        report_lines.extend([
            "",
            f"⚠️ 需要协调 ({len(blockers)} 项)",
        ])
        
        if blockers:
            for card in blockers:
                report_lines.append(f"  • {card['name']}")
        else:
            report_lines.append("  （暂无）")
        
        return {
            "board_name": summary["board_name"],
            "yesterday_done": yesterday_done,
            "today_plan": today_plan,
            "week_done": week_done,
            "blockers": blockers,
            "report_text": "\n".join(report_lines)
        }
    
    # ========== 搜索有权限的看板 ==========
    def get_all_accessible_boards(self) -> List[dict]:
        """获取用户有权限访问的所有看板"""
        data = self._request("GET", "/api/projects")
        return data.get("included", {}).get("boards", [])
    
    def find_card_in_all_boards(self, card_name: str) -> List[dict]:
        """在所有有权限的看板中搜索任务"""
        boards = self.get_all_accessible_boards()
        results = []
        
        for board in boards:
            detail = self.get_board_detail(board["id"])
            cards = detail.get("included", {}).get("cards", [])
            
            for card in cards:
                if card_name.lower() in card.get("name", "").lower():
                    # 找到所属列表
                    lists = detail.get("included", {}).get("lists", [])
                    list_name = ""
                    for lst in lists:
                        if lst["id"] == card.get("listId"):
                            list_name = lst.get("name", "")
                            break
                    
                    results.append({
                        "card": card,
                        "board_name": board.get("name"),
                        "board_id": board.get("id"),
                        "list_name": list_name,
                        "is_mine": card.get("creatorUserId") == self.get_user_id()
                    })
        
        return results
    
    def switch_board(self, board_id: str = None, board_name: str = None):
        """切换当前看板"""
        if board_id:
            self.board_id = board_id
            update_config(board_id=board_id)
            return board_id
        
        if board_name:
            boards = self.get_boards()
            for board in boards:
                if board_name.lower() in board.get("name", "").lower():
                    self.board_id = board.get("id")
                    update_config(board_id=self.board_id)
                    return self.board_id
        
        raise ValueError(f"未找到看板: {board_name or board_id}")


# ========== CLI 入口（用于测试） ==========
if __name__ == "__main__":
    import sys
    
    config = load_config()
    tool = PlankaTool()
    
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        
        if cmd == "configkey":
            if len(sys.argv) > 2:
                update_config(api_key=sys.argv[2])
                print("API Key 已配置")
            else:
                print("用法: planka.py configkey YOUR_API_KEY")
        
        elif cmd == "summary":
            summary = tool.get_summary()
            print(f"\n📋 {summary['board_name']} ({summary['board_id']})")
            print(f"总计: {summary['total']} 个任务\n")
            for lst in summary["lists"]:
                if lst["name"]:
                    print(f"{lst['name']} ({lst['count']}):")
                    for c in lst["cards"]:
                        print(f"  • {c['name']} [{c['id']}]")
                    print()
        
        elif cmd == "lists":
            lists = tool.get_lists()
            print("当前看板列表:")
            for lst in lists:
                if lst.get("name"):
                    print(f"  {lst['name']} [{lst['id']}]")
        
        elif cmd == "boards":
            boards = tool.get_boards()
            print("项目下的看板:")
            for b in boards:
                print(f"  {b['name']} [{b['id']}]")
        
        elif cmd == "me":
            me = tool.get_me()
            print(f"用户: {me.get('name')} ({me.get('email')})")
            print(f"ID: {me.get('id')}")
        
        elif cmd == "create-board":
            name = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else None
            result = tool.create_weekly_board(name)
            board = result["board"]
            print(f"✅ 已创建周看板: {board['name']}")
            print(f"看板ID: {board['id']}")
            for lst in result["lists"]:
                print(f"  + {lst['name']}")
        
        elif cmd == "report":
            report = tool.generate_weekly_report()
            print(report["report_text"])
        
        elif cmd == "search":
            if len(sys.argv) > 2:
                keyword = " ".join(sys.argv[2:])
                results = tool.find_card_in_all_boards(keyword)
                if results:
                    print(f"找到 {len(results)} 个任务:")
                    for r in results:
                        mine = "✓" if r["is_mine"] else "✗"
                        print(f"  {mine} {r['card']['name']} @ {r['board_name']} / {r['list_name']}")
                else:
                    print(f"未找到任务: {keyword}")
            else:
                print("用法: planka.py search '任务名称'")
        
        elif cmd == "switch":
            if len(sys.argv) > 2:
                board_id = tool.switch_board(board_name=" ".join(sys.argv[2:]))
                print(f"已切换到看板: {board_id}")
            else:
                print("用法: planka.py switch '看板名称'")
        
        elif cmd == "help":
            print("""📋 Planka 任务管理

可用命令:
  summary          - 查看任务摘要
  lists            - 查看当前看板的列表
  boards           - 查看项目下的所有看板
  me               - 查看当前用户信息
  search '关键词'   - 搜索所有看板中的任务
  switch '看板名'   - 切换当前看板
  create-board ['名称'] - 创建新的周看板（默认自动命名）
  report           - 生成周报
  
  configkey KEY    - 配置 API Key""")
        else:
            print(f"未知命令: {cmd}")
    else:
        summary = tool.get_summary()
        print(f"📋 {summary['board_name']}")
        print(f"总计: {summary['total']} 个任务")
