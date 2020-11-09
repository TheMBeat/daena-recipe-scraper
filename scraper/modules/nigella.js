const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const nigella = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("nigella.com/")) {
      reject(new Error("url provided must include 'nigella.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $("meta[property='og:title']").attr("content")

      $("*[itemprop = 'recipeIngredient']").each((i, el) => {
        Recipe.recipeIngredient.push(
          $(el)
          .text()
          .trim()
        )
      })

      $("*[itemprop = 'recipeInstructions']")
        .find("ol")
        .find("li")
        .each((i, el) => {
          Recipe.recipeInstructions.push($(el).text())
        })

      let servings = $("*[itemprop = 'recipeYield']").text()

      if (servings) {
        Recipe.recipeYield = servings.toLowerCase().replace(":", "").replace("makes", "").trim()
      }

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

module.exports = nigella