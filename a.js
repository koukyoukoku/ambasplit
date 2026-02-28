import youtubesearchapi from "youtube-search-api";

youtubesearchapi.GetListByKeyword("yume wo akiramenaide")
    .then((result) => { console.log(result); })
    .catch((error) => { console.error(error); });