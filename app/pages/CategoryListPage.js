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
} from "react-native";

import firebase from "../FirebaseDb";

export default function CategoryList({ route, navigation }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [categories, setCategories] = useState(null);
  const { userId, onGoBack } = route.params;

  useEffect(() => getCategories(), [userId]);

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
        setIsLoaded(true);
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteCategory = (categoryId) => {
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("categories")
      .doc(categoryId)
      .delete()
      .then(() => {
        firebase
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("events")
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
            onPress: () => {
              onGoBack();
              getCategories();
            },
          },
        ]);
      });
  };

  return isLoaded ? (
    <SafeAreaView style={styles.container}>
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
                    onGoBack: () => {
                      onGoBack();
                      getCategories();
                    },
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
            onGoBack: () => {
              onGoBack();
              getCategories();
            },
          })
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
  card: {
    borderRadius: 6,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: "#333",
    shadowOpacity: 0.3,
    margin: 6,
    width: 350,
    backgroundColor: "#f9c2ff",
  },
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
