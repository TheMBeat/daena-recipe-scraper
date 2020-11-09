const request = require("request");
const cheerio = require("cheerio");

const RecipeSchema = require("../../helpers/recipe-schema");

const oneHundredAndOne = url => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes("101cookbooks.com/")) {
      reject(new Error("url provided must include '101cookbooks.com/'"));
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);
          const body = $(".wprm-recipe-container");

          Recipe.imageUrl = $("meta[property='og:image']").attr("content");
          Recipe.name = body.children("h2").text();

          $(".wprm-recipe-ingredient").each((i, el) => {
            Recipe.recipeIngredient.push(
              $(el)
                .text()
                .replace(/\s\s+/g, " ")
                .trim()
            );
          });

          $(".wprm-recipe-instruction-group").each((i, el) => {
            Recipe.recipeInstruction.push(
              $(el)
                .children(".wprm-recipe-group-name")
                .text()
            );
            $(el)
              .find(".wprm-recipe-instruction-text")
              .each((i, elChild) => {
                Recipe.recipeInstruction.push($(elChild).text());
              });
          });

          Recipe.prepTime = $($(".wprm-recipe-time").get(1)).text();
          Recipe.totalTime = $(".wprm-recipe-time")
            .last()
            .text();

          Recipe.recipeYield = $(".wprm-recipe-time")
            .first()
            .text()
            .trim();

          if (
            !Recipe.name ||
            !Recipe.recipeIngredient.length ||
            !Recipe.recipeInstruction.length
          ) {
            reject(new Error("No recipe found on page"));
          } else {
            resolve(Recipe);
          }
        } else {
          reject(new Error("No recipe found on page"));
        }
      });
    }
  });
};

module.exports = oneHundredAndOne;
