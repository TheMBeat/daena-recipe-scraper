const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const eatingWell = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("eatingwell.com/recipe")) {
      reject(new Error("url provided must include 'eatingwell.com/recipe'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      Recipe.imageUrl = $("meta[property='og:image']").attr("content")
      Recipe.name = $(".main-header")
        .find(".headline")
        .text()
        .trim()

      $(".ingredients-section__legend, .ingredients-item-name").each(
        (i, el) => {
          if (
            !$(el)
            .attr("class")
            .includes("visually-hidden")
          ) {
            Recipe.recipeIngredient.push(
              $(el)
              .text()
              .trim()
              .replace(/\s\s+/g, " ")
            )
          }
        }
      )

      $(".instructions-section-item").each((i, el) => {
        Recipe.recipeInstructions.push(
          $(el)
          .find("p")
          .text()
        )
      })

      $(".recipe-meta-item").each((i, el) => {
        const title = $(el)
          .children(".recipe-meta-item-header")
          .text()
          .replace(/\s*:|\s+(?=\s*)/g, "")
        const value = $(el)
          .children(".recipe-meta-item-body")
          .text()
          .replace(/\s\s+/g, "")
        switch (title) {
          case "prep":
            Recipe.prepTime = value
            break
          case "cook":
            Recipe.cookTime = value
            break
          case "active":
            //Recipe.time.active = value
          case "total":
            Recipe.totalTime = value
            break
          case "additional":
            //Recipe.time.inactive = value
            break
          case "Servings":
            Recipe.recipeYield = value
            break
          default:
            break
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

    }
  })
}

module.exports = eatingWell