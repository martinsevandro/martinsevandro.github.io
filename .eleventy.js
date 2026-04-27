const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {

  eleventyConfig.addFilter("date", (value, format = "dd LLLL yyyy") => {
    const date = value ? new Date(value) : new Date();
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(format);
  });

  // Filter para data atual (usado em sitemap.xml)
  eleventyConfig.addFilter("now", (date, format = "yyyy-MM-dd") => {
    return DateTime.now().toFormat(format);
  });
  
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

  eleventyConfig.addCollection("post", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    markdownTemplateEngine: false,
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};

