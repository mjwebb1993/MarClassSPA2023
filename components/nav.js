import html from "html-literal";

// constructing an HTML list of items from the array in Store
//  - .map formats the array elements into html
//      and constructs a new array from the results
//  - .join joins the elements of the new array into one long string
//  - data-navigo is a switch that allows Navigo to handle our page routing
export default links => html`
  <nav>
    <i class="fas fa-bars"></i>
    <ul class="hidden--mobile nav-links">
      ${links
        .map(link => {
          const linkAttribute = link.external
            ? 'target="_blank"'
            : "data-navigo";

          return `<li>
            <a href="${link.url}" title="${link.text}" ${linkAttribute}>
              ${link.text}
            </a>
          </li>`;
        })
        .join("")}
    </ul>
  </nav>
`;
