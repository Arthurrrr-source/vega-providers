/**
 * Universal Movie & Series Provider Scraper for Vega App
 * Author: Aftab
 */

class UniversalMovieProvider {
  constructor(name, baseUrl) {
    this.name = name;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  // 1. Search Query Method
  async search(query) {
    try {
      const searchUrl = `${this.baseUrl}?s=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await response.text();
      return this.parseSearchPage(html);
    } catch (error) {
      console.error(`[${this.name}] Search Error:`, error);
      return [];
    }
  }

  // 2. Parse HTML Search Results
  parseSearchPage(html) {
    const results = [];
    
    // Article / Post Extraction Regex (Works on WordPress/Movie Themes)
    const articleRegex = /<article[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/gi;
    const fallbackRegex = /<h2\s+class="entry-title"><a\s+href="([^"]+)">([^<]+)<\/a><\/h2>/gi;

    let match;

    // Primary Parsing Loop
    while ((match = articleRegex.exec(html)) !== null) {
      results.push({
        title: match[3].trim().replace(/&#8211;|&#8217;/g, '-'),
        url: match[1],
        poster: match[2],
        provider: this.name
      });
    }

    // Fallback Parsing Loop (if images or standard article tag missing)
    if (results.length === 0) {
      while ((match = fallbackRegex.exec(html)) !== null) {
        results.push({
          title: match[2].trim().replace(/&#8211;|&#8217;/g, '-'),
          url: match[1],
          poster: '',
          provider: this.name
        });
      }
    }

    return results;
  }

  // 3. Extract Streaming / Download Links
  async getStreams(movieUrl) {
    try {
      const response = await fetch(movieUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await response.text();
      return this.parseStreamLinks(html);
    } catch (error) {
      console.error(`[${this.name}] Stream Extraction Error:`, error);
      return [];
    }
  }

  // 4. Parse Links and Detect Quality
  parseStreamLinks(html) {
    const streams = [];
    
    // FastDrive, HubCloud, GDToT, V-Cloud & Direct Link Extractor
    const streamLinkRegex = /href="(https?:\/\/[^"]*(?:fastdrive|hubcloud|vcloud|drive|pixeldrain|gdtot|mega|mkv|mp4)[^"]*)"/gi;
    let match;

    while ((match = streamLinkRegex.exec(html)) !== null) {
      const link = match[1];
      
      // Determine Quality Badge from URL or Context
      let quality = "720p HD";
      if (link.includes("1080p") || html.includes("1080p")) quality = "1080p Full HD";
      if (link.includes("2160p") || link.includes("4k") || html.includes("4K")) quality = "4K Ultra HD";
      if (link.includes("480p")) quality = "480p SD";

      streams.push({
        name: `${this.name} - ${quality}`,
        quality: quality,
        url: link,
        isDirect: link.endsWith(".mp4") || link.endsWith(".mkv")
      });
    }

    return streams;
  }
}

module.exports = UniversalMovieProvider;
