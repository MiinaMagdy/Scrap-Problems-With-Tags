# Scrap-Problems-With-Tags

***Scraping solved problems from Codeforces with tags***

## Requirements

- nodejs
- npm

## Installation

- Clone the repo
- Run `npm install dotenv`
- Run `npm install`

## Usage

- Rename `.env.example` to `.env`
- Fill the `.env` file with your Codeforces `handle`, `password` and `tags` you want to scrape
- Run `node index.js`
- The problems will be saved in the `problems.md` file

## Example

- Run `node .`
- The problems will be saved in `problems.md`

## .env.example

```bash
# .env file
userHandl = "Miina"
userPass = "********"
problemTags = "dp, greedy, math"
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
