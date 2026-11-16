/* ==========================================================================
   elements.js — 66 UI elements grouped by family, searchable index.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);

  const FAMILIES = [
    {
      key: "window", name: "窗口与导航", en: "Window & Navigation", link: "index.html#layout",
      items: [
        ["窗口", "Window", "默认 1280×800（≤ 工作区 80%），最小 960×600；Win 圆角 8 / macOS 10–12；最大化圆角 0", "打开 240ms 淡入 + 轻微缩放；吸附/最大化动画 167–250ms", "index.html#layout"],
        ["标题栏", "Title Bar", "高 48（Win）/ 52（macOS）；拖拽区整条；双击最大化；按钮 46×32 独立热区", "悬停 180ms；关闭按钮悬停变红（Win）/ 红黄绿（macOS）", "index.html#controls"],
        ["侧栏", "Sidebar", "宽 216–280；行高 40；圆角 10；选中：主色实底 + 白字", "选中切换 180ms；折叠 240ms 宽度过渡", "index.html#controls"],
        ["标签栏", "Tab Bar", "高 40；选中 2px 指示条；2–7 个；切换保留滚动位置", "指示条滑动 240ms emphasized", "components.html"],
        ["工具栏", "Toolbar", "高 44–52；图标 20；分组间距 8/16；溢出收进「更多」", "悬停底色 120ms；溢出菜单 200ms", "index.html#icons"],
        ["菜单栏 / 下拉菜单", "Menu Bar / Menu", "行高 28–32；展开层圆角 8 + 层级 3 阴影；选中打勾；↑↓ Enter Esc 可用", "展开 200ms ease-out；关闭 120ms", "components.html"],
        ["上下文菜单", "Context Menu", "右键 / Shift+F10 触发；项 ≤ 12；危险项分隔并红色", "展开 200ms；点击外部关闭并回焦", "index.html#traps"],
        ["命令面板", "Command Palette", "宽 560–640；居中偏上 12vh；Ctrl/⌘+K；支持模糊搜索与键盘选择", "打开 160ms 淡入 + 上移 8px", "index.html#tools"],
        ["面包屑", "Breadcrumb", "13px；3 层以上出现；末项不可点；分隔符统一", "无动画，仅悬停下划线", "components.html"],
        ["分页", "Pagination", "按钮 32×32；当前页实底；> 7 页折叠为 …", "翻页 150ms 内容淡入", "components.html"],
      ],
    },
    {
      key: "form", name: "表单与输入", en: "Forms & Input", link: "index.html#controls",
      items: [
        ["按钮", "Button", "高 32/40；圆角 8–10（Win 4）；内边距 15–22；文字必须完整包住", "悬停 120–180ms；按压 scale .98；禁用 42% 不透明", "components.html"],
        ["图标按钮", "Icon Button", "视觉 32×32；图标 18–20；热区 ≥ 32（触控 44）", "悬停底色 120ms；按压 80ms", "components.html"],
        ["文本框", "Text Field", "高 32–44；内边距 12；label 12/600；聚焦主色边框 + 3px 光晕", "聚焦 150ms；错误抖动 240ms（可选，勿重复）", "components.html"],
        ["多行文本", "Textarea", "最小 3 行高；可垂直自适应；右下角计数；≥ 200 字显示字数", "高度增长 180ms；不因每键重排", "components.html"],
        ["搜索框", "Search", "高 32–36；左图标；有内容显示清除；输入即结果（防抖 250ms）", "结果更新 150ms；清除按钮淡入", "index.html#controls"],
        ["数字输入", "Number Field", "高 32；步进器 24×24；输入即校验；支持长按连续步进", "步进 100ms；越界钳制无动画", "components.html"],
        ["下拉选择", "Select", "高 32；选项 ≥ 36；选中打勾；↑↓ Enter Esc", "展开 200ms；选中 120ms", "components.html"],
        ["组合框", "ComboBox", "可输入 + 可筛选；空输入显示最近项；无结果给创建入口", "列表过滤即时（< 50ms）", "components.html"],
        ["复选框", "Checkbox", "视觉 17×17；圆角 5；热区 = 整行；支持不确定态", "勾选 120ms；不确定态用横线", "components.html"],
        ["单选组", "Radio Group", "17×17 圆形；2–5 项；必须有默认项；↑↓ 切换", "选中 120ms", "components.html"],
        ["开关", "Switch", "38×22；圆 18；即时生效不配保存；触控热区 ≥ 44", "滑块 120–180ms；颜色同步过渡", "components.html"],
        ["滑块", "Slider", "轨道 4；拇指 20；拖动显示数值；步长取整；键盘 ←→ 可调", "拖动无缓动（跟随手指）；释放回弹轻微", "components.html"],
        ["日期 / 时间选择", "Date & Time Picker", "日历单元 ≥ 32×32；今天有标记；范围选择高亮区间；时区明确", "月份切换 200ms 横滑；弹层 200ms", "components.html"],
        ["上传区", "Drop Zone", "虚线 1.5px；圆角 12；高 ≥ 120；写明格式与大小上限；支持点击 + 拖拽", "拖入高亮 120ms；上传进度实时", "components.html"],
        ["表单校验", "Validation", "失焦后 200ms 校验；错误贴字段；文案 = 现象 + 怎么改；提交时汇总", "错误出现 150ms；不自动消失", "index.html#states"],
      ],
    },
    {
      key: "data", name: "数据展示", en: "Data Display", link: "index.html#controls",
      items: [
        ["表格", "Table", "行高 40；表头 12/600；数字右对齐；100+ 行虚拟化；列可排序", "排序 150ms；行悬停 120ms；不整表重绘", "index.html#performance"],
        ["树", "Tree", "缩进 16/层；展开箭头 16；选中整行；键盘 ←→ 折叠展开", "展开 180ms 高度过渡", "components.html"],
        ["列表行", "List Row", "高 40/48；左图标 20；右 chevron；分隔线 8% 前景；支持滑动操作（移动）", "悬停 120ms；删除 200ms 折叠", "components.html"],
        ["卡片", "Card", "圆角 12–18；内边距 16–24；标题 16/600 + 副信息 12；一张卡一件事", "悬停上移 ≤ 3px + 阴影层级 2，240ms", "components.html"],
        ["描述列表", "Description List", "标签列 88–120，值列自适应；两列以上在窄屏堆叠；值可复制", "无动画", "components.html"],
        ["统计数值", "Stat", "数值 24–32 / 700；标签 11–12；变化用 ↑↓ + 颜色 + 符号", "数字滚动 400ms（仅首次/关键指标）", "index.html#type"],
        ["徽章 / 标签", "Badge / Tag", "高 20–24；圆角 999；颜色仅为辅助，必须配文字；数量 > 99 显示 99+", "新增 180ms 缩放淡入", "components.html"],
        ["头像", "Avatar", "24/32/40/64；圆形；缺省首字母 + 稳定配色；组头像叠 4px", "加载完成 150ms 淡入", "components.html"],
        ["进度条", "Progress", "高 6；圆角 999；< 1s 不显示；只增不减；不确定态用循环条", "进度 240ms 线性；完成态 400ms 切换", "components.html"],
        ["图表", "Charts", "折线/柱/饼：网格线 8% 前景；轴标签 11px；配色对比 ≥ 3:1；必须有数值替代（表格/读屏）", "入场 400–600ms 由左至右；悬停十字线 120ms；避免持续动画", "testing.html#cvd"],
        ["时间线", "Timeline", "节点 10–12；连线 2px；时间 11px 等宽；最新在上", "新条目 200ms 淡入", "components.html"],
        ["步骤条", "Stepper", "节点 24；连线 2px；≤ 5 步；当前步高亮，已完成打勾", "推进 240ms；可点击已完成步回退", "components.html"],
      ],
    },
    {
      key: "feedback", name: "反馈与系统", en: "Feedback & System", link: "index.html#states",
      items: [
        ["空状态", "Empty State", "图标 ≤ 96；一句说明 + 一个主操作；区分「无数据」与「无结果」", "入场 200ms 淡入，不做循环动画", "components.html"],
        ["骨架屏", "Skeleton", "与真实结构同形；不用假内容；1300ms 循环；> 1s 才出现", "shimmer 1300ms linear", "index.html#states"],
        ["加载指示", "Spinner", "16/20/32；≥ 1s 才出现；循环 1000–1400ms", "匀速旋转，勿加速", "components.html"],
        ["Toast", "Toast", "高 32–40；2–4s 自动消失；只讲结果；最多 1 条", "进入 180ms 上移淡入；退出 150ms", "index.html#states"],
        ["提示条", "InfoBar", "左侧状态图标 + 可关闭；不与 Toast 同屏重复；4 种语义", "展开 200ms；关闭 150ms", "components.html"],
        ["横幅", "Banner", "页面顶部通栏；可含 1 个操作 + 关闭；高度 ≤ 64", "滑入 240ms", "index.html#states"],
        ["工具提示", "Tooltip", "延迟 300–500ms；≤ 60 字；不含交互；触屏用长按", "淡入 120ms；不跟随滚动漂移", "components.html"],
        ["气泡卡片", "Popover", "锚点定位；宽度 240–360；可含表单；点击外部/Esc 关闭", "缩放 0.96→1 + 淡入 160ms", "components.html"],
        ["对话框", "Dialog", "宽 360–560；圆角 14–18；遮罩 α .32–.5；主操作在右；Esc 关闭；焦点锁定", "遮罩 180ms；面板 200ms scale .98→1", "components.html"],
        ["通知 / 权限", "Notification & Permission", "系统通知可关、点击直达；权限先预请求说明收益，再调系统弹窗", "通知到达 200ms；权限拒绝后不再重复弹窗", "index.html#states"],
      ],
    },
    {
      key: "media", name: "媒体与内容", en: "Media & Content", link: "index.html#lab-effects",
      items: [
        ["图片查看器", "Lightbox", "深色底；图片最大 90vw/85vh；支持缩放、左右切换、Esc 退出", "打开 240ms 共享元素放大；切换 200ms 横滑", "index.html#motion"],
        ["视频播放器", "Video Player", "16:9；控件 40 高；悬停显隐 200ms；键盘空格/←→/F", "控件淡入 200ms；缓冲用骨架色块", "components.html"],
        ["音频 / 波形", "Audio", "播放键 40；进度条可拖；波形 2px；显示时长与倍速", "播放波形滚动；暂停无动画", "components.html"],
        ["画布 / 编辑器", "Canvas Editor", "工具栏浮动；属性面板 240–280；撤销栈 ≥ 50；网格吸附可选", "拖拽 1:1 跟手；吸附 120ms；缩放 Ctrl+滚轮", "index.html#motion"],
        ["地图", "Map", "默认缩放 12–14；标记 24；聚合显示数量；深色模式用暗色瓦片", "平移跟手；标记展开 240ms", "components.html"],
        ["文件预览", "File Preview", "按类型降级：图片/PDF/文本/未知图标；提供「用默认应用打开」", "加载骨架 200ms；失败给重试", "index.html#states"],
        ["分享面板", "Share Sheet", "渠道 24 图标 + 名称；含复制链接；最近使用置前；取消不产生副作用", "上滑 240ms；关闭 200ms", "components.html"],
      ],
    },
    {
      key: "commerce", name: "商业化", en: "Commerce", link: "blueprint.html#modules",
      items: [
        ["定价卡", "Pricing Card", "≤ 3 档；推荐档高亮 + 徽标；年付显示折算月价；权益 3–5 条", "悬停抬升 2px；切换周期 200ms 数字滚动", "blueprint.html"],
        ["权益对比表", "Feature Matrix", "行=能力，列=档位；✓/— 明确；移动端横向滚动并固定首列", "无动画；滚动阴影提示", "blueprint.html"],
        ["支付表单", "Checkout", "字段最少化；支付方式图标 24；按钮禁用防重复；错误给原因 + 替代方式", "提交 spinner 即时；成功 400ms 勾选动画", "index.html#states"],
        ["订单卡", "Order Card", "状态徽章 + 金额 + 时间；操作 ≤ 2；退款入口可见", "状态变更 200ms 高亮", "blueprint.html"],
        ["优惠券 / 兑换码", "Coupon & Redeem", "输入即校验；成功显示抵扣后价格；失败说明原因（已用/过期/不适用）", "校验 200ms；成功 240ms", "blueprint.html"],
        ["恢复购买", "Restore Purchase", "入口常驻；进行中禁用；成功刷新权益并提示有效期", "完成 200ms Toast", "blueprint.html"],
      ],
    },
    {
      key: "system", name: "系统集成", en: "System Integration", link: "index.html#traps",
      items: [
        ["托盘 / 菜单栏", "Tray / Menu Bar", "图标 16/32；菜单项 ≤ 8；含「显示主窗口 / 设置 / 退出」", "点击弹出 150ms", "index.html#traps"],
        ["系统通知", "System Notification", "标题 ≤ 40 字，正文 ≤ 120 字；点击直达；可分组、可静音", "系统接管动画，不自造", "index.html#traps"],
        ["快捷键", "Shortcuts", "符合平台约定（⌘, / Ctrl+, 设置）；可自定义；冲突检测", "无动画；按下即生效", "components.html"],
        ["拖放", "Drag & Drop", "拖入高亮 2px 边框；显示可放置区域；放置后 200ms 反馈", "拖拽跟手；越界回弹 200ms", "index.html#motion"],
        ["文件关联", "File Association", "注册类型与图标；「用…打开」可用；缺失时提示关联设置", "无动画", "index.html#traps"],
        ["自动更新", "Auto Update", "静默下载；重启提示可推迟；可查看更新日志；失败可手动重试", "提示 200ms；不强制中断工作", "index.html#traps"],
      ],
    },
  ];

  const EFFECT_MAP = [
    ["悬停反馈", "按钮 / 卡片 / 列表行", "120–180ms ease-out；位移 ≤ 3px", "触屏、滚动中"],
    ["按压反馈", "按钮 / 图标按钮", "80–120ms；scale .98", "不可用于破坏性确认前"],
    ["展开收起", "下拉 / 菜单 / 折叠面板", "200–250ms cubic-bezier(.2,0,0,1)", "高频键盘操作时"],
    ["页面切换", "导航 / 详情", "240–320ms；M3 emphasized 500ms", "reduce motion 下改为淡化"],
    ["模态出现", "对话框 / 气泡", "遮罩 180ms；面板 200ms scale .98→1", "系统级中断弹窗"],
    ["共享元素", "列表 → 详情 / 图片查看", "240–320ms；元素位置与圆角连续", "数据未就绪时"],
    ["交错入场", "卡片网格 / 列表", "每项延迟 40–80ms，总时长 ≤ 500ms", "长列表（> 20 项）"],
    ["骨架 shimmer", "骨架屏", "1300ms linear 循环", "已知内容且可缓存时"],
    ["材质模糊", "侧栏 / 浮层 / 工具栏", "blur 22–40px + saturate 130–180%", "正文内容层、低端设备"],
    ["滚动边缘", "工具栏下方内容", "渐隐 16–24px + 背景模糊", "内容为纯色时"],
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  function render(family) {
    const host = $("#elCatalog");
    if (!host) return;
    let total = 0;
    host.innerHTML = FAMILIES.filter(function (f) { return family === "all" || f.key === family; }).map(function (f) {
      total += f.items.length;
      return '<section class="el-family" id="fam-' + f.key + '">' +
        '<div class="el-family__head"><h3>' + f.name + '</h3><span>' + f.en + '</span>' +
        '<span class="badge" style="background:var(--accent-soft);color:var(--accent)">' + f.items.length + " 个</span></div>" +
        '<div class="table-wrap"><table class="el-table"><thead><tr><th>元素</th><th>规范要点</th><th>效果 / 动效</th><th>深查</th></tr></thead><tbody>' +
        f.items.map(function (it) {
          return "<tr>" +
            "<td><b>" + it[0] + '</b><span class="el-en">' + it[1] + "</span></td>" +
            "<td>" + esc(it[2]) + "</td>" +
            "<td>" + esc(it[3]) + "</td>" +
            '<td class="el-links"><a href="' + it[4] + '">查看</a></td>' +
          "</tr>";
        }).join("") +
        "</tbody></table></div></section>";
    }).join("");
    const count = $("#elCount");
    if (count) count.textContent = total + " / 66 个元素";
  }

  function renderEffects() {
    const body = $("#effectMapBody");
    if (!body) return;
    body.innerHTML = EFFECT_MAP.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td>" + r[1] + '</td><td class="mono">' + r[2] + "</td><td>" + r[3] + "</td></tr>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    render("all");
    renderEffects();

    const nav = $("#familyNav");
    if (nav) {
      nav.innerHTML = FAMILIES.map(function (f) {
        return '<a href="#fam-' + f.key + '">' + f.name + "</a>";
      }).join("");
    }

    const filter = $("#elFilter");
    if (filter) {
      filter.innerHTML = '<button type="button" class="is-on" data-family="all">全部</button>' +
        FAMILIES.map(function (f) { return '<button type="button" data-family="' + f.key + '">' + f.name + "</button>"; }).join("");
      filter.addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-family]");
        if (!btn) return;
        Array.prototype.forEach.call(filter.querySelectorAll("button"), function (b) { b.classList.toggle("is-on", b === btn); });
        render(btn.getAttribute("data-family"));
        applySearch();
      });
    }

    const search = $("#elSearch");
    function applySearch() {
      const q = (search && search.value.trim().toLowerCase()) || "";
      document.querySelectorAll("#elCatalog .el-family").forEach(function (fam) {
        let visible = 0;
        fam.querySelectorAll("tbody tr").forEach(function (tr) {
          const hit = !q || tr.textContent.toLowerCase().indexOf(q) >= 0;
          tr.style.display = hit ? "" : "none";
          if (hit) visible++;
        });
        fam.style.display = visible ? "" : "none";
      });
    }
    if (search) search.addEventListener("input", applySearch);
  });
})();
