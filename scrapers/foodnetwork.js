const request = require("request")
const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const foodNetwork = url => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("foodnetwork.com/recipes/")) {
      reject(new Error("url provided must include 'foodnetwork.com/recipes/'"))
    } else {
      request(url, (error, response, html) => {
        if (!error && response.statusCode === 200) {
          const $ = cheerio.load(html)

          Recipe.url = url
          Recipe.imageUrl = $("meta[property='og:image']").attr("content")
          Recipe.name = $(".o-AssetTitle__a-HeadlineText")
            .first()
            .text()

          $(".o-Ingredients__a-Ingredient, .o-Ingredients__a-SubHeadline").each(
            (i, el) => {
              const item = $(el)
                .text()
                .replace(/\s\s+/g, "")
              Recipe.recipeIngredient.push(item)
            }
          )

          $(".o-Method__m-Step").each((i, el) => {
            const step = $(el)
              .text()
              .replace(/\s\s+/g, "")
            if (step != "") {
              Recipe.recipeInstructions.push(step)
            }
          })

          $(".o-RecipeInfo li").each((i, el) => {
            let timeItem = $(el)
              .text()
              .replace(/\s\s+/g, "")
              .split(":")
            switch (timeItem[0]) {
              case "Prep":
                Recipe.prepTime = timeItem[1]
                break
              case "Active":
                //Recipe.time.active = timeItem[1]
                break
              case "Inactive":
                //Recipe.time.inactive = timeItem[1]
                break
              case "Cook":
                Recipe.cookTime = timeItem[1]
                break
              case "Total":
                Recipe.totalTime = timeItem[1]
                break
              default:
            }
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
        } else {
          reject(new Error("No recipe found on page"))
        }
      })
    }
  })
}

module.exports = foodNetwork
