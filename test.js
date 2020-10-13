
// import the module
const recipeScraper = require("./scrapers/index.js");

const urls = [
    "http://www.eatingwell.com/recipe/264666/pressure-cooker-chicken-enchilada-soup/",
    "http://www.gimmesomeoven.com/grilled-chicken-kabobs/",
    "https://alexandracooks.com/2019/08/09/spicy-blistered-green-beans-with-garlic/",
    "https://cookieandkate.com/fresh-spring-rolls-recipe/",
    "https://copykat.com/homemade-croutons-made-in-an-air-fryer/",
    "https://minimalistbaker.com/fudgy-sweet-potato-brownies-v-gf/",
    "https://nomnompaleo.com/west-lake-beef-soup",
    "https://omnivorescookbook.com/dan-dan-noodles/",
    "https://sallys-blog.de/turkischer-gemuse-nudeleintopf-backen-mit-globus-sallys-welt-118",
    "https://smittenkitchen.com/2014/12/endives-with-oranges-and-almonds/",
    "https://therealfoodrds.com/veggie-loaded-turkey-chili/",
    "https://thewoksoflife.com/how-to-make-chili-oil/",
    "https://whatsgabycooking.com/cauliflower-rice-kale-bowls-instant-pot-black-beans/",
    "https://www.101cookbooks.com/coleslaw-recipe/",
    "https://www.allrecipes.com/recipe/274411/bucatini-cacio-e-pepe-roman-sheep-herders-pasta",
    "https://www.ambitiouskitchen.com/street-corn-pasta-salad-with-cilantro-pesto-goat-cheese/",
    "https://www.archanaskitchen.com/kanchipuram-idlis-recipe",
    "https://www.averiecooks.com/thai-chicken-coconut-curry/",
    "https://www.bbc.co.uk/food/recipes/sausage_and_gnocchi_bake_80924",
    "https://www.bbcgoodfood.com/recipes/1853652/doughnut-muffins",
    "https://www.bonappetit.com/recipe/soba-noodles-with-crispy-kale",
    "https://www.budgetbytes.com/chicken-lime-soup/",
    "https://www.centraltexasfoodbank.org/recipe/crock-pot-chicken-mole",
    "https://www.closetcooking.com/reina-pepiada-arepa-chicken-and-avocado-sandwich/",
    "https://www.eat-this.org/tempeh-selber-machen/",
    "https://www.epicurious.com/recipes/food/views/trout-toast-with-soft-scrambled-eggs",
    "https://www.food.com/recipe/oatmeal-raisin-cookies-35813",
    "https://www.foodandwine.com/recipes/french-onion-soup-ludo-lefebvre",
    "https://www.foodnetwork.com/recipes/food-network-kitchen/  cast-iron-skillet-provencal-pork-chops-and-potatoes-3542642",
    "https://www.kitchenstories.com/en/recipes/chorizo-breakfast-tacos-with-salsa-verde",
    "https://www.maangchi.com/recipe/dakgalbi",
    "https://www.myrecipes.com/recipe/London-broil-roasted-garlic-aioli",
    "https://www.nigella.com/recipes/butternut-squash-with-pecans-and-blue-cheese",
    "https://www.saveur.com/story/recipes/yellow-mole-with-fish-and-cactus-paddles/",
    "https://www.seriouseats.com/recipes/2019/08/korean-chilled-cucumber-soup-oi-naengguk-recipe.html",
    "https://www.tastecooking.com/recipes/sweet-and-sour-onion-petals/",
    "https://www.thepioneerwoman.com/food-cooking/recipes/a86873/french-dip-sandwiches/",
    "https://www.thespruceeats.com/grilled-squid-recipe-1808848",
    "https://www.vegrecipesofindia.com/pav-bhaji-recipe-mumbai-pav-bhaji-a-fastfood-recipe-from-mumbai/",
    "https://www.woolworths.com.au/shop/recipedetail/5156/classic-guacamole",
    "https://www.yummly.com/recipe/No-Bake-Lemon-Mango-Cheesecakes-with-Speculoos-crust-781945",
    // "https://www.finecooking.com/recipe/white-chicken-chili",
    //Response 403 "https://damndelicious.net/2019/08/20/raspberry-croissant-french-toast-bake/",
    //Response 403 "https://www.simplyrecipes.com/recipes/chicken_panzanella_salad/",
]


// urls.forEach(element => {
//     // using Promise chaining
//     recipeScraper(element).then(recipe => {
//         console.log(JSON.stringify(recipe, undefined, 2))
//     }).catch(error => {
//         console.log(error)
//     });
// });

recipeScraper(urls[2]).then(recipe => {
    console.log(JSON.stringify(recipe, undefined, 2))
}).catch(error => {
    console.log(error)
});

