const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const myRecipes = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("myrecipes.com/recipe")) {
      reject(new Error("url provided must include 'myrecipes.com/recipe'"))
    } else {
          const $ = cheerio.load(html)

          Recipe.url = url
          Recipe.imageUrl = $("meta[property='og:image']").attr("content")
          Recipe.name = $("h1.headline")
            .text()
            .trim()

          $(".ingredients")
            .find("h2, li")
            .each((i, el) => {
              Recipe.recipeIngredient.push($(el).text())
            })

          $(".step")
            .find("p")
            .each((i, el) => {
              const step = $(el)
                .text()
                .replace(/\s\s+/g, "")
              Recipe.recipeInstructions.push(step)
            })

          let metaBody = $(".recipe-meta-item-body")

          Recipe.prepTime = metaBody
            .first()
            .text()
            .trim()
          Recipe.totalTime = $(metaBody.get(1))
            .text()
            .trim()

          Recipe.recipeYield = metaBody
            .last()
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

module.exports = myRecipes
