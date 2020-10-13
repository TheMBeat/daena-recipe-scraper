const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const theWoksOfLife = url => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("thewoksoflife.com/")) {
      reject(new Error("url provided must include 'thewoksoflife.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $("meta[property='og:title']").attr("content")


      $(".wprm-recipe-ingredient")
        .each((i, el) => {
          Recipe.recipeIngredient.push($(el).text())
        })

      $(".wprm-recipe-instruction-text")
        .each((i, el) => {
          Recipe.recipeInstructions.push($(el).text())
        })

      var prepTime = $(".wprm-recipe-prep-time-container")
        .find(".wprm-recipe-prep_time").text()
      var prepMin = $(".wprm-recipe-prep-time-container")
        .find(".wprm-recipe-prep_time-unit").text()
      Recipe.prepTime = prepTime.concat(" ").concat(prepMin)

      var cookTime = $(".wprm-recipe-cook-time-container")
        .find(".wprm-recipe-cook_time").text()
      var cookMin = $(".wprm-recipe-cook-time-container")
        .find(".wprm-recipe-cook_time-unit").text()
      Recipe.cookTime = cookTime.concat(" ").concat(cookMin)

      var totalTime = $(".wprm-recipe-total-time-container")
        .find(".wprm-recipe-total_time").text()
      var totalMin = $(".wprm-recipe-total-time-container")
        .find(".wprm-recipe-total_time-unit").text()
      Recipe.totalTime = totalTime.concat(" ").concat(totalMin)

      Recipe.recipeYield = $(".wprm-recipe-servings").text()

      if (
        !Recipe.name ||
        !Recipe.recipeIngredient.length) {
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

module.exports = theWoksOfLife