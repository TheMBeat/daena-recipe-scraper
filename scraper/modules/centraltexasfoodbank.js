const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")
const baseUrl = "https://www.centraltexasfoodbank.org"

const centralTexasFoodBank = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("centraltexasfoodbank.org/recipe")) {
      reject(
        new Error(
          "url provided must include 'centraltexasfoodbank.org/recipe/'"
        )
      )
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url

      Recipe.imageUrl = baseUrl + $("img[typeof='foaf:Image']").prop("src")
      Recipe.name = $("#block-basis-page-title")
        .find("span")
        .text()
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())

      $(".ingredients-container")
        .find(".field-item")
        .each((i, el) => {
          Recipe.recipeIngredient.push(
            $(el)
            .text()
            .trim()
          )
        })

      // Try a different pattern if first one fails
      if (!Recipe.recipeIngredient.length) {
        $(".field-name-field-ingredients")
          .children("div")
          .children("div")
          .each((i, el) => {
            Recipe.recipeIngredient.push(
              $(el)
              .text()
              .trim()
            )
          })
      }

      $(".bottom-section")
        .find("li")
        .each((i, el) => {
          Recipe.recipeInstructions.push($(el).text())
        })

      // Try a different pattern if first one fails
      if (!Recipe.recipeInstructions.length) {
        let done = false
        $(".bottom-section")
          .find("p")
          .each((i, el) => {
            if (!done && !$(el).children("strong").length) {
              let recipeInstructions = $(el)
                .text()
                .trim()
                .replace(/\s\s+/g, " ")
              if (!recipeInstructions.length) done = true
              let instructionList = recipeInstructions
                .replace(/\d+\.\s/g, "")
                .split("\n")
                .filter(instruction => !!instruction.length)
              Recipe.recipeInstructions.push(...instructionList)
            }
          })
      }

      Recipe.prepTime = $(".field-name-field-prep-time")
        .find("div")
        .text()
      Recipe.cookTime = $(".field-name-field-cooking-time")
        .find("div")
        .text()
      Recipe.recipeYield = $(".field-name-field-serves-")
        .find("div")
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

    }
  })
}

module.exports = centralTexasFoodBank