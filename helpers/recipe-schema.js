function Recipe() {
  this.name = ""
  this.description = ""
  this.url = ""
  this.prepTime = ""
  this.cookTime = ""
  this.totalTime = ""
  this.recipeCategory = ""
  this.keywords = ""
  this.recipeYield = ""
  this.tool = []
  this.recipeIngredient = []
  this.recipeInstructions = []
  this.id = ""
  //this.@Context = "http:\/\/schema.org"
  //this.@type = "Recipe"
  this.dateCreated = "0"
  this.dateModified = ""
  this.printImage = true
  this.imageUrl = ""
}

module.exports = Recipe;
