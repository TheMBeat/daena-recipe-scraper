const fetch = require('node-fetch')
const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const urlRe = /\/(\d\d\d\d)\//
const instructionsIndexRe = /(?:\d.)(.*)/
const instructionsTipRe = /(Tip:)(.*)/i

function checkStatus(response) {
  if (response.ok) { // res.status >= 200 && res.status < 300
    return response;
  } else {
    console.log(myUrl + "Reponse Status: " + response.statusCode)
    reject(new Error("No recipe found on page"))
  }
}

const woolworths = url => {
  const Recipe = new RecipeSchema()
  return new Promise((resolve, reject) => {
    if (!url.includes("woolworths.com.au/shop/recipedetail/")) {
      reject(
        new Error(
          "url provided must include 'woolworths.com.au/shop/recipedetail/'"
        )
      )
    } else if (!urlRe.test(url)) {
      reject(new Error("No recipe found on page"))
    } else {
      const recipeId = urlRe.exec(url)[1]
      recipeJsonUrl = `https://www.woolworths.com.au/apis/ui/recipes/${recipeId}`

      fetch(recipeJsonUrl)
        .then(
          checkStatus)
        .then(res => res.json())
        .then(html => {
          const $ = cheerio.load(html)

          Recipe.url = url
          Recipe.imageUrl = html.ImageFilename
          Recipe.name = html.Title.trim()
          Recipe.recipeIngredient = html.Ingredients.map(i =>
            i.Description.trim()
          )
          Recipe.prepTime = html.PreparationDuration.toString()
          Recipe.cookTime = html.CookingDuration.toString()
          Recipe.recipeYield = html.Servings.toString()
          html.Instructions.split("\r\n").map(step => {
            let newIngredient = ""
            if (instructionsIndexRe.test(step)) {
              newIngredient = instructionsIndexRe.exec(step)[1].trim()
            } else if (instructionsTipRe.test(step)) {
              newIngredient = step.trim()
            }
            if (newIngredient.length) {
              Recipe.recipeInstructions.push(newIngredient)
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

        })
    }
  })
}

module.exports = woolworths