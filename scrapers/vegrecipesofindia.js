const request = require("request");
const cheerio = require("cheerio");

const RecipeSchema = require("../helpers/recipe-schema");

const vegRecipesOfIndia = url => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes("vegrecipesofindia.com/")) {
      reject(new Error("url provided must include 'vegrecipesofindia.com/'"));
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);

          Recipe.url = url
          Recipe.imageUrl = $("meta[property='og:image']").attr("content");
          Recipe.name = $("meta[property='og:title']").attr("content");

          $(".wprm-recipe-ingredients")
            .find("li")
            .each((i, el) => {
              Recipe.recipeIngredient.push($(el).text());
            });

          $(".wprm-recipe-instructions")
            .find("li")
            .each((i, el) => {
              Recipe.recipeInstructions.push($(el).text());
            });

          Recipe.prepTime = $(".wprm-recipe-prep-time-container").find(".wprm-recipe-time").text();
          Recipe.cookTime = $(".wprm-recipe-cook-time-container").find(".wprm-recipe-time").text();
          Recipe.totalTime = $(".wprm-recipe-total-time-container").find(".wprm-recipe-time").text();

          Recipe.recipeYield = $(".wprm-recipe-servings-with-unit")
            .text()
            .trim();

          if (
            !Recipe.name ||
            !Recipe.recipeIngredient.length ||
            !Recipe.recipeInstructions.length
          ) {
            reject(new Error("No recipe found on page"));
          } else {
            var json_ld_obj = Recipe
            
            if ("@Context" in json_ld_obj === false) {
              json_ld_obj["@Context"] = "http:\/\/schema.org"
            }

            if (!"@type" in json_ld_obj === false) {
              json_ld_obj["@type"] = "Recipe"
            }

            resolve(json_ld_obj)
          }
        } else {
          reject(new Error("No recipe found on page"));
        }
      });
    }
  });
};

module.exports = vegRecipesOfIndia;
