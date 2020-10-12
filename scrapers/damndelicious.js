const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")
const puppeteerFetch = require("../helpers/puppeteerFetch")

const damnDelicious = url => {
  return new Promise(async (resolve, reject) => {
    if (!url.includes("damndelicious.net")) {
      reject(new Error("url provided must include 'damndelicious.net'"))
    } else {
      try {
        const html = await puppeteerFetch(url)
        const Recipe = new RecipeSchema()
        const $ = cheerio.load(html)

        let titleDiv = $(".recipe-title")

        Recipe.url = url
        Recipe.imageUrl = $("meta[property='og:image']").attr("content")
        Recipe.name = $(titleDiv)
          .children("h2")
          .text()

        $(titleDiv)
          .find("p")
          .each((i, el) => {
            let title = $(el)
              .children("strong")
              .text()
            let data = $(el)
              .children("span")
              .text()

            switch (title) {
              case "Yield:":
                Recipe.recipeYield = data
                break
              case "prep time:":
                Recipe.prepTime = data
                break
              case "cook time:":
                Recipe.cookTime = data
                break
              case "total time:":
                Recipe.totalTime = data
                break
              default:
                break
            }
          })

        $("li[itemprop=ingredients]").each((i, el) => {
          Recipe.recipeIngredient.push($(el).text())
        })

        $(".instructions")
          .find("li")
          .each((i, el) => {
            Recipe.recipeInstructions.push($(el).text())
          })

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

module.exports = damnDelicious
