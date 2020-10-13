const parseDomain = require("parse-domain"); // In einer späteren Version hat sich etwas geändert?
const cheerio = require("cheerio");
const fetch = require('node-fetch')


const domains = {
  alexandracooks: require("./modules/alexandracooks"),
  allrecipes: require("./modules/allrecipes"),
  ambitiouskitchen: require("./modules/ambitiouskitchen"),
  archanaskitchen: require("./modules/archanaskitchen"),
  budgetbytes: require("./modules/budgetbytes"),
  centraltexasfoodbank: require("./modules/centraltexasfoodbank"),
  closetcooking: require("./modules/closetcooking"),
  cookieandkate: require("./modules/cookieandkate"),
  copykat: require("./modules/copykat"),
  damndelicious: require("./modules/damndelicious"),
  eatingwell: require("./modules/eatingwell"),
  epicurious: require("./modules/epicurious"),
  foodandwine: require("./modules/foodandwine"),
  foodnetwork: require("./modules/foodnetwork"),
  gimmesomeoven: require("./modules/gimmesomeoven"),
  maangchi: require("./modules/maangchi"),
  minimalistbaker: require("./modules/minimalistbaker"),
  myrecipes: require("./modules/myrecipes"),
  nigella: require("./modules/nigella"),
  nomnompaleo: require("./modules/nomnompaleo"),
  omnivorescookbook: require("./modules/omnivorescookbook"),
  saveur: require("./modules/saveur"),
  smittenkitchen: require("./modules/smittenkitchen"),
  tastecooking: require("./modules/tastecooking"),
  therealfoodrds: require("./modules/therealfoodrds"),
  thespruceeats: require("./modules/thespruceeats"),
  thewoksoflife: require("./modules/thewoksoflife"),
  vegrecipesofindia: require("./modules/vegrecipesofindia"),
  whatsgabycooking: require("./modules/whatsgabycooking"),
  woolworths: require("./modules/woolworths"),
  yummly: require("./modules/yummly"),
  //"sallys-blog": require("./sallys-blog") //TODO: Scraper schreiben
};

const fallback = require("./modules/fallback")

/*
 * 1. Seite Parsen
 * 2. JSON-LD vorhanden?
 *   2.1 JA -->Weiter zu 3
 *   2.2 NEIN --> Prüfen, ob bereits ein Scrapper für die Seite existiert
 *   2.2.1 Ja --> JSON aus der Seite zusammenbauen
 *   2.2.2 Nein --> Default Scrapper probieren
 * 3. JSON an API übergeben
 */

const recipeScraper = url => {
  return new Promise((resolve, reject) => {
    getJson(url, parseRecipe, resolve, reject)
  })
}

function checkStatus(response) {
  if (response.ok) { // res.status >= 200 && res.status < 300
    return response;
  } else {
    console.log(myUrl + "Reponse Status: " + response.statusCode)
    reject(new Error("No recipe found on page"))
  }
}

function getJson(myUrl, callback, resolve, reject) {

  fetch(myUrl)
    .then(
      checkStatus)
    .then(res => res.text())
    .then(html => {

      const $ = cheerio.load(html)
      var json_ld_elements = $("script[type='application/ld+json']").toArray()

      for (var i in json_ld_elements) {
        for (var j in json_ld_elements[i].children) {
          var data = json_ld_elements[i].children[j].data
          if (data === undefined) {
            continue
          }

          try {
            // Some recipes have newlines inside quotes, which is invalid JSON. Fix this before continuing.
            // Old PHP: preg_replace('/\s+/', ' ', $string);
            data.replace('/\s+/', ' ')

            var json_ld_obj = JSON.parse(data)

            // Look through @graph field for recipe
            if (json_ld_obj && '@graph' in json_ld_obj && Array.isArray(json_ld_obj['@graph'])) {
              json_ld_obj['@graph'].forEach(graph => {
                if ('@type' in graph && graph["@type"] === "Recipe") {
                  if (!"@Context" in graph) {
                    graph["@Context"] = "http:\/\/schema.org"
                  }

                  if ('@type' in graph && graph["@type"] === "Recipe") {
                    //console.log(JSON.stringify(json_ld_obj, undefined, 2))
                    //console.log(myUrl + " JSON: True")
                    return resolve(graph)
                  }
                }
              });
            }

          } catch (error) {
            // Es werden auch Elemente gedunfen die nicht konvertiert werden können
            continue
          }

          if ('@type' in json_ld_obj && json_ld_obj["@type"] === "Recipe") {
            //console.log(JSON.stringify(json_ld_obj, undefined, 2))
            //console.log(myUrl + " JSON: True")
            return resolve(json_ld_obj)
          }
        }
      }
      return callback(myUrl, html, resolve, reject)
    })
    .catch(err => reject(new Error(err)))
}

function parseRecipe(myUrl, html, resolve, reject) {
  let parse = parseDomain(myUrl)

  if (parse) {
    let domain = parse.domain;
    if (domains[domain] !== undefined) {
      resolve(domains[domain](myUrl, html))

    } else {
      resolve(fallback(myUrl, html))
    }
  } else {
    reject(new Error("Failed to parse domain"))
  }
}

//TODO: Recipe-XML to JSON
const xmlToJson = () => {
  return new Promise((resolve, reject) => {

  })
}


module.exports = recipeScraper
//module.exports = xmlToJson