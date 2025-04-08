import 'dotenv/config'
// console.log("PORT " + process.env.PORT)
// console.log("process.env.KEY",process.env.KEY)

// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs'

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({extended: true}))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express())

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')


// console.log('Let op: Er zijn nog geen routes. Voeg hier dus eerst jouw GET en POST routes toe.')

app.get('/', async function (request, response) {
  console.log("APP.GET")
  // Doe een fetch naar de data die je nodig hebt
  // const apiResponse = await fetch('https://fdnd.directus.app/items/person/65')
  const apiResponse = await fetch('https://fdnd.directus.app/items/person/?filter={"team":"Rocket"}')
  const messagesResponse = await fetch('https://fdnd.directus.app/items/messages/?filter={"for":"Team Rocket"}&sort=-created')
  
  const apiResponseJSON = await apiResponse.json()
  const messagesResponseJSON = await messagesResponse.json()
  // console.log(apiResponseJSON)

  // Render index.liquid uit de Views map
  // Geef hier eventueel data aan mee
  response.render('index.liquid', {
    team:"Rocket", 
    persons:apiResponseJSON.data,
    messages: messagesResponseJSON.data
  })
})

app.post('/', async function (request, response) {
  console.log("APP.POST")
  await fetch('https://fdnd.directus.app/items/messages/', {
    method: 'POST',
    body: JSON.stringify({
      for: `Team Rocket`,
      from: request.body.from,
      text: request.body.text
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });

  response.redirect(303, '/')
})

/*
// Zie https://expressjs.com/en/5x/api.html#app.get.method over app.get()
app.get(…, async function (request, response) {
  
  // Zie https://expressjs.com/en/5x/api.html#res.render over response.render()
  response.render(…)
})
*/

/*
// Zie https://expressjs.com/en/5x/api.html#app.post.method over app.post()
app.post(…, async function (request, response) {

  // In request.body zitten alle formuliervelden die een `name` attribuut hebben in je HTML
  console.log(request.body)

  // Via een fetch() naar Directus vullen we nieuwe gegevens in

  // Zie https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch over fetch()
  // Zie https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify over JSON.stringify()
  // Zie https://docs.directus.io/reference/items.html#create-an-item over het toevoegen van gegevens in Directus
  // Zie https://docs.directus.io/reference/items.html#update-an-item over het veranderen van gegevens in Directus
  await fetch(…, {
    method: …,
    body: JSON.stringify(…),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });

  // Redirect de gebruiker daarna naar een logische volgende stap
  // Zie https://expressjs.com/en/5x/api.html#res.redirect over response.redirect()
  response.redirect(303, …)
})
  */


app.get('/mywebsite', async function (request, response) {
  // Doe een fetch naar de data die je nodig hebt
  const apiResponse = await fetch(process.env.API+'?sort=-date_created')
  const apiResponseJSON = await apiResponse.json()
  // console.log(apiResponseJSON)

  // Render mywebsite.liquid uit de Views map
  // Geef hier data aan mee
  response.render('mywebsite.liquid', {
    persons:apiResponseJSON.data
  })
})

app.get('/mywebsite/:id', async function (request, response) {
  // Doe een fetch naar de data die je nodig hebt
  // const my_id = "cfbc1833-8687-47f2-9ae9-13cdb8843bde"
  const siteID = request.params.id
  const apiResponse = await fetch(process.env.API+siteID)
  // console.log(my_id)`
  
  const apiResponseJSON = await apiResponse.json()
  // console.log(apiResponseJSON)

  // Render mywebsite.liquid uit de Views map
  // Geef hier data aan mee
  response.render('mywebsite.liquid', {
    person:apiResponseJSON.data
  })
})




app.post('/savewebsite', async function (request, response) {
  // console.log("post - save my website",request.body)

  const patchResponse = await fetch(process.env.API+request.body.id, {
    
    method: 'PATCH',
    body: JSON.stringify({
      name: request.body.from,
      title: request.body.title,
      bio: request.body.text,
      style: request.body.code
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }

  })

  const patchResponseJSON = await patchResponse.json();
  // console.log("RESULT", response.status)
  const siteID = patchResponseJSON.data.id

  response.redirect(303, '/mywebsite/'+siteID)
})




app.post('/createwebsite', async function (request, response) {

  const postResponse = await fetch(process.env.API, {

    method: 'POST',
    body: JSON.stringify({
      name: request.body.from,
      title: request.body.title,
      bio: request.body.text,
      style: request.body.code
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }

  })

  const postResponseJSON = await postResponse.json();
  // console.log(postResponseJSON.data.id);
  const siteID = postResponseJSON.data.id

  response.redirect(303, '/mywebsite/'+siteID)
})






// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`click click click naar: http://localhost:${app.get('port')}/`)
})
