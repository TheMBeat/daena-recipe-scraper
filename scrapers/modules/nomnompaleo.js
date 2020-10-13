const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")
const puppeteerFetch = require("../helpers/puppeteerFetch")

const nomNomPaleo = (url, html) => {
  return new Promise(async (resolve, reject) => {
    if (!url.includes("nomnompaleo.com/")) {
      reject(new Error("url provided must include 'nomnompaleo.com/'"))
    } else {
      try {
        const html = await puppeteerFetch(url)
        const Recipe = new RecipeSchema()
        const $ = cheerio.load(html)

        Recipe.url = url
        Recipe.imageUrl = $("meta[property='og:image']").attr("content")
        Recipe.name = $(".wprm-recipe-name").text()

        $(".wprm-recipe-ingredient").each((i, el) => {
          Recipe.recipeIngredient.push(
            $(el)
              .text()
              .replace(/\s\s+/g, " ")
              .trim()
          )
        })

        $(".wprm-recipe-instruction-group").each((i, el) => {
          let groupName = $(el)
            .children(".wprm-recipe-group-name")
            .text()
          if (groupName.length) {
            Recipe.recipeInstructions.push("# "+groupName)
          }
          $(el)
            .find(".wprm-recipe-instruction-text")
            .each((i, elChild) => {
              Recipe.recipeInstructions.push($(elChild).text())
            })
        })
        const times = $(".wprm-recipe-time")
        Recipe.prepTime = $(times.first()).text()
        Recipe.cookTime = $(times.get(1)).text()
        Recipe.totalTime = $(times.last()).text()

        Recipe.recipeYield = $(".wprm-recipe-servings-with-unit").text()

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

module.exports = nomNomPaleo
