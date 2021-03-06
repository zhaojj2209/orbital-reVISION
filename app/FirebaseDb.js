import * as firebase from "firebase";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBsHIVNM4MQmLKQ80scysmW2NTXg6j3hmo",
  authDomain: "orbital-revision-67b30.firebaseapp.com",
  databaseURL: "https://orbital-revision-67b30.firebaseio.com",
  projectId: "orbital-revision-67b30",
  storageBucket: "orbital-revision-67b30.appspot.com",
  messagingSenderId: "389104031481",
  appId: "1:389104031481:web:dcfb4f6bf161460ddcf428",
};

firebase.initializeApp(firebaseConfig);
firebase.firestore();

const users = firebase.firestore().collection("users");

export const getEventsDb = (userId) => users.doc(userId).collection("events");

export const getCategoriesDb = (userId) =>
  users.doc(userId).collection("categories");

export const getTasksDb = (userId) => users.doc(userId).collection("tasks");

export const getSleepSchedule = (userId) =>
  users.doc(userId).collection("sleep").doc("schedule");

export default firebase;
