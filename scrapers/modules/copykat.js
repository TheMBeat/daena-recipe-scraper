const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")
const puppeteerFetch = require("../helpers/puppeteerFetch")

const copykat = url => {
  return new Promise(async (resolve, reject) => {
    if (!url.includes("copykat.com/")) {
      reject(new Error("url provided must include 'copykat.com/'"))
    } else {
      try {
        let html = await puppeteerFetch(url)
        var Recipe = new RecipeSchema()
        const $ = cheerio.load(html)

        Recipe.url = url
        Recipe.imageUrl = $("meta[property='og:image']").attr("content")
        Recipe.name = $(
          $(".wprm-recipe-container").find(".wprm-recipe-name")
        ).text()

        $(".wprm-recipe-ingredient").each((i, el) => {
          Recipe.recipeIngredient.push(
            $(el)
              .text()
              .replace(/\s\s+/g, " ")
              .trim()
          )
        })

        $(".wprm-recipe-instructions").each((i, el) => {
          Recipe.recipeInstructions.push(
            $(el)
              .text()
              .replace(/\s\s+/g, " ")
              .trim()
          )
        })

        Recipe.prepTime = $(
          $(".wprm-recipe-prep-time-container").children(".wprm-recipe-time")
        ).text()
        Recipe.cookTime = $(
          $(".wprm-recipe-cook-time-container").children(".wprm-recipe-time")
        ).text()
        Recipe.totalTime = $(
          $(".wprm-recipe-total-time-container").children(".wprm-recipe-time")
        ).text()

        Recipe.recipeYield = $(".wprm-recipe-servings").text()

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

module.exports = copykat
