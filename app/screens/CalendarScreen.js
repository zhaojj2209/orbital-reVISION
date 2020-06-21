import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Button,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Agenda } from "react-native-calendars";

import firebase from "../FirebaseDb";
import {
  formatTime,
  formatDateString,
  formatDateObject,
} from "../constants/DateFormats";

export default function CalendarScreen({ route, navigation }) {
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [events, setEvents] = useState([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [agendaItems, setAgendaItems] = useState({});
  const today = formatDateObject(new Date());
  const { userId } = route.params;

  useEffect(() => {
    getEvents();
    getCategories();
  }, [userId]);

  const refreshData = () => {
    setAgendaItems({});
    getEvents();
    getCategories();
    setTimeout(() => loadItems(today), 5000);
  };

  const getEvents = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .orderBy("startDate")
      .get()
      .then((querySnapshot) => {
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
        setEvents(results);
        setEventsLoaded(true);
      })
      .catch((err) => console.error(err));
  };

  const getCategories = () => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("categories")
      .get()
      .then((querySnapshot) => {
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
        setCategories(results);
        setCategoriesLoaded(true);
      })
      .catch((err) => console.error(err));
  };

  const getCategoryColour = (categoryId) => {
    const filtered = categories.filter((cat) => cat.key == categoryId);
    return {
      backgroundColor: filtered.length ? filtered[0].data.colour : "#f9c2ff",
    };
  };

  const timeToString = (time) => formatDateString(new Date(time));

  const loadItems = (day) => {
    setTimeout(() => {
      for (let i = -15; i <= 15; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        agendaItems[strTime] = [];
        const filtered = events.filter((item) => {
          return formatDateString(item.data.startDate) == strTime;
        });
        for (let j = 0; j < filtered.length; j++) {
          agendaItems[strTime].push(filtered[j]);
        }
      }
      const newItems = {};
      Object.keys(agendaItems).forEach((key) => {
        newItems[key] = agendaItems[key];
      });
      setAgendaItems(newItems);
    }, 1000);
  };

  return eventsLoaded && categoriesLoaded ? (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={agendaItems}
        loadItemsForMonth={loadItems}
        onDayChange={loadItems}
        selected={formatDateString(new Date())}
        pastScrollRange={6}
        futureScrollRange={6}
        renderItem={(item) => {
          return (
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
              <Text style={styles.text}>
                {formatTime(item.data.startDate) +
                  " - " +
                  formatTime(item.data.endDate)}
              </Text>
            </TouchableOpacity>
          );
        }}
        renderEmptyDate={() => {
          return (
            <View style={styles.emptyDate}>
              <Text style={styles.text}>Nothing scheduled!</Text>
            </View>
          );
        }}
        rowHasChanged={(r1, r2) => {
          return r1.key !== r2.key;
        }}
        onRefresh={refreshData}
        style={{ flex: 1 }}
      />
      <View style={styles.bottom}>
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
      </View>
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
  },
  event: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
  },
  text: {
    fontSize: 20,
    padding: 10,
  },
  bottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
});
