export function normalizeUrl(rawUrl: string): string {
  let urlStr = rawUrl.trim();
  if (!urlStr.startsWith("http://") && !urlStr.startsWith("https://")) {
    urlStr = "https://" + urlStr;
  }
  const parsed = new URL(urlStr);
  // Remove hash/fragment for clean crawling
  parsed.hash = "";
  return parsed.toString();
}

export function getDomain(urlStr: string): string {
  try {
    const parsed = new URL(normalizeUrl(urlStr));
    return parsed.hostname;
  } catch {
    return "";
  }
}

export function isSameDomain(urlA: string, urlB: string): boolean {
  const domA = getDomain(urlA);
  const domB = getDomain(urlB);
  if (!domA || !domB) return false;
  return domA.toLowerCase() === domB.toLowerCase() || domA.endsWith(`.${domB}`) || domB.endsWith(`.${domA}`);
}

export function isInternalLink(linkUrl: string, targetDomain: string): boolean {
  try {
    const parsed = new URL(linkUrl);
    const host = parsed.hostname.toLowerCase();
    const dom = targetDomain.toLowerCase();
    return host === dom || host.endsWith(`.${dom}`);
  } catch {
    return false;
  }
}

export function sanitizeFilename(str: string): string {
  return str.replace(/[^a-z0-9]/gi, "-").toLowerCase().replace(/-+/g, "-").replace(/^-|-$/g, "");
}
