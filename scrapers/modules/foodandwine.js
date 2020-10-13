const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const foodAndWine = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("foodandwine.com/recipes/")) {
      reject(new Error("url provided must include 'foodandwine.com/recipes/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $("h1.headline").text()

      $(".ingredients")
        .find("li")
        .each((i, el) => {
          Recipe.recipeIngredient.push(
            $(el)
            .text()
            .trim()
          )
        })

      $(".recipe-instructions")
        .find("p")
        .each((i, el) => {
          Recipe.recipeInstructions.push($(el).text())
        })

      let metaBody = $(".recipe-meta-item-body")

      Recipe.prepTime = metaBody
        .first()
        .text()
        .trim()
      Recipe.totalTime = $(metaBody.get(1))
        .text()
        .trim()

      let servings = metaBody
        .last()
        .text()
        .trim()
      Recipe.recipeYield = servings.slice(servings.indexOf(":") + 2)

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

module.exports = foodAndWine