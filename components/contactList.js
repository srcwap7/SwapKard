import React, { useRef, useState } from 'react';
import { View, Text, FlatList, StatusBar, TextInput } from 'react-native';
import { useSelector } from 'react-redux';
import ContactCard from './ContactCard';
import Ionicons from 'react-native-vector-icons/Ionicons';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: StatusBar.currentHeight || 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderColor: '#292929',
    borderWidth: 1,
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    elevation: 3,
  },
  emptyText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  separator: {
    height: 12,
  },
};

const ContactsPage = ({ route }) => {
  const domref = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const User = useSelector((state) => state.user);
  const { socket } = route.params;

  const filteredContacts = User.user.contactList.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#BBBBBB" style={styles.searchIcon} />
        <TextInput
          placeholder="Search contacts..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        ref={domref}
        style={styles.flatList}
        data={filteredContacts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ContactCard
            id={item._id}
            name={item.name}
            job={item.job}
            workAt={item.workAt}
            phoneNo={item.phone}
            email={item.email}
            socket={socket}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No connections found
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ContactsPage;
