const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const archanaskitchen = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("archanaskitchen.com/")) {
      reject(new Error("url provided must include 'archanaskitchen.com/'"))
    } else {
      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $("meta[property='og:title']").attr("content")

      $("*[itemprop = 'ingredients']").each((i, el) => {
        Recipe.recipeIngredient.push(
          $(el)
          .text()
          .trim()
        )
      })

      $("*[itemprop = 'recipeInstructions']")
        .each((i, el) => {
          Recipe.recipeInstructions.push($(el).text())
        })

      let servings = $("*[itemprop = 'recipeYield']").text()
      if (servings) {
        Recipe.recipeYield = servings.toLowerCase().replace(":", "").replace("makes", "").trim()
      }

      let prepTime = $("*[itemprop = 'prepTime']").text()
      if (prepTime) {
        Recipe.prepTime = prepTime ? prepTime.match(/\d+/)[0] : ""
      }

      let cookTime = $("*[itemprop = 'cookTime']").text()
      if (cookTime) {
        Recipe.cookTime = cookTime ? cookTime.match(/\d+/)[0] : ""
      }

      let totalTime = $("*[itemprop = 'totalTime']").text()
      if (totalTime) {
        Recipe.totalTime = totalTime ? totalTime.match(/\d+/)[0] : ""
      }

      //console.log("HERE IS RECIPE: ", Recipe)
      if (
        !Recipe.name ||
        !Recipe.recipeIngredient.length) {
        reject(new Error("No recipe found on page", Recipe))
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

module.exports = archanaskitchen