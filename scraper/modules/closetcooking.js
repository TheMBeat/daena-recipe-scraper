const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")
const puppeteerFetch = require("../../helpers/puppeteerFetch")

const closetCooking = (url, html) => {
  return new Promise(async (resolve, reject) => {
    if (!url.includes("closetcooking.com/")) {
      reject(new Error("url provided must include 'closetcooking.com/'"))
    } else {
      try {
        const html = await puppeteerFetch(url)
        const Recipe = new RecipeSchema()
        const $ = cheerio.load(html)

        Recipe.url = url
        Recipe.imageUrl = $("meta[property='og:image']").attr("content")
        Recipe.name = $(".recipe_title").text()

        $(".ingredients")
          .children("h6, li")
          .each((i, el) => {
            Recipe.recipeIngredient.push($(el).text())
          })

        $(".instructions")
          .children("h6, li")
          .each((i, el) => {
            Recipe.recipeInstructions.push($(el).text())
          })

        let metaData = $(".time")
        let prepText = metaData.first().text()
        Recipe.prepTime = prepText.slice(prepText.indexOf(":") + 1).trim()
        let cookText = $(metaData.get(1)).text()
        Recipe.cookTime = cookText.slice(cookText.indexOf(":") + 1).trim()
        let totalText = $(metaData.get(2)).text()
        Recipe.totalTime = totalText.slice(totalText.indexOf(":") + 1).trim()

        let servingsText = $(".yield").text()
        Recipe.recipeYield = servingsText
          .slice(servingsText.indexOf(":") + 1)
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
      } catch (error) {
        reject(new Error("No recipe found on page"))
      }
    }
  })
}

module.exports = closetCooking
