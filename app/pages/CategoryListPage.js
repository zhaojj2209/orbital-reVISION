import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Button,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";

import { getCategoriesDb, getEventsDb } from "../FirebaseDb";

export default function CategoryList({ route, navigation }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [categories, setCategories] = useState(null);
  const { userId } = route.params;
  const isFocused = useIsFocused();

  useEffect(() => getCategories(), [isFocused]);
  const categoriesDb = getCategoriesDb(userId);
  const eventsDb = getEventsDb(userId);

  const getCategories = () => {
    categoriesDb
      .orderBy("title")
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
        setIsLoaded(true);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteCategory = (categoryId) => {
    categoriesDb
      .doc(categoryId)
      .delete()
      .then(() => {
        eventsDb
          .where("category", "==", categoryId)
          .get()
          .then((querySnapshot) => {
            querySnapshot.docs.forEach((documentSnapshot) => {
              documentSnapshot.ref.delete();
            });
          })
          .catch((err) => console.error(err));
        Alert.alert("Category Deleted", "", [
          {
            text: "OK",
            onPress: () => getCategories(),
          },
        ]);
      });
  };

  return isLoaded ? (
    <SafeAreaView style={styles.container}>
      <View style={styles.box}>
        <FlatList
          data={categories}
          renderItem={({ item }) => (
            <View
              style={StyleSheet.flatten([
                styles.card,
                { backgroundColor: item.data.colour },
              ])}
            >
              <Text style={styles.text}>{item.data.title}</Text>
              <View style={styles.buttonRow}>
                <Button
                  title="Edit"
                  style={styles.button}
                  onPress={() =>
                    navigation.navigate("CategoryForm", {
                      userId: userId,
                      isNewCategory: false,
                      category: item,
                    })
                  }
                />
                <Button
                  title="Delete"
                  style={styles.button}
                  onPress={() =>
                    Alert.alert(
                      "Confirm delete?",
                      "This will delete all events in the category as well!",
                      [
                        {
                          text: "OK",
                          onPress: () => handleDeleteCategory(item.key),
                        },
                        {
                          text: "Cancel",
                          onPress: () => {},
                        },
                      ]
                    )
                  }
                />
              </View>
            </View>
          )}
        />
        <Button
          title="Create New Category"
          style={styles.button}
          onPress={() =>
            navigation.navigate("CategoryForm", {
              userId: userId,
              isNewCategory: true,
              category: {},
            })
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
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#fafafa",
  },
  card: {
    borderRadius: 6,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    margin: 6,
    width: Dimensions.get("window").width - 44,
    backgroundColor: "#f9c2ff",
  },
  box: { marginTop: 10, paddingHorizontal: 18 },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  category: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  text: {
    fontSize: 20,
    padding: 12,
  },
});
