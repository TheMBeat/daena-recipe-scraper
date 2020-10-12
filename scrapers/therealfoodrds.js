const request = require("request")
const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")
const puppeteerFetch = require("../helpers/puppeteerFetch")

const theRealFoodRds = url => {
  const Recipe = new RecipeSchema()
  return new Promise(async (resolve, reject) => {
    if (!url.includes("therealfoodrds.com/")) {
      reject(new Error("url provided must include 'therealfoodrds.com/'"))
    } else {
      try {
        const html = await puppeteerFetch(url)
        const Recipe = new RecipeSchema()
        const $ = cheerio.load(html)

        Recipe.url = url
        Recipe.imageUrl = $("meta[property='og:image']").attr("content")
        Recipe.name = $(".tasty-recipes-entry-header")
          .children("h2")
          .first()
          .text()

        $(".tasty-recipes-ingredients")
          .find("li")
          .each((i, el) => {
            Recipe.recipeIngredient.push(
              $(el)
                .text()
                .replace(/\s\s+/g, "")
            )
          })

        $(".tasty-recipes-instructions")
          .find("h4, li")
          .each((i, el) => {
            Recipe.recipeInstructions.push(
              $(el)
                .text()
                .replace(/\s\s+/g, "")
            )
          })

        Recipe.prepTime = $(".tasty-recipes-prep-time").text()
        Recipe.cookTime = $(".tasty-recipes-cook-time").text()
        Recipe.totalTime = $(".tasty-recipes-total-time").text()

        Recipe.recipeYield = $(".tasty-recipes-yield")
          .children("span")
          .first()
          .text()

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

module.exports = theRealFoodRds
