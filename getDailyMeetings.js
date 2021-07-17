const cheerio = require('cheerio');
const axios = require('axios');
const dbURI = 'mongodb+srv://admin:dTOmUQO1KF2xqqoP@cluster0.svwf0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const mongoose = require('mongoose');
const mongoOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true
}
const Meeting = require('./schema/Meeting.js');
console.log(Meeting);

mongoose.connect(dbURI, mongoOpts)
.then(result => {
  console.log('Connected to DB');
  let atTheRacesUrl = 'https://www.attheraces.com/racecards';
  let options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36'
    }
  };
  // fetch at the races data

  async function fetchUrl(url) {
    const {data} = await axios.get(url, options);
    return cheerio.load(data);
  }

  const daily = {};

  async function fetchRaceCards() {
    const atTheRaces = await fetchUrl(atTheRacesUrl, options);
    const panel = atTheRaces('.panel');
    const meetings = panel.find('.h6.visible');
    meetings.each((i, meetingEl) => {
      const meeting = atTheRaces(meetingEl);
      let meetingName = meeting.text().split(/[\s,]+/);
      meetingName.splice(-2,2);
      meetingName = meetingName.join(' ').trim();
      const meetingId = atTheRaces(meetingEl).parent().parent().next().attr('id');
      const meetingElById = atTheRaces(`#${meetingId}`);
      const raceCards = meetingElById.find('.post-text__t .a--plain');

      daily[meetingName] = [];

      raceCards.each(async (i, card) => {
        const cardUrl = 'https://www.attheraces.com' + atTheRaces(card).attr('href');
        const cardTime = atTheRaces(card).find('.h7').text().split(' - ')[0].trim();
        daily[meetingName].push({url: cardUrl, time: cardTime});
        
        // const atTheRacesCard = await fetchUrl(cardUrl, options);
        // const cardArea = atTheRacesCard('.card-body');
        // const cardEntries = cardArea.find('.card-entry');
        // cardEntries.each((j, entryEl) => {
        //   const entry = atTheRacesCard(entryEl);
        //   const horseNumber = entry.find('.p--large.font-weight--semibold').text().trim();
        //   const horseName = entry.find('.horse__link').text().split('(')[0].trim();
        //   console.log(horseNumber, horseName);
        // });
      });
    });

    fetchRaceCardData(daily);
  };

  async function fetchRaceCardData(daily) {
    for (let meetingName in daily) {
      for (let [index, meeting] of daily[meetingName].entries()) {
        const atTheRacesCard = await fetchUrl(meeting.url, options);
        const cardArea = atTheRacesCard('.card-body');
        const cardEntries = cardArea.find('.card-entry');
        cardEntries.each((j, entryEl) => {
          const entry = atTheRacesCard(entryEl);
          const horseNumber = entry.find('.p--large.font-weight--semibold').text().trim();
          const horseName = entry.find('.horse__link').text().split('(')[0].trim();
          if(daily[meetingName][index].hasOwnProperty('contestants')) {
            daily[meetingName][index].contestants.push({number: horseNumber, name: horseName})
          } else {
            daily[meetingName][index].contestants = [{number: horseNumber, name: horseName}];
          }
        });
      };
      let data = {json: JSON.stringify({[meetingName]: daily[meetingName]})};
      Meeting({json: data.json}).save((err, data) => {
        if(data) {
          console.log('Saved ' + data);
        } else {
          console.log('Something went wrong...');
        }
      });
    };

  };

  // fetchTitles();
  fetchRaceCards();
})
.catch(err => console.error(err));

