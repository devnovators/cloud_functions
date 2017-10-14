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
    let collectionRef = admin.database().ref('/events/'+ _eventID +'/blocks/'+ _blockID + '/cards/' + _cardID + '/kudos/'+ _kudoID);

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

exports.syncRating = functions.database.ref('/events/{eventID}/users/{userID}/feedback/{blockID}/{cardID}/rating/{numStars}')
.onWrite(event => {
    console.info("eventID: " + event.params.eventID); 
    console.info("blockID: " + event.params.blockID);
    console.info("cardID:  " + event.params.cardID);
    console.info("kudoID:  " + event.params.kudoID);
    var _eventID=event.params.eventID;
    var _blockID=event.params.blockID;
    var _cardID=event.params.cardID;
    var _userID=event.params.userID;
    var _numStars=event.params.numStars;
    /* Debo identificar el kudo y contar todos los kudos registrados hasta el momento */
    let collectionRef = admin.database().ref('/events/'+ _eventID +'/blocks/'+ _blockID + '/cards/' + _cardID + '/numStars');

    return collectionRef.transaction(current => {
        if (event.data.exists() && !event.data.previous.exists()) {
          return (current || 0) + _numStars;
        }
        else if (!event.data.exists() && event.data.previous.exists()) {
          console.info(event.data.previous);
          return (current || 0) - _numStars;
        }
      } 
    ).then(()=> {console.log('Contador RATING actualizado')});
});


        /*
        let collectionRef = admin.database().ref('/events/{eventID}/blocks/{blockID}/{cardID}');
        let countRef = collectionRef.parent.child('stats/comments');
      
        return createThumbnail(profilePictureSnapshot.val())
        .then(url => {
          return eventSnapshot.ref.update({ profileThumbnail: url });
        });

        // Return the promise from countRef.transaction() so our function 
        // waits for this async event to complete before it exits.
        return countRef.transaction(current => {
          if (event.data.exists() && !event.data.previous.exists()) {
            return (current || 0) + 1;
          }
          else if (!event.data.exists() && event.data.previous.exists()) {
            return (current || 0) - 1;
          }
        }).then(() => {
          console.log('Counter updated.');
        });
        */
