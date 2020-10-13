const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const gimmeSomeOven = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("gimmesomeoven.com/")) {
      reject(new Error("url provided must include 'gimmesomeoven.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.image = $("meta[property='og:image']").attr("content")
      Recipe.name = $(".tasty-recipes-header-content")
        .children("h2")
        .first()
        .text()

      $(".tasty-recipes-ingredients")
        .find("li")
        .each((i, el) => {
          Recipe.recipeIngredient.push($(el).text())
        })

      $(".tasty-recipes-instructions")
        .find("li")
        .each((i, el) => {
          Recipe.recipeInstructions.push($(el).text())
        })

      Recipe.prepTime = $(".tasty-recipes-prep-time").text()
      Recipe.cookTime = $(".tasty-recipes-cook-time").text()
      Recipe.totalTime = $(".tasty-recipes-total-time").text()

      $(".tasty-recipes-yield-scale").remove()
      Recipe.recipeYield = $(".tasty-recipes-yield")
        .text()
        .trim()

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

    }
  })
}

module.exports = gimmeSomeOven