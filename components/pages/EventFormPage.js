import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

import firebase from "../firebaseDb";

export default class EventFormPage extends React.Component {
  state = {
    title: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(),
  };

  componentDidMount() {
    const { route } = this.props;
    const { isNewEvent, event } = route.params;
    if (!isNewEvent) {
      const { title, description, startDate, endDate } = event.data;
      this.setState({
        title: title,
        description: description,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      });
    }
  }

  handleCreateEvent = (userId, navigation) =>
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .add(this.state)
      .then(() => {
        this.setState({
          title: "",
          description: "",
          startDate: new Date(),
          endDate: new Date(),
        });
        Alert.alert("Event Created", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ]);
      })
      .catch((err) => console.error(err));

  handleEditEvent = (userId, eventId, navigation) =>
    firebase
      .firestore()
      .collection("users")
      .doc(userId)
      .collection("events")
      .doc(eventId)
      .set(this.state)
      .then(() => {
        this.setState({
          title: "",
          description: "",
          startDate: new Date(),
          endDate: new Date(),
        });
        Alert.alert("Event Edited Successfully", "", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Calendar"),
          },
        ]);
      })
      .catch((err) => console.error(err));

  handleUpdateTitle = (title) => this.setState({ title });

  handleUpdateDescription = (description) => this.setState({ description });

  handleUpdateStartDate = (date) =>
    this.setState({ startDate: date, endDate: date });

  handleUpdateEndDate = (date) => this.setState({ endDate: date });

  render() {
    const { title, description, startDate, endDate } = this.state;
    const { route, navigation } = this.props;
    const { userId, isNewEvent, event } = route.params;

    return (
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
          <TextInput
            style={styles.textInput}
            placeholder="Event"
            onChangeText={this.handleUpdateTitle}
            value={title}
          />
          <TextInput
            style={styles.textInput}
            placeholder="Description"
            onChangeText={this.handleUpdateDescription}
            value={description}
          />
          <Button
            onPress={() =>
              navigation.navigate("DatePicker", {
                initialDate: startDate,
                handleUpdateDate: this.handleUpdateStartDate,
              })
            }
            title="Start Date:"
          />
          <Text>{startDate.toString()}</Text>
          <Button
            onPress={() =>
              navigation.navigate("DatePicker", {
                initialDate: endDate,
                handleUpdateDate: this.handleUpdateEndDate,
              })
            }
            title="End Date:"
          />
          <Text>{endDate.toString()}</Text>
          <Button
            title={isNewEvent ? "Create Event" : "Edit Event"}
            style={styles.button}
            onPress={() => {
              if (title.length) {
                if (isNewEvent) {
                  this.handleCreateEvent(userId, navigation);
                } else {
                  this.handleEditEvent(userId, event.key, navigation);
                }
              }
            }}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    marginBottom: 40,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "black",
    fontSize: 20,
    marginBottom: 20,
    paddingLeft: 10,
    width: 200,
    height: 40,
  },
  button: {
    marginTop: 42,
  },
});
