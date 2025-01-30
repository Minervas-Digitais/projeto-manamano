/* eslint-disable global-require */
import React, { useState, useEffect } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useFonts } from 'expo-font';
import { MMKV } from 'react-native-mmkv';
import {
  PageContainer,
  SearchHeader,
  Title,
  SearchInputWrapper,
  SearchIcon,
  RecentSection,
  ContentContainer,
  Avatar,
} from './SearchStyle';
import ResultSection from '../../components/ResultSection/ResultSection';
import BackButton from '../../components/BackButton/BackButton';

// Setup MMKV storage
const storage = new MMKV();

// Interface for a user
interface User {
  id: number;
  name: string;
  avatar: any;
}

// Main Search Component
export default function Search() {
  const BackArrow = require('../../assets/back-arrow.svg');
  const Lupa = require('../../assets/lupa-search.svg');

  const [fontsLoaded] = useFonts({
    'inter-bold': require('../../fonts/Inter-Bold.ttf'),
    'inter-regular': require('../../fonts/Inter-Regular.ttf'),
  });

  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);

  // Fetch recent users from MMKV on mount
  useEffect(() => {
    const storedUsers = storage.getString('recentUsers');
    if (storedUsers) {
      setRecentUsers(JSON.parse(storedUsers));
    }
  }, []);

  const saveRecentUser = (user: User) => {
    // Check if user already exists in recent users
    const updatedUsers = [user, ...recentUsers.filter((u) => u.id !== user.id)];

    // Enforce a limit of 10 users (FIFO)
    if (updatedUsers.length > 10) {
      updatedUsers.pop();
    }

    // Save to state
    setRecentUsers(updatedUsers);

    // Save to MMKV
    storage.set('recentUsers', JSON.stringify(updatedUsers));
  };

  const handleAvatarPress = (userId: number) => {
    console.log(`Avatar clicked: ${userId}`);
  };

  const screenWidth = Dimensions.get('window').width;

  useEffect(
    () =>
      // Cleanup timeout on unmount
      () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      },
    [timeoutId],
  );

  if (!fontsLoaded) {
    return undefined; // Or a loader of your choice
  }

  const handleSearchChange = (text: string) => {
    setSearchText(text);

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    const id = setTimeout(() => {
      setDebouncedSearchText(text);

      // Only update debouncedSearchText; no recent user addition here
    }, 2000);
    setTimeoutId(id);
  };

  return (
    <PageContainer>
      <SearchHeader>
        <BackButton />
        <Title style={{ fontFamily: 'inter-bold' }}>Pesquisa</Title>
      </SearchHeader>

      <ContentContainer style={{ flex: 1 }}>
        <SearchInputWrapper>
          <SearchIcon>
            <Image source={Lupa} />
          </SearchIcon>
          <TextInput
            placeholder="Pesquisar"
            value={searchText}
            onChangeText={handleSearchChange}
            style={{
              flex: 1,
              fontSize: 16,
              color: '#ABAFB1',
              padding: 0,
              margin: 0,
              borderWidth: 0,
              outline: 'none',
              boxShadow: 'none',
              fontFamily: 'inter-regular',
            }}
          />
        </SearchInputWrapper>

        {debouncedSearchText.length > 0 ? (
          <ResultSection searchText={debouncedSearchText} saveRecentUser={saveRecentUser} />
        ) : (
          <RecentSection>
            {recentUsers.length > 0 && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginBottom: 10,
                  fontFamily: 'inter-bold',
                  color: '#515151',
                }}
              >
                Recentes
              </Text>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              style={{ flexDirection: 'row', paddingLeft: 10 }}
            >
              {recentUsers.map((user) => {
                const nameParts = user.name.split(' ');
                return (
                  <View key={user.id} style={{ alignItems: 'center', marginRight: 20 }}>
                    <TouchableOpacity onPress={() => handleAvatarPress(user.id)}>
                      <Image
                        source={user.avatar}
                        style={{
                          width: screenWidth / 8,
                          height: screenWidth / 8,
                          borderRadius: screenWidth / 8 / 2,
                        }}
                      />
                    </TouchableOpacity>

                    {nameParts.length >= 2 ? (
                      <View>
                        <TouchableOpacity onPress={() => handleAvatarPress(user.id)}>
                          <Text
                            style={{
                              textAlign: 'center',
                              fontFamily: 'inter-regular',
                              fontSize: 10,
                            }}
                          >
                            {nameParts[0]}
                          </Text>
                          <Text
                            style={{
                              textAlign: 'center',
                              fontFamily: 'inter-regular',
                              fontSize: 10,
                            }}
                          >
                            {nameParts[1]}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View>
                        <TouchableOpacity onPress={() => handleAvatarPress(user.id)}>
                          <Text
                            style={{
                              textAlign: 'center',
                              fontFamily: 'inter-regular',
                              fontSize: 10,
                            }}
                          >
                            {user.name}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </RecentSection>
        )}
      </ContentContainer>
    </PageContainer>
  );
}
