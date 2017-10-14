const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});
exports.syncComment = functions.database.ref('/events/{eventID}/users/{userID}/feedback/{blockID}/{cardID}/comment')
.onWrite(event => {
    var eventSnapshot = event.data;
    console.info("COMMENT-eventID: " + event.params.eventID); 
    console.info("COMMENT-blockID: " + event.params.blockID);
    console.info("COMMENT-cardID:  " + event.params.cardID);
    var _eventID=event.params.eventID;
    var _blockID=event.params.blockID;
    var _cardID=event.params.cardID;
    var _userID=event.params.userID;
    let collectionRef = admin.database().ref('/events/'+ _eventID +'/blocks/'+ _blockID + '/cards/' + _cardID + '/comments');
    if (!eventSnapshot.exists()) {
        collectionRef.child(_userID).remove().then(()=> {console.info('Comentario eliminado');});
        return;
    }
    return collectionRef.ref.child(_userID).set(eventSnapshot.val()).then(()=>{console.info('Comentario actualizado');});     
});
exports.syncKudo = functions.database.ref('/events/{eventID}/users/{userID}/feedback/{blockID}/{cardID}/kudos/{kudoID}')
.onWrite(event => {
    var eventSnapshot = event.data;
    console.info("eventID: " + event.params.eventID); 
    console.info("blockID: " + event.params.blockID);
    console.info("cardID:  " + event.params.cardID);
    console.info("kudoID:  " + event.params.kudoID);
    var _eventID=event.params.eventID;
    var _blockID=event.params.blockID;
    var _cardID=event.params.cardID;
    var _userID=event.params.userID;
    var _kudoID=event.params.kudoID;
    /* Debo identificar el kudo y contar todos los kudos registrados hasta el momento */
    let collectionRef = admin.database().ref('/events/'+ _eventID +'/blocks/'+ _blockID + '/cards/' + _cardID + '/statKudos/'+ _kudoID);

    return collectionRef.transaction(current => {
        if (event.data.exists() && !event.data.previous.exists()) {
          return (current || 0) + 1;
        }
        else if (!event.data.exists() && event.data.previous.exists()) {
          return (current || 0) - 1;
        }
      } 
    ).then(()=> {console.log('Contador KUDOS actualizado')});
});

exports.syncRating = functions.database.ref('/events/{eventID}/users/{userID}/feedback/{blockID}/{cardID}/rating')
.onWrite(event => {
    console.info("eventID: " + event.params.eventID); 
    console.info("blockID: " + event.params.blockID);
    console.info("cardID:  " + event.params.cardID);
    console.info("userID:  " + event.params.userID);
    var _eventID=event.params.eventID;
    var _blockID=event.params.blockID;
    var _cardID=event.params.cardID;
    var _userID=event.params.userID;
    /* Debo identificar el kudo y contar todos los kudos registrados hasta el momento */
    let collectionRef = admin.database().ref('/events/'+ _eventID +'/blocks/'+ _blockID + '/cards/' + _cardID + '/statRating/');

    collectionRef.child('users').transaction(current => {
      if (event.data.exists() && !event.data.previous.exists()) {
        console.info('Condicion 1 - USER: ' + event.data.val());
        return (current || 0) + 1;
      }
      else if (!event.data.exists() && event.data.previous.exists()) {
        console.info('Condicion 2 - USER: ' + event.data.val());
        return (current || 0) - 1;
      }
    });

    return collectionRef.child('total').transaction(current => {
        if (event.data.exists() && !event.data.previous.exists()) {
          console.info('Condicion 1 - Actual: ' + event.data.val());
          return (current || 0) + event.data.val();
        }
        else if (!event.data.exists() && event.data.previous.exists()) {
          console.info('Condicion 2 - Antes: ' + event.data.previous.val());
          return (current || 0) - event.data.previous.val();
        }
        else if (event.data.exists() && event.data.previous.exists()) {
          console.info('Condicion 3 - Antes :' + event.data.previous.val());
          console.info('Condicion 3 - Actual: ' + event.data.val());
          return (current || 0) - event.data.previous.val() + event.data.val();
        } 
      } 
    ).then(()=> {console.log('Contador RATING actualizado')});
});

