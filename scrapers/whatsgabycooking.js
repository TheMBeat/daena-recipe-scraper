const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const whatsGabyCooking = url => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("whatsgabycooking.com/")) {
      reject(new Error("url provided must include 'whatsgabycooking.com/'"))
    } else {
          const $ = cheerio.load(html)

          Recipe.url = url
          Recipe.imageUrl = $("meta[property='og:image']").attr("content")
          Recipe.name = $(".wprm-recipe-name").text()

          $(".wprm-recipe-ingredient").each((i, el) => {
            let elText = $(el)
              .text()
              .trim()
            if (elText.length) {
              Recipe.recipeIngredient.push(elText)
            }
          })

          $(".wprm-recipe-instruction-group").each((i, el) => {
            let groupName = $(el)
              .find(".wprm-recipe-group-name")
              .text()
            let instruction = $(el)
              .find(".wprm-recipe-instruction-text")
              .text()
            if (groupName) {
              Recipe.recipeInstructions.push("# "+groupName)
            }
            Recipe.recipeInstructions.push(instruction)
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
    }
  })
}

module.exports = whatsGabyCooking
