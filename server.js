// import 'dotenv/config'
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


  //FILE SYSTEM
  /*
  import fs from 'fs'

  const img = './public/img/businessman-loop.gif'
  //FILTE SYSTEM UITLEZEN
  const stats = fs.statSync(img)
  console.log("FS",stats)
  // const fileSizeInBytes = stats.size;
  // console.log('Size in bytes:', fileSizeInBytes);
  // const fileSizeInMegaBytes = fileSizeInBytes / (1024 * 1024);
  // console.log('Size in MegaBytes:', fileSizeInMegaBytes);
`
  import sizeOf from 'image-size'

  const { height, width } = sizeOf(img)
  console.log(height, width)
*/
  
app.get('/performance', async function (request, response) {
  //https://nodejs.org/api/fs.html#fs_fs_stat_path_callback
  //https://bobbyhadz.com/blog/get-size-of-file-in-node-js

  response.render('performance.liquid')
})



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
  console.log("APP.POST", request.body)
  const postResponse = await fetch('https://fdnd.directus.app/items/messages/', {
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

  const postResponseJSON = await postResponse.json();
  console.log(postResponseJSON);

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



app.get('/messageboard', async function (request, response) {
  console.log("MESSAGEBOARD GET")
  // Fetch de data die je nodig hebt, de messages met filter Team Rocket
  const messagesResponse = await fetch('https://fdnd.directus.app/items/messages/?filter={"for":"Team Rocket"}&sort=-created')
  const messagesResponseJSON = await messagesResponse.json()

  // Render de bijhorende view en geef hier data mee
  response.render('messageboard.liquid', {
    messages: messagesResponseJSON.data
  })
})
app.post('/message', async function (request, response) {
  console.log("MESSAGEBOARD POST MESSAGE", request.body)
  const postResponse = await fetch('https://fdnd.directus.app/items/messages/', {
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

  if(request.body.enhanced){
    console.log("if clientside")
    const postResponseJSON = await postResponse.json();
    //Als we een clientside post hebben, dan renderen we alleen de partial met de data die net gepost is
    response.render('partials/message.liquid', {message: postResponseJSON.data})

  }else{
    console.log("if serverside")
    response.redirect(303, '/messageboard')
  }
})


// ALLE WERKNEMERS
app.get('/fresk', async function (request, response) {
    // const role = request.params.role
    const dynamicRole = await fetch(`https://fdnd-fresk-api.netlify.app/get-content-by-role?userRole=mechanic`)
    const dynamicRoleJSON = await dynamicRole.json()
    // console.log("dynamicRoleJSON",dynamicRoleJSON)

    // const mechanic = await fetch(`https://fdnd-fresk-api.netlify.app/get-content-by-role?userRole=mechanic`)
    // const mechanicJSON = await mechanic.json()

    // console.log(mechanicJSON)

    // response.render('dashboard.liquid', {
      // console.log("commonData",dynamicRoleJSON.commonData)
      // console.log("roleSpecificData",dynamicRoleJSON.roleSpecificData)
      // console.log("assignedRepairJobs",dynamicRoleJSON.roleSpecificData.assignedRepairJobs)
      console.log("systemDiagnosticData",dynamicRoleJSON.roleSpecificData.systemDiagnosticData)
      const JSON_Obj = dynamicRoleJSON.roleSpecificData.systemDiagnosticData
      for (var bleh in JSON_Obj) {
          console.log(bleh);
          // console.log(JSON_Obj[key]);
      }
      // Render de bijhorende view en geef hier data mee
      response.render('fresk.liquid', {
        dynamicRole: dynamicRoleJSON
      })
})






/*
app.get('/message', async function (request, response) {
  console.log("MESSAGE GET")
  // Render message.liquid uit de Views map mee
  const msgObj = {
    created:"2025-04-03T10:59:58.942Z",
    from:"Kopo Dopo",
    text: "Responsve obj created. Het werkt. Nu de post response oppakken, komt er dan terug wat er (succesvol) is opgeslagen?"
  }
  // console.log("MSG",msgObj)
  // let jsonObject = JSON.parse(jsonString);

  response.render('partials/message.liquid', {message: msgObj})
})
*/


// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`click click click naar: http://localhost:${app.get('port')}/`)
})
