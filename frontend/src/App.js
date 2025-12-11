import React from 'react';
import SeatSelector from './SeatSelecter.jsx';

function App(){
  const EVENT_ID = '<paste event id here>';
  const USER_ID = 'user1';
  return <div style={{padding:20}}>
    <h1>Ticketing demo</h1>
    <SeatSelector eventId={EVENT_ID} userId={USER_ID} />
  </div>;
}

export default App;

