const parseDomain = require("parse-domain");
const request = require("request"); // Sollte irgendwann ersetzt werden
const cheerio = require("cheerio");


const domains = {
  alexandracooks: require("./alexandracooks"),
  allrecipes: require("./allrecipes"),
  ambitiouskitchen: require("./ambitiouskitchen"),
  archanaskitchen: require("./archanaskitchen"),
  budgetbytes: require("./budgetbytes"),
  centraltexasfoodbank: require("./centraltexasfoodbank"),
  closetcooking: require("./closetcooking"),
  cookieandkate: require("./cookieandkate"),
  copykat: require("./copykat"),
  damndelicious: require("./damndelicious"),
  eatingwell: require("./eatingwell"),
  epicurious: require("./epicurious"),
  foodandwine: require("./foodandwine"),
  foodnetwork: require("./foodnetwork"),
  gimmesomeoven: require("./gimmesomeoven"),
  maangchi: require("./maangchi"),
  minimalistbaker: require("./minimalistbaker"),
  myrecipes: require("./myrecipes"),
  nigella: require("./nigella"),
  nomnompaleo: require("./nomnompaleo"),
  omnivorescookbook: require("./omnivorescookbook"),
  saveur: require("./saveur"),
  smittenkitchen: require("./smittenkitchen"),
  tastecooking: require("./tastecooking"),
  therealfoodrds: require("./therealfoodrds"),
  thespruceeats: require("./thespruceeats"),
  thewoksoflife: require("./thewoksoflife"),
  vegrecipesofindia: require("./vegrecipesofindia"),
  whatsgabycooking: require("./whatsgabycooking"),
  woolworths: require("./woolworths"),
  yummly: require("./yummly"),
  //"sallys-blog": require("./sallys-blog") //TODO: Scraper schreiben
};

const fallback = require("./fallback")

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

function getJson(myUrl, callback, resolve, reject) {    
  request(myUrl, (error, response, html) => {
    json_ld_obj = null
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html)
      var json_ld_elements = $("script[type='application/ld+json']").toArray()

      for (var i in json_ld_elements) {
        for (var j in json_ld_elements[i].children) {
          var data = json_ld_elements[i].children[j].data
          if(data === undefined)
          {
            continue
          }

          try {
            // Some recipes have newlines inside quotes, which is invalid JSON. Fix this before continuing.
            // Old PHP: preg_replace('/\s+/', ' ', $string);
            data.replace('/\s+/', ' ')

            var json_ld_obj = JSON.parse(data)

            // Look through @graph field for recipe
            if(json_ld_obj && '@graph' in json_ld_obj && Array.isArray(json_ld_obj['@graph']))
            {
              json_ld_obj['@graph'].forEach(graph  => {
                if ('@type' in graph && graph["@type"] === "Recipe")
                {
                  if(!"@Context" in graph)
                  {
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
    } 
    else 
    {
      console.log(myUrl + "Reponse Status: "+ response.statusCode)
      reject(new Error("No recipe found on page"));
    }
  })
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