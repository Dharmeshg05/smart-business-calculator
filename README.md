# Smart Business Calculator

A responsive, browser-based business calculator built with **HTML, CSS and vanilla JavaScript**. It provides quick estimates for common pricing and business calculations.

## Features

- **GST Calculator** — add GST to a base amount or extract GST from an inclusive amount; shows CGST and SGST split.
- **Profit & Loss Calculator** — calculate profit/loss amount and percentage based on cost and selling price.
- **Discount Calculator** — calculate savings and final sale price.
- **Profit Margin Calculator** — calculate profit/loss margin and markup.
- Dark and light themes.
- Copy calculation results.
- Responsive layout for mobile, tablet and desktop.
- No framework, build step, account or backend required.

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

You can also use a local development server, for example the VS Code Live Server extension.

## Project files

```text
smart-business-calculator/
├── index.html
├── style.css
├── script.js
├── README.md
└── LICENSE
```

## Calculation notes

- GST inclusive mode extracts the tax portion from the entered total.
- The GST calculator displays an equal CGST/SGST split as a simple intra-state estimate. Inter-state IGST is not separately modelled.
- Profit percentage is calculated against cost price.
- Profit margin is calculated against revenue; markup is calculated against cost.
- Results are estimates. Confirm applicable tax treatment and rates with a qualified professional.

## Contributing

Issues and pull requests are welcome. For substantial changes, please open an issue first to discuss the proposed update.

## License

Released under the MIT License. See [LICENSE](LICENSE).
