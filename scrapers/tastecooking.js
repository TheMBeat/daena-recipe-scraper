const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const TasteCooking = url => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("tastecooking.com/")) {
      reject(new Error("url provided must include 'tastecooking.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[name='twitter:image']").attr("content")
      Recipe.name = $("meta[property='og:title']").attr("content")


      $(".recipe-body-ingredient").each((i, el) => {
        var ingredientString = ""
        var quantity = $(el).find(".recipe-body-ingredient-quantity").find(".ingredient-number").text().trim()
        var quant_label = $(el).find(".recipe-body-ingredient-quantity").find(".ingredient-label").text().trim()
        if (quant_label === "c") {
          quant_label = "cups"
        }
        var ingredient = $(el).find(".recipe-body-ingredient-name").text().trim()
        ingredientString = ingredientString.concat(quantity, " ", quant_label, " ", ingredient)
        Recipe.recipeIngredient.push(ingredientString)
      })

      Recipe.recipeYield = $('[itemprop="recipeYield"]')
        .children(".recipe-stats-quantity")
        .text()
        .trim()

      $(".recipe-body-list-container").find("li").each((i, el) => {
        //console.log("HERE IS EL TEXT: ", $(el).text())
        Recipe.recipeInstructions.push($(el).text().trim())
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

module.exports = TasteCooking