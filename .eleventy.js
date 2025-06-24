const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {

  eleventyConfig.addFilter("date", (value, format = "dd LLLL yyyy") => {
    const date = value ? new Date(value) : new Date();
    return DateTime.fromJSDate(date, { zone: "utc" }).toFormat(format);
  });
  
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addCollection("post", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md");
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      output: "_site"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};

