//a primary functionality is to read the users preferences from a data pod

//A central aspect of this program is enabling users to define specifications
// These functions enable the user to save specifications to their dataPod
// Docs for the imported libraries: https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/read-write-data/

//We will create a class of object called UserSpecifications to handle the data while user is logged in
//These functions require that the application has either append or write access to the directory

// i am imagining a table of specifications
//Next to each spec is a slider button that changes color (red=false/off, green =true/on)

/*function getSpecifications() does:
	take as arguments the location of the specification data structure
	iterate through the specification dataStructure
	for each spec
		get the name and use it to create a hyperlink object pointing to definition
		create an indicator to True or False
		append the hyperlink and indicator into a tabular data display format
	create the html to display the tabular data*/

const inruptPodHostURL = 'https://storage.inrupt.com/'

//The following example uses solid-client-authn-browser to authenticate a user 
//and use the authenticated Session’s fetch() function to make authenticated requests:

import { handleIncomingRedirect, login, fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser'
import { getSolidDataset, saveSolidDatasetAt } from "@inrupt/solid-client";

async function loginAndFetch() {
  // 1. Call the handleIncomingRedirect() function,
  //    - Which completes the login flow if redirected back to this page as part of login; or
  //    - Which is a No-op if not part of login.
  await handleIncomingRedirect();

  // 2. Start the Login Process if not already logged in.
  if (!getDefaultSession().info.isLoggedIn) {
    await login({
      oidcIssuer: "https://login.inrupt.com",
      redirectUrl: window.location.href,
      clientName: "My application"
    });
  }

  // ...
  // const exampleSolidDatasetURL = ...;
  
  // 3. Make authenticated requests by passing `fetch` to the solid-client functions.
  // For example, the user must be someone with Read access to the specified URL.
  const myDataset = await getSolidDataset(
    exampleSolidDatasetURL, 
    { fetch: fetch }  // fetch function from authenticated session
  );

  // ...
  
  // For example, the user must be someone with Write access to the specified URL.
  const savedSolidDataset = await saveSolidDatasetAt(
    exampleSolidDatasetURL,
    myChangedDataset,
    { fetch: fetch }  // fetch function from authenticated session
  );
}

loginAndFetch();

//
//
//
//
//in this example we will create a new dataset and add some data to it
import { login, handleIncomingRedirect, getDefaultSession, fetch } from "@inrupt/solid-client-authn-browser";

import {
  addUrl,
  addStringNoLocale,
  buildThing,
  createSolidDataset,
  createThing,
  setThing,
  saveSolidDatasetAt,
  getThing,  
  setStringNoLocale,
  saveSolidDatasetAt,
} from "@inrupt/solid-client";
import { SCHEMA_INRUPT, RDF } from "@inrupt/vocab-common-rdf";

// Create a new SolidDataset for Writing 101
let courseSolidDataset = createSolidDataset();

// Create a new Thing for "book1"; Thing's URL will include the hash #book1.
// Use Fluent API to add properties to the new Thing, and 
// build a new Thing with the properties.
// Note: solid-client functions do not modify objects passed in as arguments. 
// Instead the functions return new objects with the modifications.
const newBookThing1 = buildThing(createThing({ name: "book1" }))
  .addStringNoLocale(SCHEMA_INRUPT.name, "ABC123 of Example Literature")
  .addUrl(RDF.type, "https://schema.org/Book")
  .build();           


// Update SolidDataset with the book1 and book2 Things.
// Note: solid-client functions do not modify objects passed in as arguments. 
// Instead the functions return new objects with the modifications.
courseSolidDataset = setThing(courseSolidDataset, newBookThing1);
courseSolidDataset = setThing(courseSolidDataset, newBookThing2);

// Save the SolidDataset at the specified URL.
// The function returns a SolidDataset that reflects your sent data
const savedSolidDataset = await saveSolidDatasetAt(
  "https://pod.example.com/universityZ/fall2021/courses/Writing101",
  courseSolidDataset,
  { fetch: fetch }             // fetch from authenticated Session
);

//Note that any necessary containers are created if the do not exist already

//RETRIEVING DATA FROM DATASET and APPENDING DATA TO DATASET

// Get the SolidDataset for Writing 101 at the specified URL
const resourceURL = "https://pod.example.com/universityZ/fall2021/courses/Writing101";
let courseSolidDataset = await getSolidDataset(
  resourceURL,
  { fetch: fetch }
);


// Get the "book1" Thing from the retrieved SolidDataset; the Thing's URL will be the SolidDatatset URL with hash #book1.
// Use Fluent API to add a new property to the Thing, and 
// build a new Thing with the added property.
// Note: solid-client functions do not modify objects passed in as arguments. 
// Instead the functions return new objects with the modifications.
let book1Thing = getThing(courseSolidDataset, `${resourceURL}#book1`);
book1Thing = buildThing(book1Thing)
  .addInteger("https://schema.org/numberOfPages", 30)
  .build();


// Create a new Thing for "location"; Thing's URL will include the hash #location.
// Use Fluent API to add properties to the new Thing, and 
// build a new Thing with the properties.
// Note: solid-client functions do not modify objects passed in as arguments. 
// Instead the functions return new objects with the modifications.
const locationThing = buildThing(createThing({ name: "location" }))
  .addStringNoLocale(SCHEMA_INRUPT.name, "Sample Lecture Hall")
  .addUrl(RDF.type, "https://schema.org/Place")
  .build();

// Update SolidDataset with the book1 and book2 and location Things.
// Note: solid-client functions do not modify objects passed in as arguments. 
// Instead the functions return new objects with the modifications.
courseSolidDataset = setThing(courseSolidDataset, book1Thing);
courseSolidDataset = setThing(courseSolidDataset, book2Thing);
courseSolidDataset = setThing(courseSolidDataset, locationThing);

// Save the SolidDataset at the specified URL.
// The function returns a SolidDataset that reflects your sent data
const savedSolidDataset = await saveSolidDatasetAt(
  resourceURL,
  courseSolidDataset,
  { fetch: fetch }             // fetch from authenticated Session
);

