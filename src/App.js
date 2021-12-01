import React, { useState, useEffect } from 'react';

const { gapi } = window;

const CLIENT_ID = '21771173827-darl8kjorgcnu0chelaillutki3fqc5e.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCuU61dFOxsqTw0 wu8qvRSisl5nqTG4vbA';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

const ONE_SECOND = 1000;

const filterString = (string) => string
  .split('\n')
  .filter((line) => line)
  .map((filterLines) => filterLines.split(/zoom/i)[0])
  .filter((char) => char[0] !== ' ')
  .map((filterLines) => {
    const filterObligated = filterLines.split('[*]');
    return filterObligated[1] ? filterObligated[1].trim() : filterObligated[0];
  })
  .map((filterLines) => {
    const filterArray = filterLines.split('-');
    return {
      title: filterArray[1].trim(),
      startTime: filterArray[0].split('às')[0].replace('h', ':').trim(),
      endTime: filterArray[0].split('às')[1].replace('h', ':').trim(),
    };
  });

const getCurrentDate = () => {
  const date = new Date();
  const fullYear = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  console.log(`${fullYear}-${month}-${day}`);
  return `${fullYear}-${month + 1}-${day}`;
};

const eventFormat = (title, startTime, endTime) => ({
  summary: title,
  location: 'Remoto',
  description: '',
  start: {
    dateTime: `${getCurrentDate()}T${startTime}:00-03:00`,
    timeZone: 'America/Sao_Paulo',
  },
  end: {
    dateTime: `${getCurrentDate()}T${endTime}:00-03:00`,
    timeZone: 'America/Sao_Paulo',
  },
  reminders: {
    useDefault: false,
    overrides: [
      { method: 'popup', minutes: 10 },
    ],
  },
  colorId: '2',
});

const delayLoop = (func, delay) => (param, i) => {
  setTimeout(() => {
    func(param);
  }, i * delay);
};

function App() {
  const [scheduleValue, changeScheduleValue] = useState('');
  const [isSignedIn, changeSignedInState] = useState(false);

  const handleClick = () => {
    const scheduleFiltered = filterString(scheduleValue);
    scheduleFiltered.forEach(delayLoop(({ title, startTime, endTime }) => {
      console.log(`${title} - ${startTime} - ${endTime}`);
      const request = gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: eventFormat(title, startTime, endTime),
      });
      request.execute((event) => {
        console.log(event);
      });
    }, ONE_SECOND));
  };

  const handleAuthClick = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  const handleSignoutClick = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  useEffect(() => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        gapi.auth2.getAuthInstance().isSignedIn.listen(changeSignedInState);
        changeSignedInState(gapi.auth2.getAuthInstance().isSignedIn.get());
      }).catch((error) => console.log(`Error intialize:${error}`));

      gapi.client.load('calendar', 'v3');
    });
  }, []);

  return (
    <main>
      <button
        type="button"
        onClick={ isSignedIn ? handleSignoutClick : handleAuthClick }
      >
        { isSignedIn ? 'Sair' : 'Logar' }
      </button>
      <textarea
        cols="30"
        onChange={ ({ target: { value } }) => changeScheduleValue(value) }
        rows="10"
        placeholder="Cole aqui a agenda do dia"
      />
      <button
        type="button"
        onClick={ handleClick }
      >
        Adicionar
      </button>
    </main>
  );
}

export default App;