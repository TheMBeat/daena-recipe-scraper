const cheerio = require("cheerio")

const RecipeSchema = require("../../helpers/recipe-schema")

const allRecipes = (url, html) => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("allrecipes.com/recipe")) {
      reject(new Error("url provided must include 'allrecipes.com/recipe'"))
    } else {

      const $ = cheerio.load(html)

      Recipe.url = url

      // Check if recipe is in new format
      if ((Recipe.name = $(".intro").text())) {
        newAllRecipes($, Recipe)
      } else if ((Recipe.name = $("#recipe-main-content").text())) {
        oldAllRecipes($, Recipe)
      } else {
        reject(new Error("No recipe found on page"))
      }
      var json_ld_obj = Recipe

      if ("@Context" in json_ld_obj === false) {
        json_ld_obj["@Context"] = "http:\/\/schema.org"
      }

      if (!"@type" in json_ld_obj === false) {
        json_ld_obj["@type"] = "Recipe"
      }

      resolve(json_ld_obj)

    }
  })
}

const newAllRecipes = ($, Recipe) => {
  Recipe.imageUrl = $("meta[property='og:image']").attr("content")
  Recipe.name = Recipe.name.replace(/\s\s+/g, "")

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

  $(".ingredients-item").each((i, el) => {
    const ingredient = $(el)
      .text()
      .replace(/\s\s+/g, " ")
      .trim()
    Recipe.recipeIngredient.push(ingredient)
  })
  $($(".instructions-section-item").find("p")).each((i, el) => {
    const instruction = $(el).text()
    Recipe.recipeInstructions.push(instruction)
  })
}

const oldAllRecipes = ($, Recipe) => {
  Recipe.imageUrl = $("meta[property='og:image']").attr("content")

  $("#polaris-app label").each((i, el) => {
    const item = $(el)
      .text()
      .replace(/\s\s+/g, "")
    if (item != "Add all ingredients to list" && item != "") {
      Recipe.recipeIngredient.push(item)
    }
  })

  $(".step").each((i, el) => {
    const step = $(el)
      .text()
      .replace(/\s\s+/g, "")
    if (step != "") {
      Recipe.recipeInstructions.push(step)
    }
  })
  Recipe.prepTime = $("time[itemprop=prepTime]").text()
  Recipe.cookTime = $("time[itemprop=cookTime]").text()
  Recipe.totalTime = $("time[itemprop=totalTime]").text()
  Recipe.recipeYield = $("#metaRecipeServings").attr("content")
}

module.exports = allRecipes