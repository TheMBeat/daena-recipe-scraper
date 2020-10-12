# recipe-scraper for Nextcloud-Cookbook

**A JS package for scraping recipes from the web.**

## Installation

```sh
npm install recipe-scraper
```

## Usage

```javascript
// import the module
const recipeScraper = require("recipe-scraper");

// enter a supported recipe url as a parameter - returns a promise
async function someAsyncFunc() {
  ...
  let recipe = await recipeScraper("some.recipe.url");
  ...
}

// using Promise chaining
recipeScraper("some.recipe.url").then(recipe => {
    // do something with recipe
  }).catch(error => {
    // do something with error
  });
```

## Supported Websites *

All websites that deliver the recipe as structured data.
Additionally, scrapers were implemented for the web pages listed in the table.

| Website                               | JSON | Scrapper | NC Tested |
|:--------------------------------------|:----:|:--------:|:---------:|
| http://www.eatingwell.com/            |      |    JA    |           |
| http://www.gimmesomeoven.com/         |      |    JA    |           |
| https://alexandracooks.com/           |      |    JA    |           |
| https://cookieandkate.com/            |      |    JA    |           |
| https://copykat.com/                  |      |    JA    |           |
| https://damndelicious.net/            |      |    JA    |      403  |
| https://eat-this.org                  |      |   NEIN   |           |
| https://sallys-blog.de                |      |   NEIN   |           |
| https://smittenkitchen.com/           |      |    JA    |           |
| https://thepioneerwoman.com/          |  √   |          |           |
| https://therealfoodrds.com/           |      |    JA    |           |
| https://thewoksoflife.com/            |      |    JA    |           |
| https://whatsgabycooking.com/         |      |    JA    |           |
| https://www.101cookbooks.com/         |  √   |          |           |
| https://www.allrecipes.com/           |      |    JA    |           |
| https://www.ambitiouskitchen.com/     |      |    JA    |           |
| https://www.archanaskitchen.com       |      |    JA    |           |
| https://www.averiecooks.com/          |  √   |          |           |
| https://www.bbc.co.uk/                |  √   |          |           |
| https://www.bbcgoodfood.com/          |  √   |          |           |
| https://www.bonappetit.com/           |  √   |          |           |
| https://www.budgetbytes.com/          |      |    JA    |           |
| https://www.centraltexasfoodbank.org/ |      |    JA    |           |
| https://www.chefkoch.de/              |  √   |          |           |
| https://www.closetcooking.com/        |      |    JA    |           |
| https://www.epicurious.com/           |      |    JA    |           |
| https://www.food.com/                 |  √   |          |           |
| https://www.foodandwine.com/          |      |    JA    |           |
| https://www.foodnetwork.com/          |      |    JA    |           |
| https://www.kitchenstories.com/       |  √   |          |           |
| https://www.maangchi.com              |      |    JA    |           |
| https://www.minimalistbaker.com/      |      |    JA    |           |
| https://www.myrecipes.com/            |      |    JA    |           |
| https://www.nigella.com/              |      |    JA    |           |
| https://www.nomnompaleo.com/          |      |    JA    |           |
| https://www.omnivorescookbook.com/    |      |    JA    |           |
| https://www.saveur.com/               |      |    JA    |           |
| https://www.seriouseats.com/          |  √   |          |           |
| https://www.simplyrecipes.com/        |  √   |          |     403   |
| https://www.tastecooking.com/         |      |    JA    |           |
| https://www.thespruceeats.com/        |      |    JA    |           |
| https://www.vegrecipesofindia.com/    |      |    JA    |           |
| https://www.woolworths.com.au/        |      |    JA    |           |
| https://www.yummly.com/               |      |    JA    |           |



* Tested with https://search.google.com/structured-data/testing-tool?hl=de

Don't see a website you'd like to scrape? Open an [issue](https://github.com/jadkins89/Recipe-Scraper/issues) and we'll do our best to add it.

## Recipe Schema

Depending on the recipe, certain fields may be left blank. All fields are represented as strings or arrays of strings.

```javascript
{
  "name" = "",
  "description" = "",
  "url" = "",
  "prepTime" = "",
  "cookTime" = "",
  "totalTime" = "",
  "recipeCategory" = "",
  "keywords" = "",
  "recipeYield" = "",
  "recipeIngredient" = [],
  "recipeInstruction" = [],
  "id" = "",
  "@Context" = "http:\/\/schema.org",
  "@type" = "Recipe",
  "dateCreated" = "0",
  "dateModified" = "",
  "printImage" = true,
  "imageUrl" = "",
}
```

## Error Handling

If the url provided is invalid and a domain is unable to be parsed, an error message will be returned.

```javascript
recipeScraper("keyboard kitty").catch(error => {
  console.log(error.message);
  // => "Failed to parse domain"
});
```

If the url provided doesn't match a supported domain, an error message will be returned.

```javascript
recipeScraper("some.invalid.url").catch(error => {
  console.log(error.message);
  // => "Site not yet supported"
});
```

If a recipe is not found on a supported domain site, an error message will be returned.

```javascript
recipeScraper("some.no.recipe.url").catch(error => {
  console.log(error.message);
  // => "No recipe found on page"
});
```

If a page does not exist or some other 400+ error occurs when fetching, an error message will be returned.

```javascript
recipeScraper("some.nonexistent.page").catch(error => {
  console.log(error.message);
  // => "No recipe found on page"
});
```

If a supported url does not contain the proper sub-url to be a valid recipe, an error message will be returned including the sub-url required.

```javascript
recipeScraper("some.improper.url").catch(error => {
  console.log(error.message);
  // => "url provided must include '#subUrl'"
});
```

## Bugs

With web scraping comes a reliance on the website being used not changing format. If this occurs we need to update our scrape. We've integrated testing that should notify us if this occurs but please reach out if you are experiencing an issue.
