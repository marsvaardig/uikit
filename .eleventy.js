const twigPlugin = require("@factorial/eleventy-plugin-twig");

// Exports
module.exports = function (eleventyConfig) {
  
  // Add twig support
  eleventyConfig.addPlugin(twigPlugin, {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "data",
    }
  });
  
  eleventyConfig.setTemplateFormats([
    "twig", "html", "md", "njk"
  ]);
  
  
  // Images copy
  eleventyConfig.addPassthroughCopy("src/assets/images");
  
  // "Smart" widgets
  eleventyConfig.addShortcode('renderlayoutblock', function (name) {
    return (this.page.layoutblock || {})[name] || '';
  });
  eleventyConfig.addPairedShortcode('layoutblock', function (content, name) {
    if (!this.page.layoutblock) this.page.layoutblock = {};
    this.page.layoutblock[name] = content;
    return '';
  });
  
  // Date
  eleventyConfig.addShortcode("assetUrl", (asset) => {
    const nowDate = new Date();
    return `${asset}?${Math.floor(nowDate.getTime() / 6000)}`;
  });
  
  // CSS
  eleventyConfig.setServerOptions({
    watch: './_site/assets/css/**/*.css'
  });
  
  // Clean CSS
  eleventyConfig.on('afterBuild', () => {
    const CleanCSS = require("clean-css");
    const fs = require('fs');
    
    // Run me after the build ends
    var inputFile = '_site/assets/css/style.css';
    var input = fs.readFileSync(inputFile, 'utf8');
    var output = new CleanCSS().minify(input);
    fs.writeFile('_site/assets/css/style.css', output.styles, function (err) {
      if (err) return console.log('Error minifying main.css' + err);
      //success
    });
  });
 
  // Return
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "data"
    },
    markdownTemplateEngine: "twig",
    htmlTemplateEngine: "twig",
    dataTemplateEngine: "twig"
  };
};
