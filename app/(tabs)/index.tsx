import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import Checkbox from "expo-checkbox";
import { MaterialIcons } from "@expo/vector-icons";
import API from "@/Common/Api";

interface ToDo {
  id: number;
  title: string;
  description: string;
  created_at: string;
  status: string;
}

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  subtext: string;
  border: string;
  primary: string;
}

const lightTheme: ThemeColors = {
  background: "#f5f5f5",
  card: "white",
  text: "#333",
  subtext: "#666",
  border: "#e0e0e0",
  primary: "#2196F3",
};

const darkTheme: ThemeColors = {
  background: "#121212",
  card: "#1e1e1e",
  text: "#ffffff",
  subtext: "#a0a0a0",
  border: "#333333",
  primary: "#64b5f6",
};

const ToDoApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const [toDo, setToDo] = useState<ToDo[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedToDo, setSelectedToDo] = useState<ToDo | null>(null);

  const fetchToDo = async () => {
    try {
      const response = await fetch(API.URL, {
        method: "GET",
        headers: {
          "Content-Type": API.ACC,
          "X-API-Key": API.API,
        },
      });
      const data = await response.json();
      setToDo(data);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch todos");
      console.log(err);
    }
  };

  const addToDo = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Required", "Please enter a title");
      return;
    }
    try {
      const response = await fetch(API.URL, {
        method: "POST",
        headers: {
          "Content-Type": API.ACC,
          "X-API-Key": API.API,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          status: "pending",
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Task added successfully!");
        fetchToDo();
        clearFormAndCloseModal();
      } else {
        Alert.alert("Error", "Failed to add task");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred");
      console.log(err);
    }
  };

  const updateToDo = async () => {
    if (!selectedToDo || !newTitle.trim()) {
      Alert.alert("Required", "Please enter a title");
      return;
    }
    try {
      const response = await fetch(`${API.URL}${selectedToDo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": API.ACC,
          "X-API-Key": API.API,
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          status: selectedToDo.status,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Task updated successfully!");
        fetchToDo();
        clearFormAndCloseModal();
      } else {
        Alert.alert("Error", "Failed to update task");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred");
      console.log(err);
    }
  };

  const toggleStatus = async (todo: ToDo) => {
    try {
      const newStatus = todo.status === "pending" ? "completed" : "pending";
      const response = await fetch(`${API.URL}${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": API.ACC,
          "X-API-Key": API.API,
        },
        body: JSON.stringify({
          ...todo,
          status: newStatus,
        }),
      });

      if (response.ok) {
        fetchToDo();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to update status");
      console.log(err);
    }
  };

  const deleteToDo = async (id: number) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${API.URL}${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": API.ACC,
                "X-API-Key": API.API,
              },
            });

            if (response.ok) {
              fetchToDo();
            } else {
              Alert.alert("Error", "Failed to delete task");
            }
          } catch (err) {
            Alert.alert("Error", "An error occurred");
            console.log(err);
          }
        },
      },
    ]);
  };

  const clearFormAndCloseModal = () => {
    setNewTitle("");
    setNewDescription("");
    setModalVisible(false);
    setIsEditing(false);
    setSelectedToDo(null);
  };

  const handleEdit = (todo: ToDo) => {
    setSelectedToDo(todo);
    setNewTitle(todo.title);
    setNewDescription(todo.description);
    setIsEditing(true);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchToDo();
  }, []);

  const renderItem = ({ item }: { item: ToDo }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.checkboxContainer}>
            <Checkbox
              value={item.status === "completed"}
              onValueChange={() => toggleStatus(item)}
              color={item.status === "completed" ? "#4CAF50" : undefined}
              style={styles.checkbox}
            />
            <Text
              style={[
                styles.title,
                item.status === "completed" && styles.completedText,
              ]}
            >
              {item.title}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={() => handleEdit(item)}
              style={styles.iconButton}
            >
              <MaterialIcons name="edit" size={22} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteToDo(item.id)}
              style={styles.iconButton}
            >
              <MaterialIcons name="delete" size={22} color="#f44336" />
            </TouchableOpacity>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.description}>{item.description}</Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.date}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <View
            style={[
              styles.statusBadge,
              item.status === "completed"
                ? styles.completedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === "completed" ? "Completed" : "Pending"}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
      backgroundColor: theme.card,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
    },
    themeToggle: {
      marginRight: 8,
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
    },
    listContainer: {
      padding: 16,
      paddingBottom: 80,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    checkbox: {
      marginRight: 12,
    },
    title: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.text,
      flex: 1,
    },
    completedText: {
      textDecorationLine: "line-through",
      color: theme.subtext,
    },
    description: {
      marginTop: 8,
      color: theme.subtext,
      fontSize: 14,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 12,
    },
    date: {
      fontSize: 12,
      color: theme.subtext,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    completedBadge: {
      backgroundColor: isDarkMode ? "#1b5e20" : "#E8F5E9",
    },
    pendingBadge: {
      backgroundColor: isDarkMode ? "#552a00" : "#FFF3E0",
    },
    statusText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.text,
    },
    actionButtons: {
      flexDirection: "row",
    },
    iconButton: {
      padding: 8,
    },
    addButton: {
      backgroundColor: theme.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    input: {
      backgroundColor: isDarkMode ? "#333333" : "#f5f5f5",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
      color: theme.text,
    },
    textArea: {
      height: 100,
      textAlignVertical: "top",
    },
    submitButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: "center",
      marginTop: 8,
    },
    disabledButton: {
      backgroundColor: isDarkMode ? "#333333" : "#cccccc",
    },
    submitButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 18,
      color: theme.text,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.subtext,
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <MaterialIcons
              name={isDarkMode ? "light-mode" : "dark-mode"}
              size={24}
              color={theme.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={toDo}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={clearFormAndCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? "Edit Task" : "New Task"}
              </Text>
              <TouchableOpacity
                onPress={clearFormAndCloseModal}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor={theme.subtext}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={theme.subtext}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                !newTitle.trim() && styles.disabledButton,
              ]}
              onPress={isEditing ? updateToDo : addToDo}
              disabled={!newTitle.trim()}
            >
              <Text style={styles.submitButtonText}>
                {isEditing ? "Update Task" : "Add Task"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ToDoApp;
