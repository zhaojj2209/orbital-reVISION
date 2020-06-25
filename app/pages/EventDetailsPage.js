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
import { formatDate, formatTime } from "../constants/DateFormats";

export default function EventDetailsPage({ route, navigation }) {
  const { userId, event, categories, onGoBack } = route.params;
  const { title, description, startDate, endDate, category } = event.data;

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
            onPress: () => {
              onGoBack();
              navigation.navigate("Calendar");
            },
          },
        ])
      );
  };

  const startDateString =
    "Start: " + formatDate(startDate) + " " + formatTime(startDate);
  const endDateString =
    "End: " + formatDate(endDate) + " " + formatTime(endDate);

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
        <Button
          title="Edit"
          onPress={() =>
            navigation.navigate("EventForm", {
              userId: userId,
              isNewEvent: false,
              event: event,
              categories: categories,
              onGoBack: onGoBack,
            })
          }
        />
        <Button
          title="Delete"
          onPress={() =>
            Alert.alert("Confirm delete?", "Event: " + title, [
              {
                text: "OK",
                onPress: () => handleDeleteEvent(event.key),
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
