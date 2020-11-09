const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const Maangchi = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("maangchi.com/")) {
      reject(new Error("url provided must include 'maangchi.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $("meta[name='twitter:title']").attr("content")

      $("h4").each((i, el) => {
        if ($(el).text() === "Ingredients") {
          $(el).nextAll("ul").each((i, ul) => {
            $(ul).find("li").each((i, li) => {
              Recipe.recipeIngredient.push($(li).text())
            })
          })
        }

        if ($(el).text() === "Directions") {
          $(el).nextAll("ol").each((i, ol) => {
            $(ol).find("li").each((i, li) => {
              Recipe.recipeInstructions.push($(li).text())
            })
          })
        }
      })

      if (
        !Recipe.name ||
        !Recipe.recipeIngredient.length
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

module.exports = Maangchi