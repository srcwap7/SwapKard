import React, { useState , useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import { useSelector } from 'react-redux';
import ProfileCard from './ProfileCard';
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark background color
    paddingTop: StatusBar.currentHeight || 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  flatList: {
    flex: 1,
    padding: 16,
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
  loadingIndicator: {
    color: '#BB86FC',
  },
  separator: {
    height: 12,
  },
};

const PendingUsersPage = ({route}) => {
  const domref = useRef(null);
  const User = useSelector((state) => state.user);
  const {socket} = route.params;
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <FlatList ref={domref}
        style={styles.flatList}
        data={User.user.pendingList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ProfileCard
            id={item._id}
            name={item.name}
            age={item.age}
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
              No pending connection requests at the moment
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default PendingUsersPage;