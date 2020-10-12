const request = require("request")
const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const minimalistBaker = url => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("minimalistbaker.com/")) {
      reject(new Error("url provided must include 'minimalistbaker.com/'"))
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html)

          Recipe.url = url
          Recipe.imageUrl = $("meta[property='og:image']").attr("content")
          Recipe.name = $(".wprm-recipe-name").text()

          $(".wprm-recipe-ingredient").each((i, el) => {
            Recipe.recipeIngredient.push(
              $(el)
                .text()
                .replace(/\s\s+/g, " ")
                .trim()
            )
          })

          $(".wprm-recipe-instruction-group").each((i, el) => {
            let group = $(el)
              .children(".wprm-recipe-group-name")
              .text()
            if (group.length) Recipe.recipeInstructions.push("# "+group)
            $(el)
              .find(".wprm-recipe-instruction-text")
              .each((i, elChild) => {
                Recipe.recipeInstructions.push($(elChild).text())
              })
          })

          Recipe.prepTime = $(".wprm-recipe-time")
            .first()
            .text()
          Recipe.cookTime = $($(".wprm-recipe-time").get(1)).text()
          Recipe.totalTime = $(".wprm-recipe-time")
            .last()
            .text()

          Recipe.recipeYield = $(".wprm-recipe-servings")
            .first()
            .text()

          if (
            !Recipe.name ||
            !Recipe.recipeIngredient.length ||
            !Recipe.recipeInstructions.length
          ) {
            reject(new Error("No recipe found on page"))
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
          reject(new Error("No recipe found on page"))
        }
      })
    }
  })
}

module.exports = minimalistBaker
