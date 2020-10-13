const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const smittenKitchen = url => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("smittenkitchen.com/")) {
      reject(new Error("url provided must include 'smittenkitchen.com/'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url
      if ($(".jetpack-recipe").length) {
        newSmitten($, Recipe)
      } else {
        oldSmitten($, Recipe)
      }
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

const oldSmitten = ($, Recipe) => {
  const body = $(".entry-content").children("p")
  let ingredientSwitch = false
  let orderedListRegex = new RegExp(/\d\.\s/)
  let servingWords = ["Yield", "Serve", "Servings"]
  let servingsRegex = new RegExp(servingWords.join("|"), "i")

  Recipe.imageUrl = $("meta[property='og:image']").attr("content")
  body.each((i, el) => {
    if (i === 0) {
      Recipe.name = $(el)
        .children("b")
        .text()
        .trim()
    } else if (
      $(el).children("br").length &&
      !$(el).children("b").length &&
      !orderedListRegex.test($(el).text()) &&
      !servingsRegex.test($(el).text())
    ) {
      ingredientSwitch = true
      let updatedIngredients = Recipe.recipeIngredient.concat(
        $(el)
        .text()
        .trim()
        .split("\n")
      )
      Recipe.recipeIngredient = updatedIngredients
    } else if (ingredientSwitch) {
      let updatedInstructions = Recipe.recipeInstructions.concat(
        $(el)
        .text()
        .trim()
        .split("\n")
      )
      Recipe.recipeInstructions = updatedInstructions
    } else {
      let possibleServing = $(el).text()
      if (servingsRegex.test(possibleServing)) {
        possibleServing.split("\n").forEach(line => {
          if (servingsRegex.test(line)) {
            Recipe.recipeYield = line.substring(line.indexOf(":") + 2)
          }
        })
      }
    }
  })
}

const newSmitten = ($, Recipe) => {
  Recipe.image = $("meta[property='og:image']").attr("content")
  Recipe.name = $(".jetpack-recipe-title").text()

  $(".jetpack-recipe-ingredients")
    .children("ul")
    .first()
    .children()
    .each((i, el) => {
      Recipe.recipeIngredient.push($(el).text())
    })

  Recipe.recipeInstructions = $(".jetpack-recipe-directions")
    .text()
    .split("\n")
    .filter(instruction => {
      if (
        !instruction ||
        instruction.includes("Do More:TwitterFacebookPinterestPrintEmail") ||
        instruction.includes("\t")
      ) {
        return false
      }
      return true
    })

  if (!Recipe.recipeInstructions.length) {
    let lastIngredient = Recipe.ingredients[Recipe.ingredients.length - 1]
    let recipeContents = $(".entry-content").text()
    Recipe.recipeInstructions = recipeContents
      .slice(
        recipeContents.indexOf(lastIngredient) + lastIngredient.length,
        recipeContents.indexOf("Rate this:")
      )
      .split("\n")
      .filter(instruction => {
        if (
          !instruction ||
          instruction.includes("Do More:TwitterFacebookPinterestPrintEmail") ||
          instruction.includes("\t")
        ) {
          return false
        }
        return true
      })
  }

  Recipe.totalTime = $("time[itemprop=totalTime]")
    .text()
    .replace("Time: ", "")

  Recipe.recipeYield = $(".jetpack-recipe-servings")
    .text()
    .replace("Servings: ", "")
}

module.exports = smittenKitchen