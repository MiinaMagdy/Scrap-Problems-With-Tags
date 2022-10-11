# Scrap-Problems-With-Tags

***Scraping solved problems from Codeforces with tags***

## Requirements

- nodejs
- npm

## Installation

- Clone the repo
- Run `npm install`

## Usage

- Rename `.env.example` to `.env`
```
mv .env.example .env   # in linux terminal
```
- Fill the `.env` file with your Codeforces `handle`, `password` and `tags` you want to scrape
- Run `node index.js`
- The problems will be saved in the `problems.md` file

## .env.example

```bash
# .env file
userHandl = "Miina"
userPass = "********"
problemTags = "dp, greedy, math"
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Video

https://user-images.githubusercontent.com/71466151/195212905-98ae574c-75cc-47c7-9621-4425905ad9b6.mp4

