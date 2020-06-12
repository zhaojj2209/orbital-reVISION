import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";

import firebase from "../FirebaseDb";

export default function CalendarScreen({ route, navigation }) {
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const { username, userId } = route.params;

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .onSnapshot(
        (querySnapshot) => {
          const results = [];
          querySnapshot.docs.map((documentSnapshot) => {
            const data = documentSnapshot.data();
            results.push({
              key: documentSnapshot.id,
              data: {
                title: data.title,
                description: data.description,
                startDate: data.startDate.toDate(),
                endDate: data.endDate.toDate(),
                category: data.category,
              },
            });
          });
          setEventsLoaded(true);
          setEvents(results);
        },
        (err) => console.error(err)
      );
    return unsubscribe;
  });

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("categories")
      .onSnapshot(
        (querySnapshot) => {
          const results = [];
          querySnapshot.docs.map((documentSnapshot) => {
            const data = documentSnapshot.data();
            results.push({
              key: documentSnapshot.id,
              data: {
                title: data.title,
                colour: data.colour,
              },
            });
          });
          setCategoriesLoaded(true);
          setCategories(results);
        },
        (err) => console.error(err)
      );
    return unsubscribe;
  });

  const getCategoryColour = (categoryId) => {
    const filtered = categories.filter((cat) => cat.key == categoryId);
    return {
      backgroundColor: filtered.length ? filtered[0].data.colour : "#f9c2ff",
    };
  };

  const welcomeText = "Welcome to the calendar view, " + username + "!";
  return eventsLoaded && categoriesLoaded ? (
    <SafeAreaView style={styles.container}>
      <Text>{welcomeText}</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.event,
              getCategoryColour(item.data.category),
            ])}
            onPress={() =>
              navigation.navigate("EventDetails", {
                userId: userId,
                event: item,
                categories: categories,
              })
            }
          >
            <Text style={styles.text}>{item.data.title}</Text>
          </TouchableOpacity>
        )}
      />
      <Button
        title="Create New Event"
        style={styles.button}
        onPress={() =>
          navigation.navigate("EventForm", {
            userId: userId,
            isNewEvent: true,
            event: {},
            categories: categories,
          })
        }
      />
      <Button
        title="Categories"
        style={styles.button}
        onPress={() =>
          navigation.navigate("CategoryList", {
            username: username,
            userId: userId,
          })
        }
      />
      <Button
        title="Logout"
        style={styles.button}
        onPress={() =>
          firebase
            .auth()
            .signOut()
            .then(() => navigation.navigate("Login"))
        }
      />
    </SafeAreaView>
  ) : (
    <ActivityIndicator />
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
  event: {
    flexDirection: "row",
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  text: {
    fontSize: 20,
    padding: 10,
  },
});
