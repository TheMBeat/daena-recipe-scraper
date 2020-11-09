const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const theSpruceEats = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("thespruceeats.com/")) {
      reject(new Error("url provided must include 'thespruceeats.com/'"))
    } else {
      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $(".heading__title").text()

      $(".simple-list__item").each((i, el) => {
        Recipe.recipeIngredient.push(
          $(el)
          .text()
          .trim()
        )
      })

      $(".section-content")
        .find("ol")
        .find("p")
        .each((i, el) => {
          Recipe.recipeInstructions.push($(el).text())
        })

      let metaText = $(".meta-text__data")
      Recipe.totalTime = metaText.first().text()
      Recipe.prepTime = $(metaText.get(1)).text()
      Recipe.cookTime = $(metaText.get(2)).text()

      Recipe.servings = metaText.last().text()

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

module.exports = theSpruceEats