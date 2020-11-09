const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const omnivorescookbook = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("omnivorescookbook.com/")) {
      reject(new Error("url provided must include 'omnivorescookbook.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $(".wprm-recipe-name").text()

      $(".wprm-recipe-ingredient-group").each((i, el) => {
        let group = $(el)
          .find(".wprm-recipe-group-name")
          .text()
        if (group) {
          Recipe.recipeIngredient.push("# " + group)
        }
        $(el)
          .find(".wprm-recipe-ingredient")
          .each((i, el) => {
            Recipe.recipeIngredient.push(
              $(el)
              .text()
              .replace(/\s\s+/g, " ")
              .trim()
            )
          })
      })

      $(".wprm-recipe-instruction-group").each((i, el) => {
        Recipe.recipeInstructions.push(
          $(el)
          .children(".wprm-recipe-group-name")
          .text()
        )
        $(el)
          .find(".wprm-recipe-instruction-text")
          .each((i, elChild) => {
            Recipe.recipeInstructions.push($(elChild).text())
          })
      })

      $(".wprm-recipe-time-container").each((i, el) => {
        let label = $(el)
          .children(".wprm-recipe-time-label")
          .text()
        let time = $(el)
          .children(".wprm-recipe-time")
          .text()
        if (label.includes("Prep")) {
          Recipe.prepTime = time
        } else if (label.includes("Cook")) {
          Recipe.cookTime = time
        } else if (label.includes("Resting")) {
          //Recipe.time.inactive = time
        } else if (label.includes("Total")) {
          Recipe.totalTime = time
        }
      })

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

    }
  })
}

module.exports = omnivorescookbook