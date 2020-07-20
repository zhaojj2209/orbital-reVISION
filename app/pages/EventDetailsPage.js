import React from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Button,
  Alert,
} from "react-native";

import firebase from "../FirebaseDb";
import { formatDateDisplay, formatDate } from "../constants/DateFormats";

export default function EventDetailsPage({ route, navigation }) {
  const { userId, event, categories } = route.params;
  const {
    title,
    description,
    startDate,
    endDate,
    category,
    repeat,
    repeatDate,
    repeatId,
  } = event.data;

  const handleDeleteEvent = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .doc(event.key)
      .delete()
      .then(() =>
        Alert.alert("Event Deleted", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ])
      );
  };

  const handleDeleteAllEvents = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .where("repeatId", "==", repeatId)
      .get()
      .then((querySnapshot) => {
        querySnapshot.docs.forEach((documentSnapshot) => {
          documentSnapshot.ref.delete();
        });
      })
      .then(() =>
        Alert.alert("Event Deleted", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ])
      );
  };

  const startDateString = "Start: " + formatDateDisplay(startDate);
  const endDateString = "End: " + formatDateDisplay(endDate);

  const categoryString = () => {
    const filtered = categories.filter((cat) => cat.key == category);
    return (
      "Category: " +
      (filtered.length
        ? filtered[0].data.title
        : category.length == 0
        ? "None"
        : "Study Session")
    );
  };

  const repeatString =
    "Repeat: " +
    repeat +
    (repeat != "None" ? " until " + formatDate(repeatDate) : "");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.details}>
        <Text style={styles.text}>Title: {title}</Text>
        <Text style={styles.text}>
          Description: {description.length ? description : "No description"}
        </Text>
        <Text style={styles.text}>{startDateString}</Text>
        <Text style={styles.text}>{endDateString}</Text>
        <Text style={styles.text}>{categoryString()}</Text>
        <Text style={styles.text}>{repeatString}</Text>
        <Button
          title="Edit"
          onPress={() =>
            navigation.navigate("EventForm", {
              userId: userId,
              isNewEvent: false,
              event: event,
              categories: categories,
            })
          }
        />
        <Button
          title="Delete"
          onPress={() =>
            repeat == "None"
              ? Alert.alert("Confirm delete?", "Event: " + title, [
                  {
                    text: "OK",
                    onPress: () => handleDeleteEvent(),
                  },
                  {
                    text: "Cancel",
                    onPress: () => {},
                  },
                ])
              : Alert.alert("Delete all repeated events?", "", [
                  {
                    text: "All events",
                    onPress: () => handleDeleteAllEvents(),
                  },
                  {
                    text: "This event",
                    onPress: () => handleDeleteEvent(),
                  },
                  {
                    text: "Cancel",
                    onPress: () => {},
                  },
                ])
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around",
  },
  details: {
    padding: 40,
  },
  text: {
    fontSize: 18,
    padding: 10,
  },
});
