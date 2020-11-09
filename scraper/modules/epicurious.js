const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const epicurious = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("epicurious.com/recipes/")) {
      reject(new Error("url provided must include 'epicurious.com/recipes/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $("h1[itemprop=name]")
        .text()
        .trim()

      $(".ingredient").each((i, el) => {
        Recipe.recipeIngredient.push($(el).text())
      })

      $(".preparation-step").each((i, el) => {
        Recipe.recipeInstructions.push(
          $(el)
          .text()
          .replace(/\s\s+/g, "")
        )
      })

      Recipe.prepTime = $("dd.active-time").text()
      Recipe.totalTime = $("dd.total-time").text()

      Recipe.servings = $("dd.yield").text()

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

module.exports = epicurious