const cheerio = require("cheerio")

const RecipeSchema = require("../helpers/recipe-schema")

const defaultDomain = (url, html) => {
    const Recipe = new RecipeSchema()
    return new Promise((resolve, reject) => {

                const $ = cheerio.load(html);

                Recipe.url = url

                Recipe.image = $("meta[property='og:image']").attr("content")
                if (!Recipe.image) {
                    Recipe.image = ""
                }
                Recipe.name = $("meta[property='og:title']").attr("content")
                if (!Recipe.name) {
                    Recipe.name = $("meta[name='description']").attr("content")
                }

                // check if it is a tasty recipes plug in, and follow structure if yes.
                if ($('.tasty-recipes').length > 0) {
                    $(".tasty-recipes-ingredients")
                        .find("li")
                        .each((i, el) => {
                            Recipe.recipeIngredient.push($(el).text())
                        })

                    if (Recipe.recipeIngredient.length == 0) {
                        $(".tasty-recipe-ingredients")
                            .find("li")
                            .each((i, el) => {
                                Recipe.recipeIngredient.push($(el).text())
                            })
                    }

                    $(".tasty-recipes-instructions")
                        .find("li")
                        .each((i, el) => {
                            Recipe.recipeInstructions.push($(el).text())
                        })

                    if (Recipe.recipeInstructions.length == 0) {
                        $(".tasty-recipe-instructions")
                            .find("li")
                            .each((i, el) => {
                                Recipe.recipeInstructions.push($(el).text())
                            })
                    }

                    Recipe.prepTime = $(".tasty-recipes-prep-time").text()
                    Recipe.cookTime = $(".tasty-recipes-cook-time").text()
                    Recipe.totalTime = $(".tasty-recipes-total-time").text()

                    $(".tasty-recipes-yield-scale").remove()
                    Recipe.recipeYield = $(".tasty-recipes-yield")
                        .text()
                        .trim()
                } else if ($('.wprm-recipe').length > 0) {
                    if (!Recipe.name) {
                        Recipe.name = $(".wprm-recipe-name").text()
                    }

                    $(".wprm-recipe-ingredient-group").each((i, el) => {
                        $(el)
                            .find(".wprm-recipe-ingredient")
                            .each((i, el) => {
                                Recipe.recipeIngredient.push(
                                    $(el)
                                    .text()
                                    .replace(/\s\s+/g, " ")
                                    .trim()
                                )
                            })
                    })

                    $(".wprm-recipe-instruction-group").each((i, el) => {
                        Recipe.recipeInstructions.push(
                            $(el)
                            .children(".wprm-recipe-group-name")
                            .text()
                        )
                        $(el)
                            .find(".wprm-recipe-instruction-text")
                            .each((i, elChild) => {
                                Recipe.recipeInstructions.push($(elChild).text())
                            })
                    })

                    $(".wprm-recipe-time-container").each((i, el) => {
                        let label = ""
                        label = $(el)
                            .children(".wprm-recipe-time-label")
                            .text()

                        if (!label) {
                            console.log("FOUND A BLANK LABEL, CHECKING NEW LABEL")
                            label = $(el)
                                .children(".wprm-recipe-time-header")
                                .text()
                            console.log("HERE IS LABEL: ", label)
                        }
                        let time = $(el)
                            .children(".wprm-recipe-time")
                            .text().toLowerCase()
                        if (label.includes("prep")) {
                            Recipe.prepTime = time
                        } else if (label.includes("cook")) {
                            Recipe.cookTime = time
                        } else if (label.includes("resting")) {
                            //Recipe.time.inactive = time
                        } else if (label.includes("inactive")) {
                            //  Recipe.time.inactive = time
                        } else if (label.includes("total")) {
                            Recipe.totalTime = time
                        }
                    })

                    Recipe.recipeYield = $(".wprm-recipe-servings").text().trim()
                    if (!Recipe.recipeYield) {
                        Recipe.recipeYield = $(".wprm-recipe-servings-with-unit")
                            .text()
                            .trim()
                    }
                } else if ($('.mv-create-ingredients').length > 0) {

                    if (!Recipe.name) {
                        Recipe.name = $(".mv-create-title").text()
                    }

                    $(".mv-create-ingredients").find("li")
                        .each((i, el) => {
                            var text =
                                $(el)
                                .text()
                                .replace(/\s\s+/g, " ")
                                .trim()
                            if (text && text.toLowerCase() !== "ingredients") {
                                console.log("PUSHING THIS TEXT FOR INGREDIENTS: ", text)
                                Recipe.recipeIngredient.push(text)
                            }
                        })

                    $(".mv-create-instructions").find("li")
                        .each((i, el) => {
                            var text =
                                $(el)
                                .text()
                                .replace(/\s\s+/g, " ")
                                .trim()
                            if (text && text.toLowerCase() !== "instructions") {
                                console.log("PUSHING THIS TEXT FOR INSTRUCTIONS: ", text)
                                Recipe.recipeInstructions.push(text)
                            }
                        })
                    let prep = $(".mv-create-time-prep").text()
                    Recipe.prepTime = prep ? prep.match(/\d+/)[0] : ""

                    let active = $(".mv-create-time-active").text()
                    //Recipe.time.active = active ? active.match(/\d+/)[0] : ""

                    let inactive = $(".mv-create-time-additional").text()
                    //Recipe.time.inactive = inactive ? inactive.match(/\d+/)[0] : ""

                    let total = $(".mv-create-time-total").text()
                    Recipe.totalTime = total ? total.match(/\d+/)[0] : ""

                    let servings = $(".mv-create-nutrition-yield").text().trim().toLowerCase()
                    Recipe.recipeYield = servings.replace(":", "").replace("yield", "").replace("servings", "").trim()

                }
                // Fallbackfunction from PHP Backend
                // Noch implenetieren, vorerst Backend weiter nutzen
                // else{
                //      // Parse HTML if JSON couldn't be found
                //     $json = [];
                    
                //     $recipes = $xpath->query("//*[@itemtype='http://schema.org/Recipe']");

                //     if(!isset($recipes[0])) {
                //         throw new \Exception('Could not find recipe element');
                //     }

                //     $props = [
                //         'name',
                //         'image', 'images', 'thumbnail',
                //         'recipeYield',
                //         'keywords',
                //         'recipeIngredient', 'ingredients',
                //         'recipeInstructions', 'instructions', 'steps', 'guide',
                //     ];

                //     foreach($props as $prop) {
                //         $prop_elements = $xpath->query("//*[@itemprop='" . $prop . "']");

                //         foreach ($prop_elements as $prop_element) {
                //             switch ($prop) {
                //                 case 'image':
                //                 case 'images':
                //                 case 'thumbnail':
                //                     $prop = 'image';
                                    
                //                     if(!isset($json[$prop]) || !is_array($json[$prop])) { $json[$prop] = []; }

                //                     if(!empty($prop_element->getAttribute('src'))) {
                //                         array_push($json[$prop], $prop_element->getAttribute('src'));
                //                     } else if(
                //                         null !== $prop_element->getAttributeNode('content') &&
                //                         !empty($prop_element->getAttributeNode('content')->value)
                //                     ) {
                //                         array_push($json[$prop], $prop_element->getAttributeNode('content')->value);
                //                     }

                //                     break;

                //                 case 'recipeIngredient':
                //                 case 'ingredients':
                //                     $prop = 'recipeIngredient';
                                    
                //                     if(!isset($json[$prop]) || !is_array($json[$prop])) { $json[$prop] = []; }

                //                     if(
                //                         null !== $prop_element->getAttributeNode('content') &&
                //                         !empty($prop_element->getAttributeNode('content')->value)
                //                     ) {
                //                         array_push($json[$prop], $prop_element->getAttributeNode('content')->value);
                //                     } else {
                //                         array_push($json[$prop], $prop_element->nodeValue);
                //                     }
                                    
                //                     break;

                //                 case 'recipeInstructions':
                //                 case 'instructions':
                //                 case 'steps':
                //                 case 'guide':
                //                     $prop = 'recipeInstructions';
                                    
                //                     if(!isset($json[$prop]) || !is_array($json[$prop])) { $json[$prop] = []; }

                //                     if(
                //                         null !== $prop_element->getAttributeNode('content') &&
                //                         !empty($prop_element->getAttributeNode('content')->value)
                //                     ) {
                //                         array_push($json[$prop], $prop_element->getAttributeNode('content')->value);
                //                     } else {
                //                         array_push($json[$prop], $prop_element->nodeValue);
                //                     }
                //                     break;

                //                 default:
                //                     if (isset($json[$prop]) && $json[$prop]) { break; }

                //                     if(
                //                         null !== $prop_element->getAttributeNode('content') &&
                //                         !empty($prop_element->getAttributeNode('content')->value)
                //                     ) {
                //                         $json[$prop] = $prop_element->getAttributeNode('content')->value;
                //                     } else {
                //                         $json[$prop] = $prop_element->nodeValue;
                //                     }
                //                     break;
                //             }
                //         }
                //     }

                //     // Make one final desparate attempt at getting the instructions
                //     if (!isset($json['recipeInstructions']) || !$json['recipeInstructions'] || sizeof($json['recipeInstructions']) < 1) {
                //         $json['recipeInstructions'] = [];
                        
                //         $step_elements = $recipes[0]->getElementsByTagName('p');

                //         foreach ($step_elements as $step_element) {
                //             if(!$step_element || !$step_element->nodeValue) { continue; }

                //             array_push($json['recipeInstructions'], $step_element->nodeValue);
                //         }
                //     }
                    
                //     return $this->checkRecipe($json);
                // }

                if (Recipe.recipeIngredient.length === 0) {
                    Recipe.recipeIngredient = []
                }

                if (!Recipe.name) {
                    Recipe.name = ""
                }

                if (!Recipe.image) {
                    Recipe.image = ""
                }
                
                //console.log(JSON.stringify(Recipe, undefined, 2))
                console.log(url + " JSON: False")

                var json_ld_obj = Recipe
                
                if(!"@Context" in json_ld_obj)
                {
                    json_ld_obj["@Context"] = "http:\/\/schema.org"
                }

                if(!"@type" in json_ld_obj)
                {
                    json_ld_obj["@type"] = "Recipe"
                }

                resolve(json_ld_obj)
    })
}

module.exports = defaultDomain