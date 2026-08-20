class Provider {
  constructor() {
    this.name = "Provider";
  }

  async search(query) {
    try {
      const searchUrl = `?s=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      const html = await response.text();
      return this.parseSearchPage(html);
    } catch (error) {
      return [];
    }
  }

  parseSearchPage(html) {
    const results = [];
    const articleRegex = /<article[^>]*>[\s\S]*?<a\s+href="([^"]+)"[^>]*>[\s\S]*?<h2[^>]*>([^<]+)<\/h2>/gi;
    let match;

    while ((match = articleRegex.exec(html)) !== null) {
      results.push({
        title: match[2].trim(),
        url: match[1]
      });
    }
    return results;
  }

  async getStreams(movieUrl) {
    try {
      const response = await fetch(movieUrl);
      const html = await response.text();
      return this.parseStreamLinks(html);
    } catch (error) {
      return [];
    }
  }

  parseStreamLinks(html) {
    const streams = [];
    const streamLinkRegex = /href="(https?:\/\/[^"]*(?:fastdrive|hubcloud|vcloud|drive|pixeldrain|gdtot|mega|mkv|mp4)[^"]*)"/gi;
    let match;

    while ((match = streamLinkRegex.exec(html)) !== null) {
      streams.push({
        name: "HD Stream",
        quality: "720p",
        url: match[1]
      });
    }
    return streams;
  }
}

module.exports = Provider;
