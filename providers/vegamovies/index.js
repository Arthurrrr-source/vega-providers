class VegaMovies {
  constructor() {
    this.name = "VegaMovies";
    this.baseUrl = "https://new2.vegamovies.futbol/";
  }

  async search(query) {
    try {
      const response = await fetch(`${this.baseUrl}?s=${encodeURIComponent(query)}`);
      const html = await response.text();
      const results = [];
      const regex = /<h2 class="entry-title"><a href="([^"]+)">([^<]+)<\/a><\/h2>/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        results.push({ title: match[2].trim(), url: match[1] });
      }
      return results;
    } catch (e) {
      return [];
    }
  }

  async getStreams(movieUrl) {
    try {
      const response = await fetch(movieUrl);
      const html = await response.text();
      const streams = [];
      const regex = /href="(https?:\/\/[^"]*(?:fastdrive|vcloud|drive|gdtot)[^"]*)"/g;
      let match;
      while ((match = regex.exec(html)) !== null) {
        streams.push({ name: "HD Stream", url: match[1] });
      }
      return streams;
    } catch (e) {
      return [];
    }
  }
}

module.exports = VegaMovies;
