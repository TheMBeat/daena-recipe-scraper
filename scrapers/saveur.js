const request = require("request");
const cheerio = require("cheerio");

const RecipeSchema = require("../helpers/recipe-schema");

const saveur = url => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    if (!url.includes("saveur.com/")) {
      reject(new Error("url provided must include 'saveur.com/'"));
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html);

          Recipe.url = url
          Recipe.imageUrl = $("meta[property='og:image']").attr("content");
          Recipe.name = $("meta[property='og:title']").attr("content");

          $(".ingredient")
            .each((i, el) => {
              Recipe.recipeIngredient.push($(el).text());
            });
            
            $(".instruction")
            .each((i, el) => {
              Recipe.recipeInstructions.push($(el).text());
            });


          Recipe.totalTime = $(".cook-time").text().trim().replace("Time:", "");
          Recipe.recipeYield = $(".yield").text().trim().replace("Yield:", "").replace("serves","");

          if (
            !Recipe.name || 
            !Recipe.recipeIngredient.length 
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
          console.log("HERE IS ERROR: ", response)
          reject(new Error("error: ", response.code));
        }
      });
    }
  });
};

module.exports = saveur;
