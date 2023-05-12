import { header, nav, main, footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import axios from "axios";
import { camelCase } from "lodash";

const router = new Navigo("/");

function render(state = store.home) {
  document.querySelector("#root").innerHTML = `
    ${header(state)}
    ${nav(store.links)}
    ${main(state)}
    ${footer()}
  `;

  afterRender(state);

  router.updatePageLinks();
}

function afterRender(state) {
  // add menu toggle to bars icon in nav bar
  document.querySelector(".fa-bars").addEventListener("click", () => {
    document.querySelector("nav > ul").classList.toggle("hidden--mobile");
  });

  if (state.view === "Order") {
    document.querySelector("form").addEventListener("submit", event => {
      // Prevent the default action aka redirect to the same url using POST method
      event.preventDefault();

      const inputList = event.target.elements;
      console.log("Input Element List", inputList);

      const toppings = [];
      // // Interate over the toppings input group elements
      for (let input of inputList.toppings) {
        // If the value of the checked attribute is true then add the value to the toppings array
        if (input.checked) {
          toppings.push(input.value);
        }
      }

      const requestData = {
        customer: inputList.customer.value,
        crust: inputList.crust.value,
        cheese: inputList.cheese.value,
        sauce: inputList.sauce.value,
        toppings: toppings
      };
      console.log("request Body", requestData);

      axios
        .post(`${process.env.PIZZA_PLACE_API_URL}/pizzas`, requestData)
        .then(response => {
          // Push the new pizza onto the Pizza state pizzas attribute, so it can be displayed in the pizza list
          store.Pizza.pizzas.push(response.data);
          router.navigate("/Pizza");
        })
        .catch(error => {
          console.log("It puked", error);
        });
    });
  }
}

router.hooks({
  // Use object deconstruction to store the data and (query)params from the Navigo match parameter
  before: (done, { data, params }) => {
    // Check if data is null, view property exists, if not set view equal to "home"
    // using optional chaining (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
    const view = data?.view ? camelCase(data.view) : "home";
    // Add a switch case statement to handle multiple routes
    switch (view) {
      // New Case for the Home View
      case "home":
        axios
          // Get request to retrieve the current weather data using the API key and providing a city name
          .get(
            `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&q=st%20louis`
          )
          .then(response => {
            console.log(response.data);
            // Convert Kelvin to Fahrenheit since OpenWeatherMap does provide otherwise
            const kelvinToFahrenheit = kelvinTemp =>
              Math.round((kelvinTemp - 273.15) * (9 / 5) + 32);

            // Create an object to be stored in the Home state from the response
            store.home.weather = {
              city: response.data.name,
              temp: kelvinToFahrenheit(response.data.main.temp),
              feelsLike: kelvinToFahrenheit(response.data.main.feels_like),
              description: response.data.weather[0].main
            };
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
        break;
      case "pizza":
        // New Axios get request utilizing already made environment variable
        axios
          .get(`${process.env.PIZZA_PLACE_API_URL}/pizzas`)
          .then(response => {
            // We need to store the response to the state, in the next step but in the meantime let's see what it looks like so that we know what to store from the response.
            console.log("response", response);
            store.pizza.pizzas = response.data;
            done();
          })
          .catch(error => {
            console.log("It puked", error);
            done();
          });
        break;
      default:
        done();
    }
  },
  already: ({ data, params }) => {
    const view = data?.view ? camelCase(data.view) : "home";

    render(store[view]);
  }
});

router
  .on({
    "/": () => render(),
    // Use object destructuring assignment to store the data and (query)params from the Navigo match parameter
    // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
    // This reduces the number of checks that need to be performed
    ":view": ({ data, params }) => {
      // Change the :view data element to camel case and remove any dashes (support for multi-word views)
      const view = data?.view ? camelCase(data.view) : "home";
      if (view in store) {
        render(store[view]);
      } else {
        console.log(`View ${view} not defined`);
        render(store.viewNotFound);
      }
    }
  })
  .resolve();
