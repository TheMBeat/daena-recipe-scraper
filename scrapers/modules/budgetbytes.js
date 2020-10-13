const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const budgetBytes = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("budgetbytes.com/")) {
      reject(new Error("url provided must include 'budgetbytes.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url

      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $(".wprm-recipe-name").text()

      $(".wprm-recipe-ingredient-notes").remove()
      $(".wprm-recipe-ingredient").each((i, el) => {
        Recipe.recipeIngredient.push(
          $(el)
          .text()
          .trim()
        )
      })

      $(".wprm-recipe-instruction-text").each((i, el) => {
        Recipe.recipeInstructions.push($(el).text())
      })

      Recipe.prepTime = $(".wprm-recipe-prep-time-label")
        .next()
        .text()
      Recipe.cookTime = $(".wprm-recipe-cook-time-label")
        .next()
        .text()
      Recipe.totalTime = $(".wprm-recipe-total-time-label")
        .next()
        .text()

      Recipe.recipeYield = $(".wprm-recipe-servings").text()

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

module.exports = budgetBytes